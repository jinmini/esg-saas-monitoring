"""
Request ID 추적 미들웨어

모든 요청에 고유한 request_id를 할당하여 분산 추적을 가능하게 합니다.
"""
import uuid
import time
import hashlib
import logging
from typing import Callable, Optional
from contextvars import ContextVar
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import structlog


# Request ID를 전역적으로 참조할 수 있도록 ContextVar 사용
_request_id_context: ContextVar[str] = ContextVar("request_id", default="unknown")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Request ID 추적 미들웨어
    
    모든 요청에 고유한 request_id를 할당하고:
    - 응답 헤더에 X-Request-ID 추가
    - structlog context에 request_id 추가
    - 요청/응답 로깅
    """
    
    def __init__(self, app, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name
        self.logger = structlog.get_logger(__name__)
    
    @staticmethod
    def _hash_client_ip(ip: Optional[str]) -> Optional[str]:
        """
        Client IP를 해싱하여 개인정보 보호
        
        Args:
            ip: Client IP 주소
        
        Returns:
            SHA256 해시 (앞 16자)
        """
        if not ip:
            return None
        return hashlib.sha256(ip.encode()).hexdigest()[:16]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """요청 처리"""
        # 1. Request ID 생성 또는 기존 ID 사용
        request_id = request.headers.get(self.header_name) or str(uuid.uuid4())
        
        # 2. Request state와 ContextVar에 저장
        request.state.request_id = request_id
        _request_id_context.set(request_id)
        
        # 3. Client IP 해싱 (개인정보 보호)
        client_ip = request.client.host if request.client else None
        client_ip_hash = self._hash_client_ip(client_ip)
        
        # 4. structlog context에 추가
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_ip_hash=client_ip_hash  # 해시된 IP만 저장
        )
        
        # 5. 요청 시작 시간
        start_time = time.time()
        
        # 6. 조건부 로깅 (INFO 레벨 이상일 때만 상세 정보 수집)
        if self.logger.isEnabledFor(logging.INFO):
            query_params = dict(request.query_params) if request.query_params else {}
            user_agent = request.headers.get("user-agent", "")
            
            self.logger.info(
                "request_started",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                query_params=query_params,
                user_agent=user_agent[:100]  # User-Agent 길이 제한
            )
        
        # 6. 요청 처리
        try:
            response = await call_next(request)
        except Exception as exc:
            # 에러 로깅
            duration_ms = (time.time() - start_time) * 1000
            self.logger.error(
                "request_failed",
                request_id=request_id,
                duration_ms=duration_ms,
                error_type=type(exc).__name__,
                error_message=str(exc),
                exc_info=True
            )
            raise
        
        # 7. 응답 시간 계산
        duration_ms = (time.time() - start_time) * 1000
        
        # 8. 응답 로깅
        self.logger.info(
            "request_completed",
            request_id=request_id,
            status_code=response.status_code,
            duration_ms=duration_ms
        )
        
        # 9. 응답 헤더에 Request ID 추가
        response.headers[self.header_name] = request_id
        
        # 10. 응답 시간 헤더 추가
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        return response


def get_request_id(request: Request = None) -> str:
    """
    현재 요청의 request_id 반환
    
    Args:
        request: FastAPI Request 객체 (선택, None이면 ContextVar 사용)
    
    Returns:
        request_id 문자열
    
    Note:
        비동기 함수 내부에서 request 객체 없이도 호출 가능:
        >>> async def some_service():
        >>>     request_id = get_request_id()  # request 없이 사용
    """
    # Request 객체가 있으면 우선 사용
    if request is not None:
        return getattr(request.state, "request_id", "unknown")
    
    # Request 객체가 없으면 ContextVar에서 가져오기
    # (비동기 함수, LLM 호출 등에서 자동 전파)
    try:
        return _request_id_context.get()
    except LookupError:
        return "unknown"


def get_current_request_id() -> str:
    """
    ContextVar에서 현재 request_id 반환 (request 객체 불필요)
    
    Returns:
        request_id 문자열
    
    Example:
        >>> # 비동기 함수 내부에서
        >>> async def llm_call():
        >>>     request_id = get_current_request_id()
        >>>     logger.info("llm_started", request_id=request_id)
    """
    try:
        return _request_id_context.get()
    except LookupError:
        return "unknown"

