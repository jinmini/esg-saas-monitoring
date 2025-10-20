"""
ESG 매핑 테스트 스크립트
"""
import sys
from pathlib import Path
import asyncio
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent.parent / ".env.dev"
load_dotenv(dotenv_path=env_path)

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ai_assist.esg_mapping import get_esg_mapping_service, ESGMappingRequest, reset_esg_mapping_service
from src.ai_assist.core.gemini_client import reset_gemini_client
import logging
import json

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# 싱글톤 리셋 (설정 변경 반영)
reset_gemini_client()
reset_esg_mapping_service()


async def test_esg_mapping():
    """ESG 매핑 테스트"""
    
    # 테스트 케이스
    test_cases = [
        {
            "name": "GRI 305-1 (Scope 1 배출)",
            "text": "우리 회사는 2024년 Scope 1 직접 온실가스 배출량이 1,200 tCO2e입니다. 이는 자체 보유 시설에서 발생한 직접 배출량으로, 전년 대비 5% 감소했습니다.",
            "frameworks": ["GRI"],
            "expected": "GRI 305-1"
        },
        {
            "name": "GRI 2-1 (조직 세부정보)",
            "text": "당사는 대한민국 서울특별시에 본사를 두고 있으며, 주식회사 형태로 운영되고 있습니다. 현재 한국, 중국, 베트남 3개국에서 사업을 운영하고 있습니다.",
            "frameworks": ["GRI"],
            "expected": "GRI 2-1"
        },
        {
            "name": "다중 프레임워크 검색",
            "text": "기후 변화 관련 리스크와 기회를 파악하고, 이에 대한 재무적 영향을 평가했습니다. 탄소 가격 상승 시나리오를 포함한 다양한 기후 시나리오를 분석했습니다.",
            "frameworks": None,  # 전체 검색
            "expected": "TCFD or GRI"
        }
    ]
    
    service = get_esg_mapping_service()
    
    logger.info("="*60)
    logger.info("ESG Mapping Test")
    logger.info("="*60)
    
    for i, test_case in enumerate(test_cases, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"Test Case {i}: {test_case['name']}")
        logger.info(f"{'='*60}")
        logger.info(f"Text: {test_case['text']}")
        logger.info(f"Frameworks: {test_case['frameworks']}")
        logger.info(f"Expected: {test_case['expected']}")
        logger.info("")
        
        request = ESGMappingRequest(
            text=test_case['text'],
            document_id=1,
            frameworks=test_case['frameworks'],
            top_k=5,
            min_confidence=0.5,
            language="ko"
        )
        
        try:
            response = await service.map_esg(request)
            
            logger.info(f"✅ Found {len(response.suggestions)} matches:")
            for j, suggestion in enumerate(response.suggestions, 1):
                logger.info(f"\n  [{j}] {suggestion.standard_id} ({suggestion.framework})")
                logger.info(f"      Category: {suggestion.category}")
                logger.info(f"      Topic: {suggestion.topic}")
                logger.info(f"      Title: {suggestion.title}")
                logger.info(f"      Confidence: {suggestion.confidence:.2f}")
                logger.info(f"      Reasoning: {suggestion.reasoning}")
            
            if response.summary:
                logger.info(f"\n  Summary: {response.summary}")
            
            logger.info(f"\n  Processing time: {response.metadata['processing_time']:.2f}s")
            
        except Exception as e:
            logger.error(f"❌ Test failed: {e}", exc_info=True)
    
    logger.info("\n" + "="*60)
    logger.info("Test Complete")
    logger.info("="*60)


if __name__ == "__main__":
    asyncio.run(test_esg_mapping())

