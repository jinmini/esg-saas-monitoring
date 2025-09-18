"""
CSV 파일에서 검색 키워드 데이터를 읽어 companies 테이블에 업데이트하는 스크립트
"""
import asyncio
import sys
import os
import csv
import json
from pathlib import Path

# Add src to path for local execution
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.core.database import AsyncSessionLocal
from src.shared.models import Company
from sqlalchemy import select, update


def parse_keywords(keyword_string: str) -> list:
    """키워드 문자열을 리스트로 변환"""
    if not keyword_string or keyword_string.strip() == "":
        return []
    
    # 쉼표로 분리하고 앞뒤 공백 제거
    keywords = [kw.strip() for kw in keyword_string.split(',')]
    # 빈 문자열 제거
    keywords = [kw for kw in keywords if kw]
    return keywords


async def update_companies_with_keywords():
    """CSV 파일에서 데이터를 읽어 companies 테이블 업데이트"""
    
    # CSV 파일 경로
    csv_path = Path(__file__).parent.parent.parent / "pubilc" / "docs" / "company_crawling_master.csv"
    
    if not csv_path.exists():
        print(f"❌ CSV 파일을 찾을 수 없습니다: {csv_path}")
        return
    
    async with AsyncSessionLocal() as session:
        try:
            # CSV 파일 읽기
            companies_data = []
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    companies_data.append({
                        'id': int(row['company_id']),
                        'company_name': row['company_name'],
                        'positive_keywords': parse_keywords(row['positive_keywords']),
                        'negative_keywords': parse_keywords(row['negative_keywords']),
                        'ceo_name': row['ceo_name'] if row['ceo_name'] else None,
                        'main_services': row['main_services'] if row['main_services'] else None,
                        'crawling_notes': row['notes'] if row['notes'] else None,
                        'search_strategy': 'enhanced'
                    })
            
            print(f"📖 CSV에서 {len(companies_data)}개 회사 데이터를 읽었습니다.")
            
            # 각 회사별로 데이터 업데이트 (회사명으로 매칭)
            updated_count = 0
            for company_data in companies_data:
                company_name = company_data['company_name']
                
                # 회사가 존재하는지 확인 (회사명으로 매칭)
                result = await session.execute(
                    select(Company).where(Company.company_name == company_name)
                )
                company = result.scalar_one_or_none()
                
                if company:
                    # 키워드 데이터 업데이트
                    await session.execute(
                        update(Company)
                        .where(Company.company_name == company_name)
                        .values(
                            positive_keywords=company_data['positive_keywords'],
                            negative_keywords=company_data['negative_keywords'],
                            ceo_name=company_data['ceo_name'],
                            main_services=company_data['main_services'],
                            crawling_notes=company_data['crawling_notes'],
                            search_strategy=company_data['search_strategy']
                        )
                    )
                    updated_count += 1
                    print(f"✅ {company_data['company_name']} (ID: {company.id}) 업데이트 완료")
                    print(f"   - 긍정 키워드: {company_data['positive_keywords']}")
                    print(f"   - 부정 키워드: {company_data['negative_keywords']}")
                else:
                    print(f"⚠️  '{company_name}' 회사를 찾을 수 없습니다.")
            
            await session.commit()
            print(f"\n🎉 총 {updated_count}개 회사의 검색 키워드가 업데이트되었습니다!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ 업데이트 실패: {e}")
            raise


async def verify_updates():
    """업데이트 결과 검증"""
    async with AsyncSessionLocal() as session:
        try:
            # 키워드가 설정된 회사들 조회
            result = await session.execute(
                select(Company.id, Company.company_name, Company.positive_keywords, Company.negative_keywords)
                .where(Company.positive_keywords.isnot(None))
                .order_by(Company.id)
            )
            companies = result.all()
            
            print(f"\n📊 검색 키워드가 설정된 회사: {len(companies)}개")
            print("-" * 80)
            
            for company in companies[:5]:  # 처음 5개만 출력
                print(f"ID {company.id}: {company.company_name}")
                print(f"  긍정: {company.positive_keywords}")
                print(f"  부정: {company.negative_keywords}")
                print()
                
        except Exception as e:
            print(f"❌ 검증 실패: {e}")


if __name__ == "__main__":
    print("🚀 회사 검색 키워드 업데이트를 시작합니다...")
    asyncio.run(update_companies_with_keywords())
    print("\n🔍 업데이트 결과를 검증합니다...")
    asyncio.run(verify_updates())
