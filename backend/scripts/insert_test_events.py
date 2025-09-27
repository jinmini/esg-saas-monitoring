#!/usr/bin/env python3
"""
테스트용 ESG 이벤트 데이터 삽입 스크립트
실제 ESG 관련 일정을 기반으로 한 샘플 데이터
"""

import asyncio
import json
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
import sys
import os

# 상위 디렉토리를 Python 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from core.database import AsyncSessionLocal
from events.schemas import EventCreate
from events.service import EventService


async def insert_test_events():
    """테스트 이벤트 데이터 삽입"""
    
    # 실제 ESG 관련 일정들 (공시마감, 지원사업 우선)
    test_events = [
        # 공시마감 이벤트들
        EventCreate(
            title="ESRS 간소화 공개 의견 수렴 마감",
            description="유럽 지속가능성 보고 표준(ESRS) 간소화 방안에 대한 공개 의견 수렴 마감일",
            start_date=date(2025, 9, 29),
            end_date=date(2025, 9, 29),
            category="공시마감",
            source_url="https://www.efrag.org/Activities/Sustainability-reporting"
        ),
        EventCreate(
            title="CDP 기후변화 질의서 제출 마감",
            description="CDP(탄소정보공개프로젝트) 2025년 기후변화 질의서 제출 마감일",
            start_date=date(2025, 7, 31),
            end_date=date(2025, 7, 31),
            category="공시마감",
            source_url="https://www.cdp.net/en/climate"
        ),
        EventCreate(
            title="K-ESG 가이드라인 개정안 의견 수렴 마감",
            description="한국형 ESG 공시 가이드라인 개정안에 대한 의견 수렴 마감일",
            start_date=date(2025, 10, 15),
            end_date=date(2025, 10, 15),
            category="공시마감",
            source_url="https://www.fss.or.kr"
        ),
        
        # 지원사업 이벤트들
        EventCreate(
            title="녹색기술 R&D 지원사업 신청 마감",
            description="2025년 녹색기술연구개발 종합지원사업 신청 접수 마감",
            start_date=date(2025, 11, 30),
            end_date=date(2025, 11, 30),
            category="지원사업",
            source_url="https://www.gtck.re.kr"
        ),
        EventCreate(
            title="ESG 스타트업 육성 프로그램 모집 마감",
            description="중소벤처기업부 ESG 특화 스타트업 육성 프로그램 모집 마감",
            start_date=date(2025, 10, 20),
            end_date=date(2025, 10, 20),
            category="지원사업",
            source_url="https://www.mss.go.kr"
        ),
        
        # 정책발표 이벤트들
        EventCreate(
            title="탄소중립 녹색성장 기본계획 발표",
            description="정부 제2차 탄소중립·녹색성장 국가전략 및 기본계획 발표 예정",
            start_date=date(2025, 12, 15),
            end_date=date(2025, 12, 15),
            category="정책발표",
            source_url="https://www.2050cnc.go.kr"
        ),
        
        # 컨퍼런스 이벤트들
        EventCreate(
            title="Korea ESG Summit 2025",
            description="국내 최대 ESG 컨퍼런스, ESG 경영 트렌드와 실무 사례 공유",
            start_date=date(2025, 11, 5),
            end_date=date(2025, 11, 7),
            category="컨퍼런스",
            source_url="https://www.koreaesgsummit.com"
        ),
        EventCreate(
            title="글로벌 기후변화 대응 컨퍼런스",
            description="기후변화 대응 기술과 정책을 논의하는 국제 컨퍼런스",
            start_date=date(2025, 10, 12),
            end_date=date(2025, 10, 14),
            category="컨퍼런스",
            source_url="https://www.climateconference.kr"
        ),
    ]
    
    event_service = EventService()
    
    async with AsyncSessionLocal() as db:
        created_events = []
        
        for event_data in test_events:
            try:
                created_event = await event_service.create_event(db, event_data)
                created_events.append(created_event)
                print(f"✅ 이벤트 생성 성공: {created_event.title}")
            except Exception as e:
                print(f"❌ 이벤트 생성 실패: {event_data.title} - {str(e)}")
        
        print(f"\n🎉 총 {len(created_events)}개 이벤트가 생성되었습니다!")
        
        # 생성된 이벤트 목록 출력
        print("\n📋 생성된 이벤트 목록:")
        for event in created_events:
            print(f"  • [{event.category}] {event.title} ({event.start_date})")


if __name__ == "__main__":
    print("🚀 테스트 이벤트 데이터 삽입을 시작합니다...")
    asyncio.run(insert_test_events())
