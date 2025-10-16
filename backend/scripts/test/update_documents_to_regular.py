"""
템플릿 문서를 일반 문서로 변경
- ID 1, 3, 4, 5를 is_template=False로 변경
"""
import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy import select, update
from src.core.database import AsyncSessionLocal
from src.documents.models import Document


async def update_to_regular():
    """템플릿 문서를 일반 문서로 변경"""
    async with AsyncSessionLocal() as session:
        # ID 1, 3, 4, 5 문서를 일반 문서로 변경
        document_ids = [1, 3, 4, 5]
        
        stmt = (
            update(Document)
            .where(Document.id.in_(document_ids))
            .values(is_template=False)
        )
        
        result = await session.execute(stmt)
        await session.commit()
        
        print(f"\n{result.rowcount}개 문서를 일반 문서로 변경했습니다.")
        
        # 변경 확인
        stmt = select(Document).where(Document.id.in_(document_ids))
        result = await session.execute(stmt)
        documents = result.scalars().all()
        
        print("\n=== 변경된 문서 ===")
        print(f"{'ID':<5} {'Title':<40} {'Template':<10}")
        print("-" * 60)
        for doc in documents:
            print(f"{doc.id:<5} {doc.title:<40} {str(doc.is_template):<10}")


if __name__ == "__main__":
    asyncio.run(update_to_regular())

