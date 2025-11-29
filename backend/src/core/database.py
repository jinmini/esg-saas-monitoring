from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.shared.models import Base
from sqlalchemy import text
from .config import settings

# SQLAlchemy 비동기 엔진 생성 (Supabase Free Plan 최적화)
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    # Supabase Free Plan: 최대 2개 동시 연결 제한 대응
    pool_size=1,              # 기본 연결 1개만 유지
    max_overflow=1,           # 최대 추가 연결 1개 허용 (총 2개)
    pool_timeout=30,          # 30초 대기 후 타임아웃
    pool_recycle=1800,        # 30분마다 연결 재사용 (세션 만료 방지)
    connect_args={
        "server_settings": {
            "application_name": "esg-compliance-backend"
        }
    }
)

# 비동기 세션 팩토리 생성
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 데이터베이스 세션 의존성
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# 데이터베이스 연결 테스트
async def test_db_connection():
    try:
        async with engine.begin() as connection:
            result = await connection.execute(text("SELECT 1"))
            return result.fetchone()[0] == 1
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
