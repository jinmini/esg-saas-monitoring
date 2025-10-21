"""
벡터스토어 모듈 (배포 최적화: ChromaDB 의존성 제거)
"""

# ChromaDB는 개발 환경에서만 사용 (조건부 import)
try:
    from .chroma_manager import ChromaManager, E5EmbeddingFunction
    from .embed_pipeline import ESGEmbeddingPipeline, embed_esg_standards
    from .refresh_task import VectorRefreshTask, get_refresh_task
    _chroma_available = True
except ImportError:
    _chroma_available = False
    ChromaManager = None
    E5EmbeddingFunction = None
    ESGEmbeddingPipeline = None
    embed_esg_standards = None
    VectorRefreshTask = None
    get_refresh_task = None

# JSON Vector Store는 항상 사용 가능
from .json_vector_store import JSONVectorStore, get_json_vector_store

__all__ = [
    # ChromaDB (optional)
    "ChromaManager",
    "E5EmbeddingFunction",
    "ESGEmbeddingPipeline",
    "embed_esg_standards",
    "VectorRefreshTask",
    "get_refresh_task",
    # JSON Vector Store (always available)
    "JSONVectorStore",
    "get_json_vector_store",
    "_chroma_available"
]

