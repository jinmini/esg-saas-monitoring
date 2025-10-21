"""
Gemini Embedding API 기반 임베딩 서비스

Render Free Tier 환경 최적화:
- RAM 사용량: < 100MB (PyTorch 모델 대비 88% 절감)
- 완전 무료 (Rate Limit: 1,500 RPM, 50,000 RPD)
- 안정화 모델: gemini-embedding-001 (768차원)

References:
- https://ai.google.dev/gemini-api/docs/embeddings?hl=ko
- https://ai.google.dev/gemini-api/docs/rate-limits?hl=ko
"""

from typing import List, Optional
from google import genai
import logging

logger = logging.getLogger(__name__)


class GeminiEmbeddingService:
    """
    Gemini Embedding API 기반 임베딩 서비스
    
    Features:
    - 768차원 임베딩 (multilingual-e5-base와 호환)
    - RETRIEVAL_QUERY task type (검색 최적화)
    - 배치 임베딩 지원
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Gemini API Key (None이면 환경 변수 사용)
        """
        from ..config import get_ai_config
        config = get_ai_config()
        
        self.client = genai.Client(api_key=api_key or config.GEMINI_API_KEY)
        self.model_name = "gemini-embedding-001"  # 안정화 버전 (2025년 6월 업데이트)
        self.embedding_dimension = 768
        
        logger.info(
            f"[OK] GeminiEmbeddingService initialized "
            f"(model: {self.model_name}, dim: {self.embedding_dimension})"
        )
    
    def embed_query(self, text: str) -> List[float]:
        """
        단일 텍스트 임베딩 생성 (사용자 쿼리용)
        
        Args:
            text: 임베딩할 텍스트 (최대 2,048 토큰)
        
        Returns:
            768차원 임베딩 벡터
        
        Raises:
            Exception: API 호출 실패 시
        
        Example:
            >>> service = GeminiEmbeddingService()
            >>> embedding = service.embed_query("임직원 교육 프로그램")
            >>> len(embedding)
            768
        """
        try:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=text,
                config={"output_dimensionality": self.embedding_dimension}  # 768차원으로 축소
            )
            
            # result.embeddings는 list of Embedding objects
            # 단일 텍스트이므로 첫 번째 요소의 values 반환
            embedding_values = result.embeddings[0].values
            
            logger.debug(
                f"Generated embedding for text "
                f"(length: {len(text)} chars, dim: {len(embedding_values)})"
            )
            return embedding_values
            
        except Exception as e:
            logger.error(f"❌ Gemini embedding generation failed: {e}")
            raise
    
    def embed_documents(
        self, 
        texts: List[str], 
        batch_size: int = 100
    ) -> List[List[float]]:
        """
        배치 텍스트 임베딩 생성 (사전 생성 스크립트용)
        
        Args:
            texts: 임베딩할 텍스트 리스트
            batch_size: 배치 크기 (Gemini API는 자동 최적화, 참고용)
        
        Returns:
            임베딩 벡터 리스트
        
        Note:
            - Gemini API는 한 번에 여러 텍스트를 처리 가능
            - Rate Limit: 1,500 RPM (분당 요청)
        
        Example:
            >>> service = GeminiEmbeddingService()
            >>> embeddings = service.embed_documents([
            ...     "GRI 404-1: Employee Training",
            ...     "GRI 305-1: Direct GHG Emissions"
            ... ])
            >>> len(embeddings)
            2
        """
        try:
            result = self.client.models.embed_content(
                model=self.model_name,
                contents=texts,
                config={"output_dimensionality": self.embedding_dimension}  # 768차원으로 축소
            )
            
            embeddings = [emb.values for emb in result.embeddings]
            logger.info(f"✅ Generated {len(embeddings)} embeddings")
            return embeddings
            
        except Exception as e:
            logger.error(f"❌ Batch embedding generation failed: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """
        임베딩 차원 반환
        
        Returns:
            768 (gemini-embedding-001 고정 차원)
        """
        return self.embedding_dimension


def get_gemini_embeddings(api_key: Optional[str] = None) -> GeminiEmbeddingService:
    """
    GeminiEmbeddingService 인스턴스 생성 헬퍼
    
    Args:
        api_key: Gemini API Key (선택사항)
    
    Returns:
        GeminiEmbeddingService 인스턴스
    """
    return GeminiEmbeddingService(api_key=api_key)

