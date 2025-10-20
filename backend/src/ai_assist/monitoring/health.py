"""
Health Check 시스템

AI Assist 서비스의 각 구성 요소 상태를 확인합니다.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
from pathlib import Path
import structlog

logger = structlog.get_logger(__name__)

# Health Check 결과 캐싱 (30초)
_health_cache: Optional[Dict[str, Any]] = None
_health_cache_time: Optional[datetime] = None
HEALTH_CACHE_TTL = 30  # seconds


class HealthChecker:
    """Health Check 관리자"""
    
    def __init__(self):
        self.checks = {
            "embedding_model": self.check_embedding_model,
            "chroma_db": self.check_chroma_db,
            "gemini_api": self.check_gemini_api,
            "gpu": self.check_gpu_availability
        }
    
    async def check_all(self, use_cache: bool = True) -> Dict[str, Any]:
        """
        모든 구성 요소 상태 확인
        
        Args:
            use_cache: 캐시 사용 여부 (기본 True, 30초 TTL)
        
        Returns:
            {
                "status": "healthy" | "degraded" | "unhealthy",
                "timestamp": "2025-10-16T12:00:00Z",
                "checks": {
                    "embedding_model": {"status": "healthy", ...},
                    "chroma_db": {"status": "healthy", ...},
                    ...
                }
            }
        """
        global _health_cache, _health_cache_time
        
        # 캐시 확인 (30초 이내면 재사용)
        if use_cache and _health_cache and _health_cache_time:
            age = (datetime.utcnow() - _health_cache_time).total_seconds()
            if age < HEALTH_CACHE_TTL:
                logger.debug("health_check_cache_hit", age_seconds=age)
                return _health_cache
        
        # 모든 체크 병렬 실행 (asyncio.gather 사용)
        check_names = list(self.checks.keys())
        
        # 코루틴 객체 생성 (메서드 호출)
        check_coros = [check_func() for check_func in self.checks.values()]
        
        try:
            check_results = await asyncio.gather(
                *check_coros,
                return_exceptions=True  # 에러 발생 시에도 계속 진행
            )
        except Exception as e:
            logger.error("health_check_gather_failed", error=str(e))
            check_results = [{"status": "unhealthy", "error": str(e)}] * len(check_coros)
        
        # 결과 매핑
        results = {}
        for name, result in zip(check_names, check_results):
            if isinstance(result, Exception):
                logger.error(
                    "health_check_failed",
                    component=name,
                    error=str(result)
                )
                results[name] = {
                    "status": "unhealthy",
                    "error": str(result)
                }
            else:
                results[name] = result
        
        # 전체 상태 판단
        overall_status = self._determine_overall_status(results)
        
        result = {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "checks": results
        }
        
        # 캐시 저장
        _health_cache = result
        _health_cache_time = datetime.utcnow()
        
        # Unhealthy 상태면 자동 알림 전송
        if overall_status == "unhealthy":
            await self._send_unhealthy_alert(results)
        
        return result
    
    def _determine_overall_status(self, checks: Dict[str, Dict]) -> str:
        """
        전체 상태 판단
        
        - healthy: 모든 체크 통과
        - degraded: 일부 체크 실패 (Gemini API 제외)
        - unhealthy: 핵심 체크 실패 (임베딩 모델, ChromaDB)
        """
        statuses = [check["status"] for check in checks.values()]
        
        # 모두 healthy
        if all(s == "healthy" for s in statuses):
            return "healthy"
        
        # 핵심 구성 요소 체크
        critical_components = ["embedding_model", "chroma_db"]
        critical_checks = [
            checks[comp]["status"]
            for comp in critical_components
            if comp in checks
        ]
        
        # 핵심 구성 요소가 하나라도 unhealthy면 unhealthy
        if any(s == "unhealthy" for s in critical_checks):
            return "unhealthy"
        
        # 그 외는 degraded
        return "degraded"
    
    async def _send_unhealthy_alert(self, checks: Dict[str, Dict]):
        """
        Unhealthy 상태 시 자동 알림 전송
        
        Args:
            checks: 체크 결과
        """
        try:
            from src.ai_assist.monitoring.alerting import get_alert_manager
            
            alert_manager = get_alert_manager()
            if not alert_manager.enabled:
                return
            
            # Unhealthy 구성 요소 찾기
            unhealthy_components = [
                name for name, check in checks.items()
                if check.get("status") == "unhealthy"
            ]
            
            if unhealthy_components:
                for component in unhealthy_components:
                    error = checks[component].get("error", "Unknown error")
                    await alert_manager.alert_service_unhealthy(component, error)
        except Exception as e:
            logger.error("failed_to_send_unhealthy_alert", error=str(e))
    
    async def check_embedding_model(self) -> Dict[str, Any]:
        """임베딩 모델 상태 확인"""
        try:
            from src.ai_assist.core.embeddings import get_embeddings
            
            embeddings = get_embeddings()
            
            # 간단한 텍스트로 테스트
            test_text = "test"
            embedding = embeddings.embed_query(test_text)
            
            return {
                "status": "healthy",
                "model": embeddings.model_name,
                "device": str(embeddings.device),
                "dimension": len(embedding)
            }
        except Exception as e:
            logger.error("embedding_model_check_failed", error=str(e))
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def check_chroma_db(self) -> Dict[str, Any]:
        """ChromaDB 상태 확인"""
        try:
            # ESGMappingService를 통해 ChromaManager에 접근
            from src.ai_assist.esg_mapping.service import get_esg_mapping_service
            
            service = get_esg_mapping_service()
            status_info = service.get_vectorstore_status()
            
            # 문서 수 확인
            count = status_info.get("document_count", 0)
            
            return {
                "status": "healthy" if count > 0 else "degraded",
                "document_count": count,
                "collection_name": status_info.get("collection_name", "unknown")
            }
        except Exception as e:
            logger.error("chroma_db_check_failed", error=str(e))
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def check_gemini_api(self) -> Dict[str, Any]:
        """Gemini API 상태 확인"""
        try:
            from src.ai_assist.core.gemini_client import get_gemini_client
            
            client = get_gemini_client()
            
            # 간단한 토큰 카운트 테스트
            test_text = "test"
            token_count = client.count_tokens(test_text)
            
            return {
                "status": "healthy",
                "model": client.model_name,
                "test_token_count": token_count
            }
        except Exception as e:
            logger.error("gemini_api_check_failed", error=str(e))
            # Gemini API 실패는 degraded로 처리 (Fallback 가능)
            return {
                "status": "degraded",
                "error": str(e),
                "message": "Fallback to vector similarity available"
            }
    
    async def check_gpu_availability(self) -> Dict[str, Any]:
        """GPU 상태 확인"""
        try:
            import torch
            
            if not torch.cuda.is_available():
                return {
                    "status": "degraded",
                    "available": False,
                    "message": "GPU not available, using CPU"
                }
            
            # GPU 정보
            device_count = torch.cuda.device_count()
            current_device = torch.cuda.current_device()
            device_name = torch.cuda.get_device_name(current_device)
            
            # 메모리 정보
            memory_allocated = torch.cuda.memory_allocated(current_device)
            memory_reserved = torch.cuda.memory_reserved(current_device)
            
            # 사용률 계산 (간단한 추정)
            if memory_reserved > 0:
                utilization = memory_allocated / memory_reserved
            else:
                utilization = 0.0
            
            return {
                "status": "healthy",
                "available": True,
                "device_count": device_count,
                "current_device": current_device,
                "device_name": device_name,
                "memory_allocated_mb": memory_allocated / 1024 / 1024,
                "memory_reserved_mb": memory_reserved / 1024 / 1024,
                "utilization": utilization
            }
        except Exception as e:
            logger.error("gpu_check_failed", error=str(e))
            return {
                "status": "degraded",
                "available": False,
                "error": str(e)
            }


# 전역 인스턴스
_health_checker: HealthChecker = None


def get_health_checker() -> HealthChecker:
    """Health Checker 싱글톤 반환"""
    global _health_checker
    
    if _health_checker is None:
        _health_checker = HealthChecker()
    
    return _health_checker

