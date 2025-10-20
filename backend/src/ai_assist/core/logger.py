"""
구조화된 로깅 시스템

structlog을 사용하여 JSON 형식의 구조화된 로그를 생성합니다.
"""
import logging
import sys
from pathlib import Path
from typing import Any, Optional
import structlog
from structlog.processors import JSONRenderer
from structlog.stdlib import BoundLogger
from datetime import datetime
import os


def add_timestamp(logger: Any, method_name: str, event_dict: dict) -> dict:
    """타임스탬프 추가"""
    event_dict["timestamp"] = datetime.utcnow().isoformat() + "Z"
    return event_dict


def add_log_level(logger: Any, method_name: str, event_dict: dict) -> dict:
    """로그 레벨을 severity 필드로 추가 (Grafana Loki 호환)"""
    if method_name == "warn":
        # Backwards compatibility
        method_name = "warning"
    
    # Grafana Loki 호환을 위해 severity 사용
    event_dict["severity"] = method_name.upper()
    event_dict["level"] = method_name.upper()  # 하위 호환성 유지
    return event_dict


def add_logger_name(logger: Any, method_name: str, event_dict: dict) -> dict:
    """로거 이름 추가"""
    record = event_dict.get("_record")
    if record:
        event_dict["logger"] = record.name
    return event_dict


def filter_exception_info(logger: Any, method_name: str, event_dict: dict) -> dict:
    """
    예외 정보를 간결하게 변환 (log burst 방지)
    
    전체 trace 대신 exception type과 message만 추출하여
    운영 환경에서 로그 폭주를 방지합니다.
    """
    if "exc_info" in event_dict and event_dict["exc_info"]:
        exc_info = event_dict["exc_info"]
        if isinstance(exc_info, tuple) and len(exc_info) >= 2:
            exc_type, exc_value = exc_info[0], exc_info[1]
            if exc_type and exc_value:
                event_dict["exception"] = f"{exc_type.__name__}: {exc_value}"
        event_dict.pop("exc_info")
    return event_dict


def setup_logging(
    log_level: str = "INFO",
    log_format: str = "json",
    log_file: Optional[Path] = None
) -> None:
    """
    로깅 설정 초기화
    
    Args:
        log_level: 로그 레벨 (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: 로그 포맷 (json, console)
        log_file: 로그 파일 경로 (None이면 stdout만 사용)
    """
    # 기본 로거 레벨 설정
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level.upper())
    )
    
    # structlog 프로세서 체인
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        add_log_level,
        add_timestamp,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        filter_exception_info,
    ]
    
    # 포맷에 따라 렌더러 선택
    if log_format == "json":
        processors.append(JSONRenderer())
    else:
        # Console 포맷 (개발용)
        processors.append(
            structlog.dev.ConsoleRenderer(colors=True)
        )
    
    # structlog 설정
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # 파일 핸들러 추가 (옵션)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, log_level.upper()))
        
        # JSON 포맷으로 파일 저장
        file_handler.setFormatter(
            logging.Formatter('%(message)s')
        )
        
        logging.getLogger().addHandler(file_handler)


def get_logger(name: str) -> BoundLogger:
    """
    구조화된 로거 반환
    
    Args:
        name: 로거 이름 (보통 __name__ 사용)
    
    Returns:
        structlog BoundLogger 인스턴스
    
    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("user_login", user_id=123, method="oauth")
        {"event": "user_login", "user_id": 123, "method": "oauth", ...}
    """
    # APP_ENV로 표준화 (DevOps 연동 시 명확)
    # 값: development, staging, production
    return structlog.get_logger(name).bind(
        service="ai_assist",
        environment=os.getenv("APP_ENV", "development"),
        version="1.0.0"
    )


# 글로벌 로거 인스턴스
_default_logger: Optional[BoundLogger] = None


def init_default_logger(
    log_level: str = "INFO",
    log_format: str = "json",
    log_file: Optional[Path] = None
) -> None:
    """
    기본 로거 초기화
    
    Args:
        log_level: 로그 레벨
        log_format: 로그 포맷 (json, console)
        log_file: 로그 파일 경로
    """
    global _default_logger
    
    setup_logging(log_level, log_format, log_file)
    _default_logger = get_logger("ai_assist")


def get_default_logger() -> BoundLogger:
    """
    기본 로거 반환 (초기화되지 않았으면 자동 초기화)
    
    Returns:
        기본 structlog 로거
    """
    global _default_logger
    
    if _default_logger is None:
        init_default_logger()
    
    return _default_logger


# 편의 함수들
def log_api_request(
    logger: BoundLogger,
    request_id: str,
    method: str,
    path: str,
    **kwargs
) -> None:
    """API 요청 로그"""
    logger.info(
        "api_request",
        request_id=request_id,
        method=method,
        path=path,
        **kwargs
    )


def log_api_response(
    logger: BoundLogger,
    request_id: str,
    status_code: int,
    duration_ms: float,
    **kwargs
) -> None:
    """API 응답 로그"""
    logger.info(
        "api_response",
        request_id=request_id,
        status_code=status_code,
        duration_ms=duration_ms,
        **kwargs
    )


def log_esg_mapping_start(
    logger: BoundLogger,
    request_id: str,
    text_length: int,
    frameworks: Optional[list] = None,
    **kwargs
) -> None:
    """ESG 매핑 시작 로그"""
    logger.info(
        "esg_mapping_started",
        request_id=request_id,
        text_length=text_length,
        frameworks=frameworks or [],
        **kwargs
    )


def log_esg_mapping_complete(
    logger: BoundLogger,
    request_id: str,
    duration_ms: float,
    matches_count: int,
    **kwargs
) -> None:
    """ESG 매핑 완료 로그"""
    logger.info(
        "esg_mapping_completed",
        request_id=request_id,
        duration_ms=duration_ms,
        matches_count=matches_count,
        **kwargs
    )


def log_error(
    logger: BoundLogger,
    error_type: str,
    error_message: str,
    request_id: Optional[str] = None,
    **kwargs
) -> None:
    """에러 로그"""
    logger.error(
        "error_occurred",
        error_type=error_type,
        error_message=error_message,
        request_id=request_id,
        **kwargs
    )

