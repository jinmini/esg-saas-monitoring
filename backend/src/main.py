from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import test_db_connection
from src.crawler.router import router as crawler_router
from src.articles.router import router as articles_router
from src.events.router import router as events_router
from src.documents.router import router as documents_router
from src.documents.version_router import router as version_router  # ✅ 버전 관리 라우터 추가

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

# 라우터 등록
app.include_router(crawler_router, prefix="/api/v1")
app.include_router(articles_router, prefix="/api/v1")
app.include_router(events_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(version_router)  # ✅ 버전 관리 라우터 등록 (prefix 이미 포함)


@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행되는 이벤트"""
    print("🚀 ESG SaaS Monitoring Platform Starting...")
    
    # 데이터베이스 연결 테스트
    if await test_db_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "ESG SaaS Monitoring Platform API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
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
