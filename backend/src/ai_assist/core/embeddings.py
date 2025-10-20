"""
HuggingFace multilingual-e5-base 임베딩 초기화 모듈
ESG 표준 문서를 벡터화하기 위한 임베딩 모델 제공
"""
import logging
from typing import List, Optional
from sentence_transformers import SentenceTransformer
import torch
import threading

logger = logging.getLogger(__name__)


class E5Embeddings:
    """
    intfloat/multilingual-e5-base 임베딩 모델
    - 다국어 지원 (한글, 영어)
    - 768차원 벡터
    - ESG 문서 검색에 최적화
    """
    
    def __init__(
        self,
        model_name: str = "intfloat/multilingual-e5-base",
        device: Optional[str] = None,
        normalize_embeddings: bool = True
    ):
        """
        Args:
            model_name: HuggingFace 모델 이름
            device: 'cuda', 'cpu', None(auto-detect)
            normalize_embeddings: L2 정규화 여부 (코사인 유사도 계산용)
        """
        self.model_name = model_name
        self.normalize_embeddings = normalize_embeddings
        
        # Device 설정
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
        
        logger.info(f"Loading embedding model: {model_name} on {self.device}")
        
        try:
            self.model = SentenceTransformer(model_name, device=self.device)
            logger.info(f"✅ Embedding model loaded successfully (dim: {self.get_dimension()})")
            
            # GPU 메모리 모니터링
            if self.device == "cuda" and torch.cuda.is_available():
                reserved_gb = torch.cuda.memory_reserved() / 1e9
                allocated_gb = torch.cuda.memory_allocated() / 1e9
                logger.info(f"CUDA memory - Reserved: {reserved_gb:.2f} GB, Allocated: {allocated_gb:.2f} GB")
        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {e}")
            raise
    
    def get_dimension(self) -> int:
        """임베딩 차원 반환 (e5-base: 768)"""
        return self.model.get_sentence_embedding_dimension()
    
    def embed_query(self, text: str) -> List[float]:
        """
        검색 쿼리 임베딩 (단일 텍스트)
        e5 모델은 query와 passage에 다른 prefix 사용 권장
        
        Args:
            text: 검색 쿼리 텍스트
            
        Returns:
            768차원 임베딩 벡터
        """
        # e5 모델 권장: query에 "query: " prefix 추가
        prefixed_text = f"query: {text}"
        
        try:
            embedding = self.model.encode(
                prefixed_text,
                normalize_embeddings=self.normalize_embeddings,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Query embedding failed: {e}")
            raise
    
    def embed_documents(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """
        문서 임베딩 (배치 처리)
        
        Args:
            texts: 임베딩할 텍스트 리스트
            batch_size: 배치 크기
            
        Returns:
            임베딩 벡터 리스트
        """
        # e5 모델 권장: passage에 "passage: " prefix 추가
        prefixed_texts = [f"passage: {text}" for text in texts]
        
        try:
            embeddings = self.model.encode(
                prefixed_texts,
                batch_size=batch_size,
                normalize_embeddings=self.normalize_embeddings,
                show_progress_bar=True,
                convert_to_numpy=True
            )
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Document embedding failed: {e}")
            raise
    
    def __call__(self, text: str) -> List[float]:
        """편의 메서드: 단일 텍스트 임베딩"""
        return self.embed_query(text)


# Singleton 인스턴스 (Thread-safe)
_embeddings_instance: Optional[E5Embeddings] = None
_lock = threading.Lock()


def get_embeddings() -> E5Embeddings:
    """
    전역 임베딩 인스턴스 반환 (싱글톤 패턴, Thread-safe)
    메모리 효율을 위해 하나의 모델만 로드
    멀티스레드 환경(Uvicorn workers)에서 race condition 방지
    """
    global _embeddings_instance
    
    if _embeddings_instance is None:
        with _lock:
            # Double-checked locking
            if _embeddings_instance is None:
                _embeddings_instance = E5Embeddings()
    
    return _embeddings_instance


def reset_embeddings():
    """임베딩 인스턴스 초기화 (테스트용)"""
    global _embeddings_instance
    _embeddings_instance = None
