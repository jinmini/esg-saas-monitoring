"""
임베딩 서비스 Factory Pattern

환경에 따라 적절한 임베딩 서비스를 선택:
- 로컬 개발: SentenceTransformer (intfloat/multilingual-e5-base)
- Render 배포: Gemini Embedding API (완전 무료, 저메모리)
"""

from typing import Union
import logging

from .gemini_embeddings import GeminiEmbeddingService
from ..config import get_ai_config

# E5Embeddings는 선택적 (개발 환경에서만)
try:
    from .embeddings import E5Embeddings
    _e5_available = True
except ImportError:
    _e5_available = False
    E5Embeddings = None

logger = logging.getLogger(__name__)


def get_embedding_service() -> Union[E5Embeddings, GeminiEmbeddingService]:
    """
    환경에 따라 적절한 임베딩 서비스 반환
    
    선택 기준:
    - USE_GEMINI_EMBEDDING=true: Gemini API (Render Free Tier)
    - USE_GEMINI_EMBEDDING=false: SentenceTransformer (로컬 개발)
    
    Returns:
        임베딩 서비스 인스턴스
    
    Example:
        >>> embeddings = get_embedding_service()
        >>> query_embedding = embeddings.embed_query("ESG 보고서")
    """
    config = get_ai_config()
    
    use_gemini = config.USE_GEMINI_EMBEDDING
    
    if use_gemini:
        logger.info(
            "[GEMINI] Using Gemini Embedding API "
            "(Render Free Tier optimized: RAM < 100MB)"
        )
        return GeminiEmbeddingService(api_key=config.GEMINI_API_KEY)
    else:
        # E5Embeddings 사용 가능 여부 확인
        if not _e5_available:
            raise ImportError(
                "sentence_transformers가 설치되지 않았습니다. "
                "개발 환경: pip install -r requirements/dev.txt, "
                "배포 환경: USE_GEMINI_EMBEDDING=true로 설정하세요."
            )
        
        logger.info(
            "[LOCAL] Using Local SentenceTransformer "
            "(Development mode: intfloat/multilingual-e5-base)"
        )
        return E5Embeddings(
            model_name=config.EMBEDDING_MODEL,
            device=config.EMBEDDING_DEVICE
        )

