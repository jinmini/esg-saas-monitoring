"""
Version Management Router
문서 버전 관리 API 엔드포인트
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from .version_service import VersionService
from .version_schemas import (
    VersionCreate,
    VersionResponse,
    VersionListResponse,
    VersionMetadata,
    VersionRestoreResponse,
    VersionDiffRequest,
    VersionDiffResponse,
)

router = APIRouter(prefix="/api/v1/documents", tags=["versions"])


# ====================================
# Version Management Endpoints
# ====================================

@router.post("/{document_id}/versions", response_model=VersionResponse, status_code=status.HTTP_201_CREATED)
async def create_version(
    document_id: int,
    data: VersionCreate,
    # current_user: User = Depends(get_current_user),  # TODO: JWT 인증 추가
    db: AsyncSession = Depends(get_db)
):
    """
    문서 버전 스냅샷 생성
    
    - **document_id**: 문서 ID
    - **comment**: 버전 설명 (선택)
    - **is_auto_saved**: 자동 저장 여부
    
    **사용 사례:**
    - 수동 저장: 사용자가 "버전 저장" 버튼 클릭
    - 자동 저장: Autosave 루프에서 주기적으로 호출
    """
    service = VersionService(db)
    user_id = None  # TODO: current_user.id로 교체
    
    version = await service.create_version(document_id, user_id, data)
    return version


@router.get("/{document_id}/versions", response_model=VersionListResponse)
async def list_versions(
    document_id: int,
    skip: int = Query(0, ge=0, description="페이지네이션 오프셋"),
    limit: int = Query(50, ge=1, le=100, description="최대 반환 개수"),
    include_auto_saved: bool = Query(True, description="자동 저장 버전 포함 여부"),
    db: AsyncSession = Depends(get_db)
):
    """
    문서 버전 목록 조회
    
    - **document_id**: 문서 ID
    - **skip**: 페이지네이션 오프셋
    - **limit**: 최대 반환 개수
    - **include_auto_saved**: 자동 저장 버전 포함 여부 (false면 수동 저장만)
    
    **Response:**
    - `total`: 전체 버전 개수
    - `has_next`: 다음 페이지 존재 여부
    - `has_prev`: 이전 페이지 존재 여부
    - `versions`: 버전 메타데이터 배열
    """
    service = VersionService(db)
    versions, total, has_next, has_prev = await service.list_versions(
        document_id, 
        skip, 
        limit, 
        include_auto_saved
    )
    
    return VersionListResponse(
        total=total,
        has_next=has_next,
        has_prev=has_prev,
        versions=versions
    )


@router.get("/versions/{version_id}", response_model=VersionResponse)
async def get_version(
    version_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 버전 상세 조회
    
    - **version_id**: 버전 ID
    
    **Response:**
    - 버전 메타데이터 + 전체 스냅샷 데이터 (snapshot_data)
    """
    service = VersionService(db)
    version = await service.get_version(version_id)
    
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Version {version_id} not found"
        )
    
    return version


@router.post("/{document_id}/versions/{version_id}/restore", response_model=VersionRestoreResponse)
async def restore_version(
    document_id: int,
    version_id: int,
    # current_user: User = Depends(get_current_user),  # TODO: JWT 인증 추가
    db: AsyncSession = Depends(get_db)
):
    """
    문서를 특정 버전으로 복원
    
    - **document_id**: 문서 ID
    - **version_id**: 복원할 버전 ID
    
    ⚠️ **주의사항:**
    - 복원 전 현재 상태가 자동으로 새 버전으로 백업됩니다.
    - 복원 후 Undo Stack을 리셋하고 Autosave를 트리거하세요. (Frontend)
    
    **Response:**
    - `restored_version_number`: 복원된 버전 번호
    - `backup_version_number`: 복원 전 자동 백업된 버전 번호
    - `document`: 복원된 문서 전체 데이터
    """
    service = VersionService(db)
    user_id = None  # TODO: current_user.id로 교체
    
    result = await service.restore_version(document_id, version_id, user_id)
    
    # 문서 객체를 dict로 변환
    document = result["document"]
    document_dict = {
        "id": document.id,
        "title": document.title,
        "description": document.description,
        "is_public": document.is_public,
        "is_template": document.is_template,
        "sections": [
            {
                "id": section.id,
                "title": section.title,
                "description": section.description,
                "order": section.order,
                "blocks": section.blocks,
                "griReference": section.gri_reference,
                "metadata": section.section_metadata,
            }
            for section in document.sections
        ],
        "created_at": document.created_at.isoformat(),
        "updated_at": document.updated_at.isoformat(),
    }
    
    return VersionRestoreResponse(
        success=True,
        message=f"Document restored to version {result['version_number']}",
        restored_version_number=result['version_number'],
        backup_version_number=result['backup_version_number'],
        document=document_dict
    )


@router.delete("/versions/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    version_id: int,
    # current_user: User = Depends(get_current_user),  # TODO: JWT + 권한 체크
    db: AsyncSession = Depends(get_db)
):
    """
    버전 삭제 (관리자 또는 작성자만)
    
    - **version_id**: 버전 ID
    
    ⚠️ **주의사항:**
    - 최신 버전은 삭제할 수 없습니다.
    - 작성자 또는 관리자 권한 필요 (TODO: RBAC 구현)
    """
    service = VersionService(db)
    user_id = None  # TODO: current_user.id로 교체
    
    success = await service.delete_version(version_id, user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete version (latest version or unauthorized)"
        )


# Optional: Diff Endpoint (Phase 1.4)
@router.post("/{document_id}/versions/diff", response_model=VersionDiffResponse)
async def compare_versions(
    document_id: int,
    data: VersionDiffRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    두 버전 간 차이점 비교 (Phase 1.4 - 미구현)
    
    - **source_version_id**: 비교 기준 버전 ID
    - **target_version_id**: 비교 대상 버전 ID (null이면 현재 문서)
    
    **Response:**
    - 섹션/블록 레벨 변경사항 통계
    - 추가/삭제/수정된 요소 목록
    """
    service = VersionService(db)
    diff_result = await service.compare_versions(
        document_id,
        data.source_version_id,
        data.target_version_id
    )
    return diff_result

