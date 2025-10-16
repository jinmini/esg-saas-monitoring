"""
Version Management Schemas
버전 관리 시스템을 위한 Pydantic 스키마
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================
# Version Schemas
# ============================================

class VersionMetadata(BaseModel):
    """버전 메타데이터 (목록 조회용)"""
    id: int
    version_number: int
    comment: Optional[str] = None
    is_auto_saved: bool
    author_id: Optional[int] = None
    author_name: Optional[str] = None  # JOIN으로 가져옴
    sections_count: int = 0
    blocks_count: int = 0
    chars_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True
        orm_mode = True


class VersionCreate(BaseModel):
    """버전 생성 요청"""
    comment: Optional[str] = Field(None, max_length=500, description="버전 변경 요약 (선택)")
    is_auto_saved: bool = Field(default=False, description="자동 저장 여부")
    
    class Config:
        json_schema_extra = {
            "example": {
                "comment": "ESG 지표 섹션 업데이트",
                "is_auto_saved": False
            }
        }


class VersionResponse(BaseModel):
    """버전 상세 조회 응답"""
    id: int
    document_id: int
    version_number: int
    comment: Optional[str] = None
    is_auto_saved: bool
    author_id: Optional[int] = None
    author_name: Optional[str] = None
    snapshot_data: Dict[str, Any]  # 전체 DocumentNode JSON
    sections_count: int
    blocks_count: int
    chars_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        orm_mode = True


class VersionListResponse(BaseModel):
    """버전 목록 응답"""
    total: int
    has_next: bool = False  # ✅ 페이지네이션 개선
    has_prev: bool = False  # ✅ 페이지네이션 개선
    versions: List[VersionMetadata]
    
    class Config:
        from_attributes = True


class VersionRestoreResponse(BaseModel):
    """버전 복원 응답"""
    success: bool
    message: str
    restored_version_number: int
    backup_version_number: int  # ✅ 복원 전 자동 백업 버전 번호
    document: Dict[str, Any]  # ✅ DocumentResponse 대신 간단한 dict
    
    class Config:
        from_attributes = True


# ============================================
# Version Diff (Optional - Phase 1.4)
# ============================================

class SectionDiff(BaseModel):
    """섹션 차이점"""
    section_id: str
    section_title: str
    status: str  # 'added', 'removed', 'modified', 'unchanged'
    blocks_added: int = 0
    blocks_removed: int = 0
    blocks_modified: int = 0
    preview: Optional[str] = None  # 첫 100자 미리보기


class VersionDiffRequest(BaseModel):
    """버전 비교 요청"""
    source_version_id: int = Field(..., description="비교 기준 버전 ID")
    target_version_id: Optional[int] = Field(None, description="비교 대상 버전 ID (null이면 현재 문서)")


class VersionDiffResponse(BaseModel):
    """버전 비교 응답"""
    source_version: int
    target_version: Optional[int]
    sections_added: List[str] = []
    sections_removed: List[str] = []
    sections_modified: List[SectionDiff] = []
    blocks_added: int = 0
    blocks_removed: int = 0
    blocks_modified: int = 0
    chars_changed: int = 0
    
    class Config:
        from_attributes = True

