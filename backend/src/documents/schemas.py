from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ============================================
# Section Schemas
# ============================================

class SectionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(default='')
    order: int = Field(default=0, ge=0)


class SectionCreate(SectionBase):
    """섹션 생성 요청"""
    pass


class SectionUpdate(BaseModel):
    """섹션 업데이트 요청 (부분 업데이트 허용)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    order: Optional[int] = Field(None, ge=0)


class SectionResponse(SectionBase):
    """섹션 응답"""
    id: int
    chapter_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# Chapter Schemas
# ============================================

class ChapterBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    order: int = Field(default=0, ge=0)
    is_collapsed: bool = Field(default=False)


class ChapterCreate(ChapterBase):
    """챕터 생성 요청"""
    sections: Optional[List[SectionCreate]] = Field(default_factory=list)


class ChapterUpdate(BaseModel):
    """챕터 업데이트 요청 (부분 업데이트 허용)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    order: Optional[int] = Field(None, ge=0)
    is_collapsed: Optional[bool] = None


class ChapterResponse(ChapterBase):
    """챕터 응답 (섹션 포함)"""
    id: int
    document_id: int
    sections: List[SectionResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# Document Schemas
# ============================================

class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = Field(default=False)
    is_template: bool = Field(default=False)


class DocumentCreate(DocumentBase):
    """문서 생성 요청 (중첩 구조 지원)"""
    chapters: Optional[List[ChapterCreate]] = Field(default_factory=list)


class DocumentUpdate(BaseModel):
    """문서 업데이트 요청 (부분 업데이트 허용)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None


class DocumentResponse(DocumentBase):
    """문서 응답 (전체 계층 구조 포함)"""
    id: int
    user_id: Optional[int]
    chapters: List[ChapterResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentListResponse(DocumentBase):
    """문서 목록 응답 (챕터/섹션 제외, 메타데이터만)"""
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    chapter_count: int = 0
    section_count: int = 0
    
    class Config:
        from_attributes = True


# ============================================
# Bulk Update Schema (Hybrid API용)
# ============================================

class DocumentBulkUpdate(BaseModel):
    """문서 전체 저장 (단일 API로 모든 변경사항 반영)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None
    chapters: List[ChapterCreate]  # 전체 챕터/섹션 구조


class DocumentBulkUpdateResponse(BaseModel):
    """Bulk 업데이트 응답"""
    success: bool
    message: str
    document: DocumentResponse

