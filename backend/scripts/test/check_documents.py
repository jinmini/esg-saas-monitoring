"""
문서 목록 확인 스크립트
- 모든 문서의 is_template 상태 확인
"""
import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import select
from src.core.database import AsyncSessionLocal
from src.documents.models import Document


async def check_documents():
    """모든 문서의 상태 확인"""
    async with AsyncSessionLocal() as session:
        # 모든 문서 조회
        stmt = select(Document).order_by(Document.id)
        result = await session.execute(stmt)
        documents = result.scalars().all()
        
        print("\n=== 문서 목록 ===")
        print(f"{'ID':<5} {'Title':<40} {'Template':<10} {'Public':<10}")
        print("-" * 70)
        
        for doc in documents:
            print(f"{doc.id:<5} {doc.title:<40} {str(doc.is_template):<10} {str(doc.is_public):<10}")
        
        print(f"\n총 {len(documents)}개 문서")
        
        # is_template=False 문서만 필터링
        templates = [d for d in documents if d.is_template]
        regular = [d for d in documents if not d.is_template]
        
        print(f"\n템플릿: {len(templates)}개")
        for doc in templates:
            print(f"  - ID {doc.id}: {doc.title}")
        
        print(f"\n일반 문서: {len(regular)}개")
        for doc in regular:
            print(f"  - ID {doc.id}: {doc.title}")


if __name__ == "__main__":
    asyncio.run(check_documents())

