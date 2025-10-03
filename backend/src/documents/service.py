from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from fastapi import HTTPException, status

from .models import Document, Chapter, Section
from .schemas import (
    DocumentCreate, DocumentUpdate, DocumentBulkUpdate,
    ChapterCreate, ChapterUpdate,
    SectionCreate, SectionUpdate
)


class DocumentService:
    """문서 관리 비즈니스 로직"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ====================================
    # Document CRUD
    # ====================================
    
    async def create_document(
        self, 
        user_id: Optional[int], 
        data: DocumentCreate
    ) -> Document:
        """문서 생성 (중첩 구조 지원)"""
        document = Document(
            user_id=user_id,
            title=data.title,
            description=data.description,
            is_public=data.is_public,
            is_template=data.is_template
        )
        
        # 챕터 및 섹션 생성
        for chapter_data in data.chapters:
            chapter = Chapter(
                title=chapter_data.title,
                order=chapter_data.order,
                is_collapsed=chapter_data.is_collapsed
            )
            
            # 섹션 생성
            for section_data in chapter_data.sections:
                section = Section(
                    title=section_data.title,
                    content=section_data.content,
                    order=section_data.order
                )
                chapter.sections.append(section)
            
            document.chapters.append(chapter)
        
        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)
        
        # 관계 로드
        await self.db.refresh(document, ['chapters'])
        for chapter in document.chapters:
            await self.db.refresh(chapter, ['sections'])
        
        return document
    
    async def get_document(self, document_id: int) -> Optional[Document]:
        """문서 조회 (전체 계층 구조 포함)"""
        stmt = (
            select(Document)
            .options(
                selectinload(Document.chapters).selectinload(Chapter.sections)
            )
            .where(Document.id == document_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def list_documents(
        self,
        user_id: Optional[int] = None,
        is_template: Optional[bool] = None,
        is_public: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Document]:
        """문서 목록 조회"""
        stmt = select(Document)
        
        # 필터링
        if user_id is not None:
            stmt = stmt.where(Document.user_id == user_id)
        if is_template is not None:
            stmt = stmt.where(Document.is_template == is_template)
        if is_public is not None:
            stmt = stmt.where(Document.is_public == is_public)
        
        stmt = stmt.offset(skip).limit(limit).order_by(Document.updated_at.desc())
        
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def update_document(
        self, 
        document_id: int, 
        data: DocumentUpdate
    ) -> Document:
        """문서 메타데이터 업데이트"""
        document = await self.get_document(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
        
        # 부분 업데이트
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(document, key, value)
        
        await self.db.commit()
        await self.db.refresh(document)
        return document
    
    async def delete_document(self, document_id: int) -> bool:
        """문서 삭제 (CASCADE로 챕터/섹션도 삭제됨)"""
        document = await self.get_document(document_id)
        if not document:
            return False
        
        await self.db.delete(document)
        await self.db.commit()
        return True
    
    # ====================================
    # Bulk Update (Hybrid API)
    # ====================================
    
    async def bulk_update_document(
        self, 
        document_id: int, 
        data: DocumentBulkUpdate
    ) -> Document:
        """문서 전체 저장 (단일 API로 모든 변경사항 반영)"""
        document = await self.get_document(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
        
        # 메타데이터 업데이트
        if data.title is not None:
            document.title = data.title
        if data.description is not None:
            document.description = data.description
        if data.is_public is not None:
            document.is_public = data.is_public
        if data.is_template is not None:
            document.is_template = data.is_template
        
        # 기존 챕터/섹션 모두 삭제 후 재생성 (단순 전략)
        await self.db.execute(
            delete(Chapter).where(Chapter.document_id == document_id)
        )
        
        # 새 챕터/섹션 생성
        for chapter_data in data.chapters:
            chapter = Chapter(
                document_id=document_id,
                title=chapter_data.title,
                order=chapter_data.order,
                is_collapsed=chapter_data.is_collapsed
            )
            
            for section_data in chapter_data.sections:
                section = Section(
                    title=section_data.title,
                    content=section_data.content,
                    order=section_data.order
                )
                chapter.sections.append(section)
            
            document.chapters.append(chapter)
        
        await self.db.commit()
        await self.db.refresh(document)
        
        # 관계 재로드
        return await self.get_document(document_id)
    
    # ====================================
    # Chapter CRUD
    # ====================================
    
    async def create_chapter(
        self, 
        document_id: int, 
        data: ChapterCreate
    ) -> Chapter:
        """챕터 생성"""
        # 문서 존재 확인
        document = await self.get_document(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
        
        chapter = Chapter(
            document_id=document_id,
            title=data.title,
            order=data.order,
            is_collapsed=data.is_collapsed
        )
        
        # 섹션 생성
        for section_data in data.sections:
            section = Section(
                title=section_data.title,
                content=section_data.content,
                order=section_data.order
            )
            chapter.sections.append(section)
        
        self.db.add(chapter)
        await self.db.commit()
        await self.db.refresh(chapter)
        await self.db.refresh(chapter, ['sections'])
        
        return chapter
    
    async def update_chapter(
        self, 
        chapter_id: int, 
        data: ChapterUpdate
    ) -> Chapter:
        """챕터 업데이트"""
        stmt = select(Chapter).where(Chapter.id == chapter_id)
        result = await self.db.execute(stmt)
        chapter = result.scalar_one_or_none()
        
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter {chapter_id} not found"
            )
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(chapter, key, value)
        
        await self.db.commit()
        await self.db.refresh(chapter)
        return chapter
    
    async def delete_chapter(self, chapter_id: int) -> bool:
        """챕터 삭제"""
        stmt = select(Chapter).where(Chapter.id == chapter_id)
        result = await self.db.execute(stmt)
        chapter = result.scalar_one_or_none()
        
        if not chapter:
            return False
        
        await self.db.delete(chapter)
        await self.db.commit()
        return True
    
    # ====================================
    # Section CRUD
    # ====================================
    
    async def create_section(
        self, 
        chapter_id: int, 
        data: SectionCreate
    ) -> Section:
        """섹션 생성"""
        # 챕터 존재 확인
        stmt = select(Chapter).where(Chapter.id == chapter_id)
        result = await self.db.execute(stmt)
        chapter = result.scalar_one_or_none()
        
        if not chapter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter {chapter_id} not found"
            )
        
        section = Section(
            chapter_id=chapter_id,
            title=data.title,
            content=data.content,
            order=data.order
        )
        
        self.db.add(section)
        await self.db.commit()
        await self.db.refresh(section)
        
        return section
    
    async def update_section(
        self, 
        section_id: int, 
        data: SectionUpdate
    ) -> Section:
        """섹션 업데이트"""
        stmt = select(Section).where(Section.id == section_id)
        result = await self.db.execute(stmt)
        section = result.scalar_one_or_none()
        
        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Section {section_id} not found"
            )
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(section, key, value)
        
        await self.db.commit()
        await self.db.refresh(section)
        return section
    
    async def delete_section(self, section_id: int) -> bool:
        """섹션 삭제"""
        stmt = select(Section).where(Section.id == section_id)
        result = await self.db.execute(stmt)
        section = result.scalar_one_or_none()
        
        if not section:
            return False
        
        await self.db.delete(section)
        await self.db.commit()
        return True

