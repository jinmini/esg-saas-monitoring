"""
기존 데이터 전체 초기화 스크립트
"""
import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database import AsyncSessionLocal
from shared.models import Company, ESGServiceCategory, CompanyServiceMapping, Article
from sqlalchemy import delete


async def cleanup_data():
    """기존 데이터 전체 삭제"""
    async with AsyncSessionLocal() as session:
        try:
            # 1. 기사 데이터 삭제 (외래키 제약조건)
            result1 = await session.execute(delete(Article))
            print(f'✅ 기사 데이터 {result1.rowcount}개 삭제 완료')
            
            # 2. 회사-서비스 매핑 삭제
            result2 = await session.execute(delete(CompanyServiceMapping))
            print(f'✅ 회사-서비스 매핑 {result2.rowcount}개 삭제 완료')
            
            # 3. ESG 서비스 카테고리 삭제
            result3 = await session.execute(delete(ESGServiceCategory))
            print(f'✅ ESG 서비스 카테고리 {result3.rowcount}개 삭제 완료')
            
            # 4. 회사 데이터 삭제
            result4 = await session.execute(delete(Company))
            print(f'✅ 회사 데이터 {result4.rowcount}개 삭제 완료')
            
            await session.commit()
            print('🗑️ 전체 데이터 초기화 완료!')
            
        except Exception as e:
            await session.rollback()
            print(f'❌ 데이터 초기화 실패: {e}')
            raise


async def main():
    print("🗑️ 기존 데이터 초기화 시작...")
    await cleanup_data()


if __name__ == "__main__":
    asyncio.run(main())
