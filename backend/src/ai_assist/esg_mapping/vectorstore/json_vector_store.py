"""
JSON Vector Store - ChromaDB 대체 경량 벡터 검색
코사인 유사도 기반 순수 Python 구현
"""
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import numpy as np
from functools import lru_cache

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    """검색 결과"""
    id: str
    framework: str
    category: str
    topic: str
    title: str
    description: str
    keywords: List[str]
    similarity: float
    metadata: Dict[str, Any]


class JSONVectorStore:
    """
    JSON 파일 기반 벡터 스토어
    
    특징:
    - 완전 무료 (외부 DB 불필요)
    - 빠른 검색 (182개 문서 ~3ms)
    - 메모리 캐싱 (첫 로드 후 즉시 응답)
    """
    
    def __init__(self, json_path: str):
        """
        Args:
            json_path: esg_vectors.json 파일 경로
        """
        self.json_path = Path(json_path)
        self._data: Optional[Dict[str, Any]] = None
        self._embeddings: Optional[np.ndarray] = None
        self._documents: Optional[List[Dict[str, Any]]] = None
        
        if not self.json_path.exists():
            raise FileNotFoundError(f"Vector JSON not found: {json_path}")
        
        logger.info(f"JSONVectorStore initialized with: {json_path}")
    
    def _load_data(self):
        """JSON 파일 로드 (lazy loading + 메모리 캐싱)"""
        if self._data is not None:
            return  # Already loaded
        
        logger.info(f"Loading vector data from: {self.json_path}")
        start_time = logger.time() if hasattr(logger, 'time') else None
        
        with open(self.json_path, 'r', encoding='utf-8') as f:
            self._data = json.load(f)
        
        self._documents = self._data['documents']
        
        # 임베딩을 NumPy 배열로 변환 (빠른 계산)
        embeddings_list = [doc['embedding'] for doc in self._documents]
        self._embeddings = np.array(embeddings_list, dtype=np.float32)
        
        # L2 정규화 (코사인 유사도를 내적으로 계산 가능)
        norms = np.linalg.norm(self._embeddings, axis=1, keepdims=True)
        self._embeddings = self._embeddings / norms
        
        logger.info(
            f"✅ Loaded {len(self._documents)} documents "
            f"(dim: {self._embeddings.shape[1]})"
        )
    
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        min_similarity: float = 0.0,
        frameworks: Optional[List[str]] = None
    ) -> List[SearchResult]:
        """
        코사인 유사도 기반 벡터 검색
        
        Args:
            query_embedding: 쿼리 임베딩 벡터 (768-dim)
            top_k: 반환할 결과 개수
            min_similarity: 최소 유사도 (0~1)
            frameworks: 필터링할 프레임워크 리스트 (e.g., ["GRI", "SASB"])
        
        Returns:
            검색 결과 리스트 (유사도 높은 순)
        """
        self._load_data()
        
        # 1. 쿼리 벡터 정규화
        query_vec = np.array(query_embedding, dtype=np.float32)
        query_vec = query_vec / np.linalg.norm(query_vec)
        
        # 2. 코사인 유사도 계산 (정규화된 벡터의 내적)
        similarities = np.dot(self._embeddings, query_vec)
        
        # 3. 프레임워크 필터링 (옵션)
        if frameworks:
            framework_mask = np.array([
                doc['framework'] in frameworks 
                for doc in self._documents
            ])
            similarities = np.where(framework_mask, similarities, -1.0)
        
        # 4. Top-K 선택 (argpartition 사용 - O(N))
        if top_k >= len(similarities):
            top_indices = np.argsort(similarities)[::-1]
        else:
            # argpartition은 정렬 없이 Top-K를 찾음 (더 빠름)
            partition_indices = np.argpartition(similarities, -top_k)[-top_k:]
            top_indices = partition_indices[np.argsort(similarities[partition_indices])][::-1]
        
        # 5. 결과 생성
        results = []
        for idx in top_indices:
            similarity = float(similarities[idx])
            
            # 최소 유사도 필터
            if similarity < min_similarity:
                continue
            
            doc = self._documents[idx]
            result = SearchResult(
                id=doc['id'],
                framework=doc['framework'],
                category=doc['category'],
                topic=doc['topic'],
                title=doc['title'],
                description=doc['description'],
                keywords=doc['keywords'],
                similarity=similarity,
                metadata=doc.get('metadata', {})
            )
            results.append(result)
        
        return results
    
    def get_stats(self) -> Dict[str, Any]:
        """벡터 스토어 통계 정보"""
        self._load_data()
        
        return {
            "total_documents": len(self._documents),
            "embedding_dim": self._embeddings.shape[1],
            "embedding_model": self._data['metadata']['embedding_model'],
            "memory_size_mb": self._embeddings.nbytes / 1024 / 1024,
            "file_size_mb": self.json_path.stat().st_size / 1024 / 1024,
        }


# ============================================
# 싱글톤 인스턴스
# ============================================

_vector_store_instance: Optional[JSONVectorStore] = None


def get_json_vector_store(json_path: Optional[str] = None) -> JSONVectorStore:
    """
    JSONVectorStore 싱글톤 인스턴스 반환
    
    Args:
        json_path: JSON 파일 경로 (첫 호출 시 필수)
    
    Returns:
        JSONVectorStore 인스턴스
    """
    global _vector_store_instance
    
    if _vector_store_instance is None:
        if json_path is None:
            # 기본 경로 (프로덕션)
            json_path = str(Path(__file__).parent.parent.parent.parent.parent.parent / 
                           "frontend" / "public" / "data" / "esg_vectors.json")
        
        _vector_store_instance = JSONVectorStore(json_path)
    
    return _vector_store_instance


def reset_json_vector_store():
    """테스트용: 싱글톤 리셋"""
    global _vector_store_instance
    _vector_store_instance = None

