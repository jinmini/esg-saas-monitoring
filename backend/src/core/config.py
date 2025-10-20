from pydantic_settings import BaseSettings
from typing import List
from src.ai_assist.config import AIAssistConfig


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://esg_user:esg_password@localhost:5432/esg_monitoring"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # FastAPI
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Naver API
    NAVER_CLIENT_ID: str = "your-naver-client-id"
    NAVER_CLIENT_SECRET: str = "your-naver-client-secret"
    
    # Crawler Settings
    CRAWL_INTERVAL_MINUTES: int = 60
    MAX_ARTICLES_PER_COMPANY: int = 100
    CRAWLER_DELAY_SECONDS: float = 1.0  # API 요청 간 지연
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # AI Assist
    AI_ASSIST: AIAssistConfig = AIAssistConfig()
    
    class Config:
        env_file = ".env.dev"


settings = Settings()
