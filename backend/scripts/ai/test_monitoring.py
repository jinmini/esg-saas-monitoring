"""
모니터링 시스템 테스트 스크립트
"""
import sys
from pathlib import Path
import asyncio
from dotenv import load_dotenv

# 환경 변수 로드
env_path = Path(__file__).parent.parent.parent / ".env.dev"
load_dotenv(dotenv_path=env_path)

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ai_assist.core.logger import init_default_logger, get_logger
from src.ai_assist.core.metrics import (
    track_request,
    track_stage,
    record_matches,
    record_tokens,
    record_error,
    update_gpu_metrics,
    init_service_info
)
from src.ai_assist.monitoring.health import get_health_checker
from src.ai_assist.monitoring.alerting import get_alert_manager, AlertSeverity
from src.ai_assist.config import get_ai_config
import time

# 로깅 초기화
config = get_ai_config()
init_default_logger(
    log_level=config.LOG_LEVEL,
    log_format="console",  # 테스트에서는 console 포맷 사용
    log_file=None
)

logger = get_logger(__name__)


async def test_logging():
    """로깅 시스템 테스트"""
    print("\n" + "="*60)
    print("1. 로깅 시스템 테스트")
    print("="*60)
    
    logger.info("test_started", test_name="logging_system")
    logger.debug("debug_message", data="some debug info")
    logger.warning("warning_message", threshold_exceeded=True)
    logger.error("error_message", error_code="TEST_ERROR")
    
    # 컨텍스트 추가
    logger.bind(request_id="test-123", user_id=456).info(
        "user_action",
        action="esg_mapping",
        duration=2.5
    )
    
    print("✅ 로깅 테스트 완료")


async def test_metrics():
    """메트릭 시스템 테스트"""
    print("\n" + "="*60)
    print("2. 메트릭 시스템 테스트")
    print("="*60)
    
    # 서비스 정보 초기화
    init_service_info(
        version="1.0.0-test",
        model="gemini-2.5-flash",
        embedding_model="intfloat/multilingual-e5-base"
    )
    
    # 요청 추적
    with track_request(frameworks=["GRI"]):
        # 단계별 추적
        with track_stage("embedding"):
            time.sleep(0.1)
        
        with track_stage("vector_search"):
            time.sleep(0.05)
        
        with track_stage("llm_analysis"):
            time.sleep(0.3)
        
        with track_stage("json_parsing"):
            time.sleep(0.02)
    
    # 매칭 결과 기록
    record_matches(count=2, average_confidence=0.85)
    
    # 토큰 사용량 기록
    record_tokens(input_tokens=1200, output_tokens=800)
    
    # 에러 기록
    record_error("TestError")
    
    # GPU 메트릭 (시뮬레이션)
    try:
        import torch
        if torch.cuda.is_available():
            utilization = torch.cuda.memory_allocated() / torch.cuda.memory_reserved() if torch.cuda.memory_reserved() > 0 else 0
            memory_used = torch.cuda.memory_allocated()
            update_gpu_metrics(utilization, memory_used)
            print(f"📊 GPU 사용률: {utilization:.2%}, 메모리: {memory_used / 1024 / 1024:.0f} MB")
        else:
            print("ℹ️  GPU 사용 불가 (CPU 모드)")
    except Exception as e:
        print(f"⚠️  GPU 메트릭 수집 실패: {e}")
    
    print("✅ 메트릭 테스트 완료")
    print("\n💡 메트릭 확인: http://localhost:8000/api/v1/ai-assist/metrics")


async def test_health_check():
    """Health Check 테스트"""
    print("\n" + "="*60)
    print("3. Health Check 테스트")
    print("="*60)
    
    health_checker = get_health_checker()
    result = await health_checker.check_all()
    
    print(f"전체 상태: {result['status']}")
    print(f"시간: {result['timestamp']}")
    print("\n구성 요소 상태:")
    
    for component, status in result['checks'].items():
        status_emoji = "✅" if status['status'] == "healthy" else "⚠️" if status['status'] == "degraded" else "❌"
        print(f"{status_emoji} {component}: {status['status']}")
        
        # 추가 정보 출력
        if 'model' in status:
            print(f"   - 모델: {status['model']}")
        if 'document_count' in status:
            print(f"   - 문서 수: {status['document_count']}")
        if 'device_name' in status:
            print(f"   - GPU: {status['device_name']}")
        if 'error' in status:
            print(f"   - 에러: {status['error']}")
    
    print("\n✅ Health Check 테스트 완료")
    print("💡 API 확인: http://localhost:8000/api/v1/ai-assist/health")


async def test_alerting():
    """알림 시스템 테스트"""
    print("\n" + "="*60)
    print("4. 알림 시스템 테스트")
    print("="*60)
    
    alert_manager = get_alert_manager(config.SLACK_WEBHOOK_URL)
    
    if not alert_manager.enabled:
        print("⚠️  Slack Webhook URL이 설정되지 않았습니다.")
        print("   .env.dev에 AI_ASSIST_SLACK_WEBHOOK_URL을 추가하세요.")
        return
    
    # 테스트 알림 전송
    print("📤 Slack 테스트 알림 전송 중...")
    
    success = await alert_manager.send_alert(
        title="AI Assist 모니터링 테스트",
        message="모니터링 시스템이 정상적으로 작동합니다.",
        severity=AlertSeverity.INFO,
        context={
            "test_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "environment": "dev",
            "version": "1.0.0"
        }
    )
    
    if success:
        print("✅ Slack 알림 전송 성공!")
        print("   Slack 채널을 확인하세요.")
    else:
        print("❌ Slack 알림 전송 실패")
        print("   Webhook URL을 확인하세요.")


async def main():
    """메인 테스트 함수"""
    print("🔍 AI Assist 모니터링 시스템 테스트")
    print("="*60)
    
    try:
        await test_logging()
        await test_metrics()
        await test_health_check()
        await test_alerting()
        
        print("\n" + "="*60)
        print("✅ 모든 테스트 완료!")
        print("="*60)
        print("\n📋 다음 단계:")
        print("1. FastAPI 서버 실행: uvicorn src.main:app --reload")
        print("2. Health Check: http://localhost:8000/api/v1/ai-assist/health")
        print("3. Metrics: http://localhost:8000/api/v1/ai-assist/metrics")
        print("4. API 문서: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"\n❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

