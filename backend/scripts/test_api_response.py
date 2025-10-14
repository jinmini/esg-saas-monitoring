"""
API 응답 테스트 - metadata 필드 확인
"""
import asyncio
import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.core.config import settings
from src.documents.service import DocumentService
from src.documents.schemas import DocumentResponse


async def test_metadata_field():
    """metadata 필드가 API 응답에 제대로 노출되는지 테스트"""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        service = DocumentService(session)
        
        # 최근 생성된 문서 조회 (ID=4)
        document = await service.get_document(4)
        
        if not document:
            print("[ERROR] Document not found")
            return
        
        # Section의 section_metadata를 metadata로 매핑 (Router 로직 시뮬레이션)
        for section in document.sections:
            if hasattr(section, 'section_metadata'):
                section.metadata = section.section_metadata
        
        # Pydantic 모델로 변환하여 API 응답 시뮬레이션
        response = DocumentResponse.model_validate(document)
        response_dict = response.model_dump()
        
        print("[OK] API Response Test")
        print("=" * 60)
        print(f"Document ID: {response_dict['id']}")
        print(f"Title: {response_dict['title']}")
        print(f"Sections: {len(response_dict['sections'])}")
        print()
        
        # 첫 번째 섹션의 metadata 확인
        if response_dict['sections']:
            first_section = response_dict['sections'][0]
            print(f"Section 1: {first_section['title']}")
            print(f"  - Blocks: {len(first_section['blocks'])}")
            print(f"  - Metadata: {first_section.get('metadata', 'NOT FOUND')}")
            
            if 'metadata' in first_section:
                print("\n[SUCCESS] metadata 필드가 API 응답에 포함되었습니다!")
                print(f"  Category: {first_section['metadata'].get('category')}")
                print(f"  Status: {first_section['metadata'].get('status')}")
                print(f"  Owner: {first_section['metadata'].get('owner')}")
            else:
                print("\n[ERROR] metadata 필드가 API 응답에 없습니다!")
        
        print("\n" + "=" * 60)
        print("JSON Preview (first section metadata):")
        if response_dict['sections'] and 'metadata' in response_dict['sections'][0]:
            print(json.dumps(response_dict['sections'][0]['metadata'], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(test_metadata_field())

