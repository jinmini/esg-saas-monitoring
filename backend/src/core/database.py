from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from src.shared.models import Base
from sqlalchemy import text
from .config import settings

# 로그로 현재 설정 확인 (서버 시작 시 출력됨)
print(f"[Database] Initializing Pool: Size={settings.DB_POOL_SIZE}, Overflow={settings.DB_MAX_OVERFLOW}")

# SQLAlchemy 비동기 엔진 생성
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    
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
    expire_on_commit=False,
    autoflush=False  # [권장] 비동기 성능 최적화를 위해 autoflush 끔 (필요시 수동 flush)
)

# 데이터베이스 세션 의존성
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback() # 에러 발생 시 안전하게 롤백
            raise
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