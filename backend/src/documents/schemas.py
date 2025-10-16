from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal, Union
from datetime import datetime


# ============================================
# InlineNode (프론트엔드와 100% 일치)
# ============================================

class InlineLink(BaseModel):
    """하이퍼링크 객체"""
    url: str
    title: Optional[str] = None
    target: Optional[str] = '_blank'


class InlineAnnotation(BaseModel):
    """주석/코멘트 정보"""
    id: str
    authorId: str
    text: str
    createdAt: str
    resolved: Optional[bool] = False


class InlineNode(BaseModel):
    """블록 내부의 최소 단위 텍스트 노드"""
    id: str  # 프론트엔드 추가 필드
    type: Literal['inline'] = 'inline'
    text: str
    marks: Optional[List[str]] = Field(default_factory=list)
    link: Optional[InlineLink] = None
    annotation: Optional[InlineAnnotation] = None


# ============================================
# BlockNode (프론트엔드 타입과 일치)
# ============================================

class BlockAttributes(BaseModel):
    """블록 공통 속성"""
    align: Optional[str] = None
    indent: Optional[int] = None
    level: Optional[int] = None
    backgroundColor: Optional[str] = None
    border: Optional[str] = None
    padding: Optional[Union[int, str]] = None
    style: Optional[Dict[str, Any]] = None
    
    # 특정 블록 전용 속성
    listType: Optional[str] = None  # list 블록용 (ordered/unordered)
    startNumber: Optional[int] = None  # ordered list용
    width: Optional[Union[int, str]] = None  # image용
    height: Optional[Union[int, str]] = None  # image용


class ListItemNode(BaseModel):
    """리스트 아이템"""
    id: str
    content: List[InlineNode]


class BlockNode(BaseModel):
    """문서 콘텐츠의 최소 독립 단위"""
    id: str
    blockType: str  # paragraph, heading, image, list, quote, table, chart, esgMetric
    attributes: Optional[BlockAttributes] = None
    content: Optional[List[InlineNode]] = None
    data: Optional[Dict[str, Any]] = None
    children: Optional[List[ListItemNode]] = None  # list 블록용


# ============================================
# Section (프론트엔드와 일치)
# ============================================

class GRIReference(BaseModel):
    """ESG 표준 매핑"""
    code: List[str]
    framework: Literal['GRI', 'SASB', 'TCFD', 'ISO26000', 'ESRS']


class SectionAttachment(BaseModel):
    """섹션 첨부파일"""
    id: str
    name: str
    url: str
    type: Literal['file', 'image', 'pdf']
    uploadedAt: str
    uploadedBy: str


class SectionMetadata(BaseModel):
    """섹션 메타데이터"""
    owner: Optional[str] = None
    category: Optional[Literal['E', 'S', 'G', 'General']] = None
    tags: Optional[List[str]] = None
    status: Optional[Literal['draft', 'in_review', 'approved', 'archived', 'rejected']] = None
    attachments: Optional[List[SectionAttachment]] = None


class SectionBase(BaseModel):
    """섹션 기본 스키마"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    order: int = Field(default=0, ge=0)
    blocks: List[BlockNode] = Field(default_factory=list)
    griReference: Optional[List[GRIReference]] = Field(None, alias="gri_reference")
    metadata: Optional[SectionMetadata] = Field(None, alias="section_metadata")


class SectionCreate(SectionBase):
    """섹션 생성 요청"""
    pass


class SectionUpdate(BaseModel):
    """섹션 업데이트 요청 (부분 업데이트 허용)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    order: Optional[int] = None
    blocks: Optional[List[BlockNode]] = None
    griReference: Optional[List[GRIReference]] = Field(None, alias="gri_reference")
    metadata: Optional[SectionMetadata] = Field(None, alias="section_metadata")


class SectionResponse(SectionBase):
    """섹션 응답"""
    id: int
    document_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True  # alias와 실제 필드명 모두 허용


# ============================================
# Document
# ============================================

class DocumentBase(BaseModel):
    """문서 기본 스키마"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: bool = Field(default=False)
    is_template: bool = Field(default=False)


class DocumentCreate(DocumentBase):
    """문서 생성 요청 (중첩 구조 지원)"""
    sections: List[SectionCreate] = Field(default_factory=list)


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
    sections: List[SectionResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentListResponse(DocumentBase):
    """문서 목록 응답 (섹션 제외, 메타데이터만)"""
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    section_count: int = 0
    
    class Config:
        from_attributes = True


class DocumentListPaginatedResponse(BaseModel):
    """문서 목록 페이지네이션 응답"""
    documents: List[DocumentListResponse]
    total: int
    skip: int
    limit: int
    has_next: bool


# ============================================
# Bulk Update Schema (Hybrid API용)
# ============================================

class DocumentBulkUpdate(BaseModel):
    """문서 전체 저장 (단일 API로 모든 변경사항 반영)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None
    sections: List[SectionCreate]  # 전체 섹션 구조


class DocumentBulkUpdateResponse(BaseModel):
    """Bulk 업데이트 응답"""
    success: bool
    message: str
    document: "DocumentResponse"  # ✅ ForwardRef로 순환 참조 방지
    
    class Config:
        from_attributes = True
