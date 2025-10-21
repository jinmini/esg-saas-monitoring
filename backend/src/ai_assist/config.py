"""
AI Assist 설정
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from pathlib import Path
import os


class AIAssistConfig(BaseSettings):
    """AI Assist 설정"""
    
    # Gemini API
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.3
    GEMINI_MAX_TOKENS: int = 4096  # ESG 매핑 JSON 응답에 충분한 공간 확보
    
    # 임베딩 선택 (Render Free Tier 최적화)
    USE_GEMINI_EMBEDDING: bool = True  # True: Gemini API (배포), False: Local (개발)
    
    # Local Embedding (개발 환경 전용, USE_GEMINI_EMBEDDING=false일 때만 사용)
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-base"
    EMBEDDING_DEVICE: Optional[str] = None  # None = auto-detect
    EMBEDDING_BATCH_SIZE: int = 32
    
    # Vector Store (ChromaDB or JSON)
    USE_JSON_VECTOR_STORE: bool = True  # True: JSON (무료), False: ChromaDB
    JSON_VECTOR_PATH: Optional[str] = None  # None = auto-detect
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    CHROMA_COLLECTION_NAME: str = "esg_standards"
    
    # ESG 데이터
    ESG_DATA_DIR: str = "./backend/src/ai_assist/esg_mapping/data"
    
    # 자동 갱신
    AUTO_REFRESH_ENABLED: bool = False
    REFRESH_CHECK_INTERVAL: int = 3600  # 1시간
    
    # Rate Limiting (gemini-2.5-flash Free tier 기준)
    # Tier 1 이상: RPM=1000, TPM=1,000,000, RPD=10,000
    RATE_LIMIT_RPM: int = 10  # Requests per minute (Free tier)
    RATE_LIMIT_TPM: int = 250000  # Tokens per minute (Free tier)
    RATE_LIMIT_RPD: int = 250  # Requests per day (Free tier)
    
    # Monitoring & Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json or console
    LOG_FILE: Optional[str] = "./data/logs/ai_assist.log"
    METRICS_ENABLED: bool = True
    
    # Alerting
    SLACK_WEBHOOK_URL: Optional[str] = None
    ALERT_ERROR_RATE_THRESHOLD: float = 0.05  # 5%
    ALERT_LATENCY_THRESHOLD: float = 45.0  # 45 seconds
    ALERT_TOKEN_USAGE_THRESHOLD: float = 0.8  # 80%
    
    model_config = SettingsConfigDict(
        # 프로젝트 루트 기준 절대 경로
        env_file=str(Path(__file__).parent.parent.parent / ".env.dev"),
        env_file_encoding='utf-8',
        env_prefix="AI_ASSIST_",
        extra='ignore',
        # 환경변수 우선 (이미 로드된 환경변수가 있으면 사용)
        case_sensitive=False
    )
    
    def to_dict(self) -> dict:
        """설정을 딕셔너리로 변환 (Pydantic v2 호환)"""
        return self.model_dump()


# 전역 설정 인스턴스
_config: Optional[AIAssistConfig] = None


def get_ai_config() -> AIAssistConfig:
    """AI Assist 설정 반환"""
    global _config
    
    if _config is None:
        _config = AIAssistConfig()
    
    return _config

