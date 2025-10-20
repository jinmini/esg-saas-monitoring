"""
벡터스토어 자동 갱신 시스템
JSONL 파일 변경 감지 및 재임베딩
"""
import logging
import hashlib
import time
from pathlib import Path
from typing import Dict, Any, Optional, Set
from datetime import datetime
import asyncio
import json

from .embed_pipeline import ESGEmbeddingPipeline, EmbeddingStats

logger = logging.getLogger(__name__)


class FileHashTracker:
    """파일 해시 추적기 (변경 감지용)"""
    
    def __init__(self, cache_file: Path = Path("./data/.file_hashes.json")):
        """
        Args:
            cache_file: 해시 캐시 파일 경로
        """
        self.cache_file = cache_file
        self.hashes: Dict[str, str] = {}
        self.load_cache()
    
    def load_cache(self) -> None:
        """캐시 파일 로드"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    self.hashes = json.load(f)
                logger.info(f"Loaded hash cache: {len(self.hashes)} files")
            except Exception as e:
                logger.error(f"Failed to load hash cache: {e}")
                self.hashes = {}
        else:
            logger.info("No hash cache found, starting fresh")
    
    def save_cache(self) -> None:
        """캐시 파일 저장"""
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self.hashes, f, indent=2)
            logger.debug(f"Saved hash cache: {len(self.hashes)} files")
        except Exception as e:
            logger.error(f"Failed to save hash cache: {e}")
    
    def compute_hash(self, file_path: Path) -> str:
        """
        파일 해시 계산
        
        Args:
            file_path: 파일 경로
            
        Returns:
            SHA256 해시
        """
        sha256 = hashlib.sha256()
        
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(8192):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except Exception as e:
            logger.error(f"Failed to compute hash for {file_path}: {e}")
            return ""
    
    def has_changed(self, file_path: Path) -> bool:
        """
        파일이 변경되었는지 확인
        
        Args:
            file_path: 파일 경로
            
        Returns:
            True if changed
        """
        file_key = str(file_path)
        current_hash = self.compute_hash(file_path)
        
        if not current_hash:
            return False
        
        previous_hash = self.hashes.get(file_key)
        
        if previous_hash is None:
            # 새 파일
            logger.info(f"New file detected: {file_path.name}")
            self.hashes[file_key] = current_hash
            return True
        
        if previous_hash != current_hash:
            # 변경된 파일
            logger.info(f"File changed: {file_path.name}")
            self.hashes[file_key] = current_hash
            return True
        
        return False
    
    def get_changed_files(self, file_paths: list[Path]) -> Set[Path]:
        """
        변경된 파일 목록 반환
        
        Args:
            file_paths: 체크할 파일 경로 리스트
            
        Returns:
            변경된 파일 경로 집합
        """
        changed = set()
        
        for file_path in file_paths:
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                continue
            
            if self.has_changed(file_path):
                changed.add(file_path)
        
        return changed


class VectorRefreshTask:
    """
    벡터스토어 갱신 태스크
    주기적으로 JSONL 파일을 체크하고 변경 시 재임베딩
    """
    
    def __init__(
        self,
        data_dir: Path,
        chroma_persist_dir: Path = Path("./data/chroma"),
        collection_name: str = "esg_standards",
        check_interval: int = 3600,  # 1시간마다 체크
        auto_start: bool = False
    ):
        """
        Args:
            data_dir: JSONL 파일 디렉토리
            chroma_persist_dir: ChromaDB 저장 경로
            collection_name: 컬렉션 이름
            check_interval: 체크 간격 (초)
            auto_start: True면 자동 시작
        """
        self.data_dir = Path(data_dir)
        self.chroma_persist_dir = Path(chroma_persist_dir)
        self.collection_name = collection_name
        self.check_interval = check_interval
        
        # 파일 추적기
        cache_file = self.chroma_persist_dir / ".file_hashes.json"
        self.tracker = FileHashTracker(cache_file=cache_file)
        
        # 임베딩 파이프라인
        self.pipeline = ESGEmbeddingPipeline(
            data_dir=data_dir,
            chroma_persist_dir=chroma_persist_dir,
            collection_name=collection_name
        )
        
        # 상태
        self.is_running = False
        self.last_check_time: Optional[datetime] = None
        self.refresh_count = 0
        
        logger.info(f"VectorRefreshTask initialized: check every {check_interval}s")
        
        if auto_start:
            asyncio.create_task(self.start())
    
    async def start(self) -> None:
        """갱신 태스크 시작 (백그라운드 루프)"""
        if self.is_running:
            logger.warning("Refresh task already running")
            return
        
        self.is_running = True
        logger.info("🔄 Vector refresh task started")
        
        try:
            while self.is_running:
                await self.check_and_refresh()
                await asyncio.sleep(self.check_interval)
        except asyncio.CancelledError:
            logger.info("Refresh task cancelled")
        except Exception as e:
            logger.error(f"Refresh task error: {e}", exc_info=True)
        finally:
            self.is_running = False
    
    def stop(self) -> None:
        """갱신 태스크 중지"""
        logger.info("Stopping vector refresh task...")
        self.is_running = False
    
    async def check_and_refresh(self) -> Dict[str, Any]:
        """
        파일 변경 체크 및 갱신
        
        Returns:
            갱신 결과 딕셔너리
        """
        start_time = time.time()
        self.last_check_time = datetime.now()
        
        logger.info(f"{'='*60}")
        logger.info(f"Checking for data updates... ({self.last_check_time.isoformat()})")
        logger.info(f"{'='*60}")
        
        try:
            # JSONL 파일 목록
            jsonl_files = list(self.data_dir.glob("*.jsonl"))
            
            if not jsonl_files:
                logger.warning(f"No JSONL files found in {self.data_dir}")
                return {"status": "no_files", "message": "No data files found"}
            
            # 변경된 파일 찾기
            changed_files = self.tracker.get_changed_files(jsonl_files)
            
            if not changed_files:
                logger.info("✅ No changes detected")
                return {
                    "status": "no_changes",
                    "checked_files": len(jsonl_files),
                    "duration": time.time() - start_time
                }
            
            logger.info(f"📝 Changes detected in {len(changed_files)} files:")
            for file in changed_files:
                logger.info(f"  - {file.name}")
            
            # 변경된 파일들 재임베딩
            refresh_results = {}
            
            for file_path in changed_files:
                logger.info(f"Re-embedding: {file_path.name}")
                try:
                    stats = self.pipeline.process_single_file(file_path, reset=False)
                    refresh_results[file_path.name] = stats.to_dict()
                except Exception as e:
                    logger.error(f"Failed to re-embed {file_path.name}: {e}")
                    refresh_results[file_path.name] = {"status": "error", "error": str(e)}
            
            # 해시 캐시 저장
            self.tracker.save_cache()
            
            self.refresh_count += 1
            duration = time.time() - start_time
            
            result = {
                "status": "refreshed",
                "changed_files": [str(f) for f in changed_files],
                "refresh_count": self.refresh_count,
                "results": refresh_results,
                "duration": round(duration, 2),
                "timestamp": self.last_check_time.isoformat()
            }
            
            logger.info(f"{'='*60}")
            logger.info(f"✅ Refresh complete: {len(changed_files)} files in {duration:.2f}s")
            logger.info(f"{'='*60}")
            
            return result
            
        except Exception as e:
            logger.error(f"Check and refresh failed: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e),
                "duration": time.time() - start_time
            }
    
    async def force_refresh_all(self) -> Dict[str, Any]:
        """
        강제 전체 재임베딩
        
        Returns:
            갱신 결과
        """
        logger.warning("🔄 Force refresh all - resetting vectorstore")
        
        start_time = time.time()
        
        try:
            results = self.pipeline.process_all_frameworks(reset=True)
            
            # 모든 파일 해시 업데이트
            jsonl_files = list(self.data_dir.glob("*.jsonl"))
            for file_path in jsonl_files:
                self.tracker.compute_hash(file_path)  # 해시 업데이트
            
            self.tracker.save_cache()
            
            self.refresh_count += 1
            duration = time.time() - start_time
            
            stats = {
                framework: result.to_dict()
                for framework, result in results.items()
            }
            
            return {
                "status": "force_refreshed",
                "frameworks": stats,
                "total_documents": self.pipeline.chroma.count(),
                "duration": round(duration, 2),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Force refresh failed: {e}", exc_info=True)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def get_status(self) -> Dict[str, Any]:
        """현재 상태 조회"""
        return {
            "is_running": self.is_running,
            "last_check_time": self.last_check_time.isoformat() if self.last_check_time else None,
            "refresh_count": self.refresh_count,
            "check_interval": self.check_interval,
            "data_dir": str(self.data_dir),
            "tracked_files": len(self.tracker.hashes),
            "vectorstore_count": self.pipeline.chroma.count()
        }


# 전역 태스크 인스턴스
_refresh_task: Optional[VectorRefreshTask] = None


def get_refresh_task(
    data_dir: str = "./backend/src/ai_assits/esg_mapping/data",
    auto_start: bool = False
) -> VectorRefreshTask:
    """
    갱신 태스크 싱글톤 반환
    
    Args:
        data_dir: JSONL 데이터 디렉토리
        auto_start: True면 자동 시작
    """
    global _refresh_task
    
    if _refresh_task is None:
        _refresh_task = VectorRefreshTask(
            data_dir=Path(data_dir),
            auto_start=auto_start
        )
    
    return _refresh_task


def reset_refresh_task():
    """태스크 초기화 (테스트용)"""
    global _refresh_task
    if _refresh_task:
        _refresh_task.stop()
    _refresh_task = None

