"""
ESG 표준 데이터 임베딩 파이프라인
JSONL → Embedding → ChromaDB 전체 프로세스
"""
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import time
import torch

from ..loaders.jsonl_loader import JSONLLoader, MultiFileJSONLLoader, ESGStandardDocument
from .chroma_manager import ChromaManager, E5EmbeddingFunction
from ...core.embeddings import get_embeddings

logger = logging.getLogger(__name__)


@dataclass
class EmbeddingStats:
    """임베딩 통계"""
    total_documents: int = 0
    successful: int = 0
    failed: int = 0
    duration_seconds: float = 0.0
    avg_time_per_doc: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_documents": self.total_documents,
            "successful": self.successful,
            "failed": self.failed,
            "duration_seconds": round(self.duration_seconds, 2),
            "avg_time_per_doc": round(self.avg_time_per_doc, 4)
        }


class ESGEmbeddingPipeline:
    """
    ESG 표준 문서 임베딩 파이프라인
    
    프로세스:
    1. JSONL 파일 로드
    2. 텍스트 추출 및 전처리
    3. 임베딩 생성
    4. ChromaDB에 저장
    """
    
    def __init__(
        self,
        data_dir: Path,
        chroma_persist_dir: Path = Path("./data/chroma"),
        collection_name: str = "esg_standards",
        batch_size: int = 32,
        language: str = "en"
    ):
        """
        Args:
            data_dir: JSONL 파일 디렉토리
            chroma_persist_dir: ChromaDB 저장 경로
            collection_name: 컬렉션 이름
            batch_size: 임베딩 배치 크기
            language: 텍스트 언어 ('en' or 'ko')
        """
        self.data_dir = Path(data_dir)
        self.chroma_persist_dir = Path(chroma_persist_dir)
        self.collection_name = collection_name
        self.language = language
        
        # 임베딩 모델 초기화
        logger.info("Initializing embedding model...")
        self.embeddings = get_embeddings()
        
        # GPU Memory-aware batch size 자동 조정
        if torch.cuda.is_available():
            total_mem_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
            if total_mem_gb < 8:
                self.batch_size = 16
                logger.warning(f"GPU memory < 8GB detected ({total_mem_gb:.1f}GB), reducing batch_size to 16")
            elif total_mem_gb >= 16:
                self.batch_size = 64
                logger.info(f"GPU memory >= 16GB detected ({total_mem_gb:.1f}GB), increasing batch_size to 64")
            else:
                self.batch_size = batch_size
        else:
            self.batch_size = batch_size
        
        logger.info(f"Using batch_size: {self.batch_size}")
        
        # ChromaDB 매니저 초기화
        logger.info("Initializing ChromaDB...")
        embedding_function = E5EmbeddingFunction(self.embeddings)
        self.chroma = ChromaManager(
            persist_directory=str(chroma_persist_dir),
            collection_name=collection_name,
            embedding_function=embedding_function
        )
        
        logger.info("✅ Pipeline initialized")
    
    def process_single_file(
        self,
        file_path: Path,
        reset: bool = False
    ) -> EmbeddingStats:
        """
        단일 JSONL 파일 처리
        
        Args:
            file_path: JSONL 파일 경로
            reset: True면 기존 데이터 삭제 후 처리
            
        Returns:
            EmbeddingStats
        """
        logger.info(f"{'='*60}")
        logger.info(f"Processing file: {file_path.name}")
        logger.info(f"{'='*60}")
        
        if reset:
            logger.warning("Resetting ChromaDB collection...")
            self.chroma.reset()
        
        start_time = time.time()
        stats = EmbeddingStats()
        
        # JSONL 로드
        loader = JSONLLoader(file_path)
        documents: List[ESGStandardDocument] = []
        
        try:
            documents = loader.load_all()
            stats.total_documents = len(documents)
            
            if not documents:
                logger.warning("No documents loaded")
                return stats
            
            # 배치 처리
            for i in range(0, len(documents), self.batch_size):
                batch = documents[i:i + self.batch_size]
                batch_num = i // self.batch_size + 1
                total_batches = (len(documents) + self.batch_size - 1) // self.batch_size
                
                logger.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} docs)...")
                
                try:
                    self._process_batch(batch)
                    stats.successful += len(batch)
                    
                    # 중간 체크포인트: 10 배치마다 persist (장시간 실행 대비)
                    if batch_num % 10 == 0:
                        logger.info(f"Checkpoint: persisting data at batch {batch_num}...")
                        # ChromaDB는 자동 persist지만 명시적 호출 가능
                        
                except Exception as e:
                    logger.error(f"Batch {batch_num} failed: {e}")
                    stats.failed += len(batch)
            
            # 통계 계산
            stats.duration_seconds = time.time() - start_time
            if stats.successful > 0:
                stats.avg_time_per_doc = stats.duration_seconds / stats.successful
            
            logger.info(f"{'='*60}")
            logger.info(f"✅ Processing complete:")
            logger.info(f"  - Total: {stats.total_documents}")
            logger.info(f"  - Success: {stats.successful}")
            logger.info(f"  - Failed: {stats.failed}")
            logger.info(f"  - Duration: {stats.duration_seconds:.2f}s")
            logger.info(f"  - Avg time/doc: {stats.avg_time_per_doc:.4f}s")
            logger.info(f"{'='*60}")
            
            return stats
            
        except Exception as e:
            logger.error(f"File processing failed: {e}")
            stats.duration_seconds = time.time() - start_time
            raise
    
    def process_all_frameworks(self, reset: bool = False) -> Dict[str, EmbeddingStats]:
        """
        모든 프레임워크 파일 처리
        
        Args:
            reset: True면 시작 전 ChromaDB 초기화
            
        Returns:
            프레임워크별 통계 딕셔너리
        """
        logger.info(f"{'='*60}")
        logger.info(f"Processing all ESG frameworks")
        logger.info(f"Data directory: {self.data_dir}")
        logger.info(f"{'='*60}")
        
        if reset:
            logger.warning("Resetting ChromaDB collection...")
            self.chroma.reset()
        
        multi_loader = MultiFileJSONLLoader(self.data_dir)
        files = multi_loader.discover_files()
        
        results: Dict[str, EmbeddingStats] = {}
        total_start = time.time()
        
        for file_path in files:
            framework_name = file_path.stem  # gri_2021, sasb_2023 등
            stats = self.process_single_file(file_path, reset=False)
            results[framework_name] = stats
        
        total_duration = time.time() - total_start
        
        # 전체 통계
        total_docs = sum(s.total_documents for s in results.values())
        total_success = sum(s.successful for s in results.values())
        total_failed = sum(s.failed for s in results.values())
        
        logger.info(f"{'='*60}")
        logger.info(f"✅ ALL FRAMEWORKS COMPLETE")
        logger.info(f"  - Files processed: {len(results)}")
        logger.info(f"  - Total documents: {total_docs}")
        logger.info(f"  - Successful: {total_success}")
        logger.info(f"  - Failed: {total_failed}")
        logger.info(f"  - Total duration: {total_duration:.2f}s")
        logger.info(f"  - ChromaDB count: {self.chroma.count()}")
        logger.info(f"{'='*60}")
        
        return results
    
    def _process_batch(self, batch: List[ESGStandardDocument]) -> None:
        """
        배치 단위 처리 (내부 메서드)
        
        Args:
            batch: ESGStandardDocument 리스트
        """
        # ID, 텍스트, 메타데이터 추출
        ids = [doc.id for doc in batch]
        texts = [doc.to_text(lang=self.language) for doc in batch]
        metadatas = [doc.to_dict() for doc in batch]
        
        # 임베딩 생성
        embeddings = self.embeddings.embed_documents(texts, batch_size=len(batch))
        
        # ChromaDB에 저장 (upsert: 중복 시 업데이트)
        self.chroma.upsert_documents(
            ids=ids,
            documents=texts,
            metadatas=metadatas,
            embeddings=embeddings
        )
    
    def get_status(self) -> Dict[str, Any]:
        """현재 파이프라인 상태 조회"""
        return {
            "data_dir": str(self.data_dir),
            "chroma_persist_dir": str(self.chroma_persist_dir),
            "collection_name": self.collection_name,
            "batch_size": self.batch_size,
            "language": self.language,
            "embedding_dimension": self.embeddings.get_dimension(),
            "chroma_count": self.chroma.count(),
            "chroma_metadata": self.chroma.get_collection_metadata()
        }


# CLI 유틸리티 함수
def embed_esg_standards(
    data_dir: str = "./backend/src/ai_assits/esg_mapping/data",
    reset: bool = False,
    framework: Optional[str] = None
) -> None:
    """
    ESG 표준 임베딩 CLI
    
    Args:
        data_dir: JSONL 파일 디렉토리
        reset: True면 기존 데이터 삭제
        framework: 특정 프레임워크만 처리 (None이면 전체)
    
    Usage:
        from backend.src.ai_assits.esg_mapping.vectorstore.embed_pipeline import embed_esg_standards
        
        # 전체 임베딩
        embed_esg_standards(reset=True)
        
        # GRI만 임베딩
        embed_esg_standards(framework="gri", reset=False)
    """
    pipeline = ESGEmbeddingPipeline(data_dir=Path(data_dir))
    
    if framework:
        # 특정 프레임워크만 처리
        file_path = Path(data_dir) / f"{framework.lower()}_*.jsonl"
        files = list(Path(data_dir).glob(file_path.name))
        
        if not files:
            logger.error(f"No files found for framework: {framework}")
            return
        
        for file in files:
            pipeline.process_single_file(file, reset=reset)
    else:
        # 전체 처리
        pipeline.process_all_frameworks(reset=reset)
    
    # 최종 상태 출력
    status = pipeline.get_status()
    logger.info("Final status:")
    for key, value in status.items():
        logger.info(f"  {key}: {value}")

