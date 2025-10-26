from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import test_db_connection
from src.crawler.router import router as crawler_router
from src.articles.router import router as articles_router
from src.events.router import router as events_router
from src.documents.router import router as documents_router
from src.documents.version_router import router as version_router  # ✅ 버전 관리 라우터 추가
from src.ai_assist.router import router as ai_assist_router  # ✅ AI Assist 라우터 추가
from src.ai_assist.config import get_ai_config
from src.ai_assist.middleware.request_id import RequestIDMiddleware
from src.ai_assist.core.logger import init_default_logger
from src.ai_assist.core.metrics import init_service_info
from src.ai_assist.monitoring.alerting import init_alerting
from pathlib import Path

# FastAPI 앱 생성
app = FastAPI(
    title="ESG SaaS Monitoring Platform",
    description="ESG SaaS 기업들의 동향을 추적하고 분석하는 플랫폼",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS 미들웨어 추가 (OPTIONS preflight 요청 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Request ID 추적 미들웨어 추가
app.add_middleware(RequestIDMiddleware)

# 라우터 등록
app.include_router(crawler_router, prefix="/api/v1")
app.include_router(articles_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(version_router)  # ✅ 버전 관리 라우터 등록 (prefix 이미 포함)
app.include_router(ai_assist_router, prefix="/api/v1")  # ✅ AI Assist 라우터 등록


@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행되는 이벤트"""
    # 로깅 초기화 전에는 print 사용
    print("[STARTUP] ESG SaaS Monitoring Platform Starting...")
    
    # 데이터베이스 연결 테스트
    db_connected = await test_db_connection()
    if db_connected:
        print("[OK] Database connection successful")
    else:
        print("[ERROR] Database connection failed")
    
    # AI Assist 초기화
    try:
        ai_config = get_ai_config()
        
        # 1. 로깅 초기화
        log_file = Path(ai_config.LOG_FILE) if ai_config.LOG_FILE else None
        init_default_logger(
            log_level=ai_config.LOG_LEVEL,
            log_format=ai_config.LOG_FORMAT,
            log_file=log_file
        )
        print(f"[OK] Logging initialized: {ai_config.LOG_FORMAT} format")
        
        # 이제부터는 structlog 사용
        from src.ai_assist.core.logger import get_logger
        logger = get_logger(__name__)
        
        # 2. 메트릭 초기화
        if ai_config.METRICS_ENABLED:
            init_service_info(
                version="1.0.0",
                model=ai_config.GEMINI_MODEL,
                embedding_model=ai_config.EMBEDDING_MODEL
            )
            logger.info("metrics_initialized")
        
        # 3. 알림 초기화
        if ai_config.SLACK_WEBHOOK_URL:
            init_alerting(ai_config.SLACK_WEBHOOK_URL)
            logger.info("slack_alerting_initialized")
        else:
            logger.info("slack_alerting_disabled", reason="no_webhook_url")
        
        # 4. 자동 갱신 시작 (설정에 따라)
        if ai_config.AUTO_REFRESH_ENABLED:
            from src.ai_assist.esg_mapping.vectorstore.refresh_task import get_refresh_task
            import asyncio
            
            refresh_task = get_refresh_task(
                data_dir=ai_config.ESG_DATA_DIR,
                auto_start=False  # 수동으로 시작
            )
            
            logger.info("auto_refresh_starting", interval=ai_config.REFRESH_CHECK_INTERVAL)
            
            # 백그라운드 태스크로 시작
            asyncio.create_task(refresh_task.start())
            logger.info("auto_refresh_started", interval=ai_config.REFRESH_CHECK_INTERVAL)
        else:
            logger.info("auto_refresh_disabled")
            
    except Exception as e:
        # 에러 발생 시에도 로거 사용 시도
        try:
            from src.ai_assist.core.logger import get_logger
            logger = get_logger(__name__)
            logger.error("ai_assist_initialization_failed", error=str(e), exc_info=True)
        except:
            print(f"[WARN] AI Assist initialization warning: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """애플리케이션 종료 시 리소스 정리"""
    try:
        from src.ai_assist.core.logger import get_logger
        logger = get_logger(__name__)
        
        logger.info("application_shutdown_started")
        
        # 1. 자동 갱신 태스크 중지
        try:
            from src.ai_assist.config import get_ai_config
            ai_config = get_ai_config()
            
            if ai_config.AUTO_REFRESH_ENABLED:
                from src.ai_assist.esg_mapping.vectorstore.refresh_task import get_refresh_task
                refresh_task = get_refresh_task(
                    data_dir=ai_config.ESG_DATA_DIR,
                    auto_start=False
                )
                await refresh_task.stop()
                logger.info("auto_refresh_stopped")
        except Exception as e:
            logger.warning("auto_refresh_stop_failed", error=str(e))
        
        # 2. Prometheus 메트릭 플러시 (필요 시)
        # prometheus_client는 자동으로 정리되므로 별도 작업 불필요
        
        # 3. 로그 버퍼 플러시
        import logging
        logging.shutdown()
        
        logger.info("application_shutdown_completed")
        print("✅ Application shutdown completed")
        
    except Exception as e:
        print(f"⚠️  Shutdown warning: {e}")


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "ESG SaaS Monitoring Platform API",
        "version": "1.0.0",
        "status": "running"
    }


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """헬스체크 엔드포인트"""
    db_status = await test_db_connection()
    
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
