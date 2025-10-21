"""
AI Assist Core 모듈 (배포 최적화: 선택적 의존성)
"""
from .gemini_client import get_gemini_client, GeminiClient
from .embeddings_factory import get_embedding_service
from .gemini_embeddings import GeminiEmbeddingService

# E5Embeddings는 선택적 (개발 환경에서만)
try:
    from .embeddings import get_embeddings, E5Embeddings
    _e5_available = True
except ImportError:
    _e5_available = False
    get_embeddings = None
    E5Embeddings = None

__all__ = [
    "get_gemini_client",
    "GeminiClient",
    "get_embedding_service",
    "GeminiEmbeddingService",
    "get_embeddings",
    "E5Embeddings",
    "_e5_available"
]

