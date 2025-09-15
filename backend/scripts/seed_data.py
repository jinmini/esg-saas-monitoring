"""
초기 테스트 데이터 삽입 스크립트
"""
import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from core.database import AsyncSessionLocal
from shared.models import Company


async def seed_companies():
    """ESG SaaS 기업 초기 데이터 삽입"""
    async with AsyncSessionLocal() as session:
        # 기존 데이터 확인
        companies_data = [
            {
                "company_name": "엔츠",
                "company_name_en": "AENTS",
                "website_url": "https://aents.co",
                "description": "탄소회계 플랫폼 엔스코프 운영",
                "is_active": True
            },
            {
                "company_name": "그리너리",
                "company_name_en": "Greenery",
                "website_url": "https://www.greenery.im",
                "description": "LCA 시스템 및 탄소크레딧 플랫폼 팝플 운영",
                "is_active": True
            },
            {
                "company_name": "오후두시랩",
                "company_name_en": "AfternoonLab",
                "website_url": "https://afternoonlab.co.kr",
                "description": "AI 기반 탄소관리 솔루션 그린플로 제공",
                "is_active": True
            },
            {
                "company_name": "테스트컴퍼니",
                "company_name_en": "TestCompany",
                "website_url": "https://test.com",
                "description": "테스트용 회사 데이터",
                "is_active": True
            }
        ]
        
        for company_data in companies_data:
            company = Company(**company_data)
            session.add(company)
        
        try:
            await session.commit()
            print(f"✅ {len(companies_data)}개 회사 데이터 삽입 완료")
        except Exception as e:
            await session.rollback()
            print(f"❌ 데이터 삽입 실패: {e}")


async def main():
    print("🌱 초기 데이터 삽입 시작...")
    await seed_companies()
    print("✅ 초기 데이터 삽입 완료")


if __name__ == "__main__":
    asyncio.run(main())
