"""
AI Assist API 라우터
ESG 보고서 작성을 위한 AI 기능 제공
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Dict, Any
import logging
import asyncio
from pathlib import Path
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from .esg_mapping.schemas import ESGMappingRequest, ESGMappingResponse
from .esg_mapping.service import get_esg_mapping_service
from .esg_mapping.vectorstore.refresh_task import get_refresh_task
from .exceptions import AIAssistException
from .monitoring.health import get_health_checker
from .middleware.request_id import get_request_id
from .core.logger import get_logger
from .core import metrics

# 구조화된 로거 사용
logger = get_logger(__name__)

router = APIRouter(prefix="/ai-assist", tags=["AI Assist"])


# 응답 스키마 정의
class StatusResponse(BaseModel):
    """상태 응답"""
    status: str
    message: str = ""


class VectorStoreStatusResponse(BaseModel):
    """벡터스토어 상태 응답"""
    collection_name: str
    document_count: int
    embedding_dimension: int
    chroma_metadata: Dict[str, Any]


class RefreshStatusResponse(BaseModel):
    """갱신 태스크 상태 응답"""
    is_running: bool
    last_check_time: str = None
    refresh_count: int
    check_interval: int
    tracked_files: int
    vectorstore_count: int


class HealthCheckResponse(BaseModel):
    """Health Check 응답"""
    status: str  # healthy, degraded, unhealthy
    timestamp: str
    checks: Dict[str, Any]


# ============================================================================
# Health Check & Metrics 엔드포인트
# ============================================================================

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    AI Assist 서비스 상태 확인
    
    ## 체크 항목
    - **embedding_model**: 임베딩 모델 상태
    - **chroma_db**: ChromaDB 연결 및 문서 수
    - **gemini_api**: Gemini API 연결
    - **gpu**: GPU 가용성 및 메모리
    
    ## 응답 상태
    - **healthy**: 모든 구성 요소 정상
    - **degraded**: 일부 구성 요소 문제 (서비스 가능)
    - **unhealthy**: 핵심 구성 요소 문제 (서비스 불가)
    """
    health_checker = get_health_checker()
    result = await health_checker.check_all()
    
    # 상태에 따라 HTTP 상태 코드 설정
    status_code = (
        status.HTTP_200_OK if result["status"] == "healthy"
        else status.HTTP_503_SERVICE_UNAVAILABLE if result["status"] == "unhealthy"
        else status.HTTP_200_OK  # degraded는 200 (서비스 가능)
    )
    
    if status_code != status.HTTP_200_OK:
        raise HTTPException(status_code=status_code, detail=result)
    
    return result


@router.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    """
    Prometheus 메트릭 노출
    
    ## 메트릭 카테고리
    - **요청 메트릭**: 총 요청 수, 진행 중 요청, 응답 시간
    - **품질 메트릭**: 매칭 수, 신뢰도, JSON 파싱 성공률
    - **비용 메트릭**: 토큰 사용량
    - **에러 메트릭**: 에러 횟수, Retry 횟수
    - **시스템 메트릭**: GPU 사용률, ChromaDB 문서 수
    
    ## 사용법
    Prometheus `scrape_configs`에 추가:
    ```yaml
    - job_name: 'ai_assist'
      static_configs:
        - targets: ['localhost:8000']
      metrics_path: '/api/v1/ai-assist/metrics'
    ```
    """
    return PlainTextResponse(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )


# ============================================================================
# ESG 매핑 엔드포인트
# ============================================================================

@router.post("/map-esg", response_model=ESGMappingResponse)
async def map_esg_standards(
    request: ESGMappingRequest,
    http_request: Request
):
    """
    텍스트를 분석하여 관련된 ESG 표준 매핑
    
    ## 프로세스
    1. 사용자 텍스트를 벡터화
    2. ChromaDB에서 유사한 ESG 표준 검색
    3. LLM으로 후보들을 분석하고 신뢰도 평가
    4. 매칭 결과 반환
    
    ## 지원 프레임워크
    - GRI (Global Reporting Initiative) 2021
    - SASB (Sustainability Accounting Standards Board) 2023
    - TCFD (Task Force on Climate-related Financial Disclosures) 2024
    - ESRS (European Sustainability Reporting Standards) 2024
    
    ## 응답 헤더
    - **X-Request-ID**: 요청 추적 ID (로깅 및 디버깅용)
    
    ## 예시
    ```json
    {
      "text": "우리 회사는 2024년 Scope 1 직접 배출량이 1,200 tCO2e입니다.",
      "document_id": 123,
      "frameworks": ["GRI"],
      "top_k": 5,
      "min_confidence": 0.5,
      "language": "ko"
    }
    ```
    """
    from fastapi.responses import JSONResponse
    
    request_id = get_request_id(http_request)
    
    try:
        # 메트릭 추적
        async with metrics.track_request_async(frameworks=request.frameworks):
            async with metrics.track_stage_async("vector_search"):
                service = get_esg_mapping_service()
                response = await service.map_esg(request)
            
        # 응답에 Request ID 헤더 추가
        return JSONResponse(
            content=response.model_dump(),
            headers={"X-Request-ID": request_id}
        )
    except AIAssistException as e:
        metrics.record_error(f"AIAssistException/{e.__class__.__name__}")
        raise e
    except Exception as e:
        logger.error("esg_mapping_failed", error=str(e), exc_info=True)
        metrics.record_error("UnknownError")
        # 보안: 내부 에러 메시지 노출 방지
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ESG 매핑 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        )


# ============================================================================
# 벡터스토어 관리 엔드포인트
# ============================================================================

@router.get("/vectorstore/status", response_model=VectorStoreStatusResponse)
async def get_vectorstore_status():
    """
    벡터스토어 상태 조회
    
    - 문서 수
    - 컬렉션 정보
    - 임베딩 차원
    """
    try:
        service = get_esg_mapping_service()
        status_info = service.get_vectorstore_status()
        return status_info
    except Exception as e:
        logger.error(f"Failed to get vectorstore status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="벡터스토어 상태 조회 중 오류가 발생했습니다."
        )


@router.post("/vectorstore/initialize")
async def initialize_vectorstore(
    background_tasks: BackgroundTasks,
    reset: bool = False
):
    """
    벡터스토어 초기화 (JSONL → 임베딩 → ChromaDB)
    
    **주의:** 시간이 오래 걸릴 수 있습니다 (수백 개 문서 처리).
    
    Args:
        reset: True면 기존 데이터 삭제 후 재구축
    
    Returns:
        작업 시작 메시지 (백그라운드 실행)
    """
    try:
        # 백그라운드에서 실행 + 로그 파일 저장
        async def run_initialization():
            import json
            from datetime import datetime
            
            log_dir = Path("./data/logs")
            log_dir.mkdir(parents=True, exist_ok=True)
            log_file = log_dir / f"vectorstore_init_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            
            try:
                service = get_esg_mapping_service()
                data_dir = "./backend/src/ai_assist/esg_mapping/data"
                result = service.initialize_vectorstore(data_dir=data_dir, reset=reset)
                
                # 로그 파일 저장
                with open(log_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "status": "success",
                        "timestamp": datetime.now().isoformat(),
                        "result": result
                    }, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Vectorstore initialization complete: {result}")
                logger.info(f"Log saved to: {log_file}")
            except Exception as e:
                # 에러 로그 저장
                with open(log_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "status": "failed",
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    }, f, indent=2, ensure_ascii=False)
                logger.error(f"Initialization failed: {e}", exc_info=True)
        
        background_tasks.add_task(run_initialization)
        
        return {
            "status": "started",
            "message": "벡터스토어 초기화가 백그라운드에서 시작되었습니다.",
            "reset": reset
        }
    except Exception as e:
        logger.error(f"Failed to start initialization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="벡터스토어 초기화 시작 중 오류가 발생했습니다."
        )


# ============================================================================
# 자동 갱신 태스크 엔드포인트
# ============================================================================

@router.post("/refresh/start")
async def start_refresh_task():
    """
    벡터스토어 자동 갱신 태스크 시작
    
    주기적으로 JSONL 파일 변경을 감지하고 재임베딩합니다.
    """
    try:
        task = get_refresh_task()
        
        if task.is_running:
            return {
                "status": "already_running",
                "message": "갱신 태스크가 이미 실행 중입니다."
            }
        
        # 비동기로 시작
        import asyncio
        asyncio.create_task(task.start())
        
        return {
            "status": "started",
            "message": "벡터스토어 자동 갱신 태스크가 시작되었습니다.",
            "check_interval": task.check_interval
        }
    except Exception as e:
        logger.error(f"Failed to start refresh task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/refresh/stop")
async def stop_refresh_task():
    """벡터스토어 자동 갱신 태스크 중지"""
    try:
        task = get_refresh_task()
        task.stop()
        
        return {
            "status": "stopped",
            "message": "갱신 태스크가 중지되었습니다."
        }
    except Exception as e:
        logger.error(f"Failed to stop refresh task: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/refresh/status", response_model=RefreshStatusResponse)
async def get_refresh_status():
    """갱신 태스크 상태 조회"""
    try:
        task = get_refresh_task()
        return task.get_status()
    except Exception as e:
        logger.error(f"Failed to get refresh status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="갱신 태스크 상태 조회 중 오류가 발생했습니다."
        )


@router.post("/refresh/check-now")
async def check_and_refresh_now():
    """
    즉시 변경사항 체크 및 갱신
    
    주기와 관계없이 즉시 JSONL 파일을 체크하고 변경된 파일을 재임베딩합니다.
    """
    try:
        task = get_refresh_task()
        result = await task.check_and_refresh()
        return result
    except Exception as e:
        logger.error(f"Check and refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/refresh/force-all")
async def force_refresh_all(background_tasks: BackgroundTasks):
    """
    강제 전체 재임베딩
    
    **주의:** 모든 데이터를 삭제하고 처음부터 재구축합니다.
    """
    try:
        # 백그라운드에서 실행 + 로그 파일 저장 (이벤트 루프 문제 해결)
        async def run_force_refresh():
            import json
            from datetime import datetime
            
            log_dir = Path("./data/logs")
            log_dir.mkdir(parents=True, exist_ok=True)
            log_file = log_dir / f"force_refresh_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
            
            try:
                task = get_refresh_task()
                # FastAPI는 이미 이벤트 루프가 있으므로 직접 await
                result = await task.force_refresh_all()
                
                # 로그 파일 저장
                with open(log_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "status": "success",
                        "timestamp": datetime.now().isoformat(),
                        "result": result
                    }, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Force refresh complete: {result}")
                logger.info(f"Log saved to: {log_file}")
            except Exception as e:
                # 에러 로그 저장
                with open(log_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "status": "failed",
                        "timestamp": datetime.now().isoformat(),
                        "error": str(e)
                    }, f, indent=2, ensure_ascii=False)
                logger.error(f"Force refresh failed: {e}", exc_info=True)
        
        background_tasks.add_task(run_force_refresh)
        
        return {
            "status": "started",
            "message": "전체 재임베딩이 백그라운드에서 시작되었습니다."
        }
    except Exception as e:
        logger.error(f"Force refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="전체 재임베딩 시작 중 오류가 발생했습니다."
        )


# ============================================================================
# 헬스체크
# ============================================================================

@router.get("/health")
async def health_check():
    """AI Assist 서비스 헬스체크"""
    try:
        service = get_esg_mapping_service()
        vectorstore_status = service.get_vectorstore_status()
        
        refresh_task = get_refresh_task()
        refresh_status = refresh_task.get_status()
        
        return {
            "status": "healthy",
            "vectorstore": {
                "document_count": vectorstore_status["document_count"],
                "embedding_dimension": vectorstore_status["embedding_dimension"]
            },
            "refresh_task": {
                "is_running": refresh_status["is_running"],
                "refresh_count": refresh_status["refresh_count"]
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

