"""
알림 시스템

Slack, Email 등으로 에러 및 중요 이벤트를 알립니다.
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
import structlog
from enum import Enum

logger = structlog.get_logger(__name__)

# 중복 전송 방지용 캐시 (제목 → 마지막 전송 시간)
_last_sent: Dict[str, datetime] = {}
ALERT_COOLDOWN = timedelta(minutes=5)  # 5분 쿨다운


class AlertSeverity(str, Enum):
    """알림 심각도"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class AlertManager:
    """알림 관리자"""
    
    def __init__(self, slack_webhook_url: Optional[str] = None):
        """
        Args:
            slack_webhook_url: Slack Webhook URL
        """
        self.slack_webhook_url = slack_webhook_url
        self.enabled = slack_webhook_url is not None
    
    async def send_alert(
        self,
        title: str,
        message: str,
        severity: AlertSeverity = AlertSeverity.INFO,
        context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        알림 전송 (중복 방지 포함)
        
        Args:
            title: 알림 제목
            message: 알림 메시지
            severity: 심각도 (info, warning, error, critical)
            context: 추가 컨텍스트 정보
        
        Returns:
            전송 성공 여부
        """
        if not self.enabled:
            logger.warning("alerting_disabled", title=title)
            return False
        
        # 중복 전송 방지 (5분 이내 동일 제목은 스킵)
        global _last_sent
        now = datetime.utcnow()
        if title in _last_sent:
            time_since_last = now - _last_sent[title]
            if time_since_last < ALERT_COOLDOWN:
                logger.debug(
                    "alert_cooldown_active",
                    title=title,
                    time_since_last=time_since_last.total_seconds()
                )
                return False
        
        # Request ID 자동 추가 (ContextVar에서 가져오기)
        if context is None:
            context = {}
        
        # Request ID 추가 (있으면)
        try:
            from src.ai_assist.middleware.request_id import get_current_request_id
            request_id = get_current_request_id()
            if request_id != "unknown":
                context["request_id"] = request_id
        except Exception:
            pass  # Request ID를 가져올 수 없어도 알림은 전송
        
        # Slack으로 전송
        success = await self._send_to_slack(title, message, severity, context)
        
        # 전송 성공 시 캐시 업데이트
        if success:
            _last_sent[title] = now
            logger.info(
                "alert_sent",
                title=title,
                severity=severity.value,
                context=context
            )
        else:
            logger.error(
                "alert_failed",
                title=title,
                severity=severity.value
            )
        
        return success
    
    async def _send_to_slack(
        self,
        title: str,
        message: str,
        severity: AlertSeverity,
        context: Optional[Dict[str, Any]]
    ) -> bool:
        """Slack으로 알림 전송"""
        if not self.slack_webhook_url:
            return False
        
        # 심각도별 색상 및 이모지
        severity_config = {
            AlertSeverity.INFO: {"color": "#36a64f", "emoji": "ℹ️"},
            AlertSeverity.WARNING: {"color": "#ff9900", "emoji": "⚠️"},
            AlertSeverity.ERROR: {"color": "#ff0000", "emoji": "❌"},
            AlertSeverity.CRITICAL: {"color": "#8b0000", "emoji": "🚨"}
        }
        
        config = severity_config.get(severity, severity_config[AlertSeverity.INFO])
        
        # Slack 메시지 구성
        payload = {
            "text": f"{config['emoji']} *{title}*",
            "attachments": [
                {
                    "color": config["color"],
                    "fields": [
                        {
                            "title": "메시지",
                            "value": message,
                            "short": False
                        },
                        {
                            "title": "심각도",
                            "value": severity.value.upper(),
                            "short": True
                        },
                        {
                            "title": "시간",
                            "value": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                            "short": True
                        }
                    ]
                }
            ]
        }
        
        # 컨텍스트 정보 추가
        if context:
            context_text = "\n".join([
                f"*{key}*: `{value}`"
                for key, value in context.items()
            ])
            payload["attachments"][0]["fields"].append({
                "title": "상세 정보",
                "value": context_text,
                "short": False
            })
        
        # HTTP POST 전송
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.slack_webhook_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(
                "slack_webhook_error",
                error=str(e),
                exc_info=True
            )
            return False
    
    async def alert_high_error_rate(self, error_rate: float, threshold: float):
        """높은 에러율 알림"""
        await self.send_alert(
            title="High Error Rate Detected",
            message=f"에러율이 임계값을 초과했습니다.",
            severity=AlertSeverity.ERROR,
            context={
                "error_rate": f"{error_rate:.2%}",
                "threshold": f"{threshold:.2%}"
            }
        )
    
    async def alert_slow_response(self, p95_latency: float, threshold: float):
        """느린 응답 시간 알림"""
        await self.send_alert(
            title="Slow Response Time",
            message=f"P95 응답 시간이 임계값을 초과했습니다.",
            severity=AlertSeverity.WARNING,
            context={
                "p95_latency": f"{p95_latency:.2f}s",
                "threshold": f"{threshold:.2f}s"
            }
        )
    
    async def alert_high_token_usage(self, daily_tokens: int, limit: int):
        """높은 토큰 사용량 알림"""
        usage_percent = (daily_tokens / limit) * 100
        severity = (
            AlertSeverity.CRITICAL if usage_percent >= 90
            else AlertSeverity.WARNING if usage_percent >= 80
            else AlertSeverity.INFO
        )
        
        await self.send_alert(
            title="High Token Usage",
            message=f"일일 토큰 사용량이 {usage_percent:.1f}%에 도달했습니다.",
            severity=severity,
            context={
                "daily_tokens": f"{daily_tokens:,}",
                "limit": f"{limit:,}",
                "usage_percent": f"{usage_percent:.1f}%"
            }
        )
    
    async def alert_service_unhealthy(self, component: str, error: str):
        """서비스 비정상 알림"""
        await self.send_alert(
            title="Service Component Unhealthy",
            message=f"{component} 구성 요소가 비정상 상태입니다.",
            severity=AlertSeverity.CRITICAL,
            context={
                "component": component,
                "error": error
            }
        )
    
    async def alert_max_tokens_exceeded(self, request_id: str, text_length: int):
        """MAX_TOKENS 초과 알림"""
        await self.send_alert(
            title="MAX_TOKENS Exceeded",
            message="응답이 토큰 제한으로 잘렸습니다. 프롬프트 최적화가 필요합니다.",
            severity=AlertSeverity.WARNING,
            context={
                "request_id": request_id,
                "text_length": text_length
            }
        )
    
    async def alert_json_parsing_failure(self, request_id: str, attempts: int):
        """JSON 파싱 실패 알림"""
        await self.send_alert(
            title="JSON Parsing Failed",
            message=f"JSON 파싱이 {attempts}회 시도 후 실패했습니다.",
            severity=AlertSeverity.ERROR,
            context={
                "request_id": request_id,
                "attempts": attempts
            }
        )


# 전역 인스턴스
_alert_manager: Optional[AlertManager] = None


def get_alert_manager(slack_webhook_url: Optional[str] = None) -> AlertManager:
    """Alert Manager 싱글톤 반환"""
    global _alert_manager
    
    if _alert_manager is None:
        _alert_manager = AlertManager(slack_webhook_url)
    
    return _alert_manager


def init_alerting(slack_webhook_url: str):
    """
    알림 시스템 초기화
    
    Args:
        slack_webhook_url: Slack Webhook URL
    """
    global _alert_manager
    _alert_manager = AlertManager(slack_webhook_url)
    
    logger.info("alerting_initialized", enabled=True)

