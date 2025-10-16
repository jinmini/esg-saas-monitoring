from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from src.core.database import get_db
from .service import DocumentService
from .schemas import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse,
    DocumentListPaginatedResponse,
    DocumentBulkUpdate, DocumentBulkUpdateResponse,
    SectionCreate, SectionUpdate, SectionResponse
)

router = APIRouter(prefix="/documents", tags=["Documents"])


# ====================================
# Document Endpoints
# ====================================

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    data: DocumentCreate,
    user_id: Optional[int] = Query(None, description="User ID (OAuth 추후 구현)"),
    db: AsyncSession = Depends(get_db)
):
    """
    새 문서 생성 (중첩 구조 지원)
    
    - **user_id**: 문서 소유자 (옵션)
    - **title**: 문서 제목
    - **description**: 문서 설명
    - **is_public**: 공개 여부
    - **is_template**: 템플릿 여부
    - **sections**: 섹션 및 블록 목록 (JSON)
    """
    service = DocumentService(db)
    return await service.create_document(user_id, data)


@router.get("/", response_model=DocumentListPaginatedResponse)
async def list_documents(
    user_id: Optional[int] = Query(None, description="사용자 ID 필터"),
    is_template: Optional[bool] = Query(None, description="템플릿만 조회"),
    is_public: Optional[bool] = Query(None, description="공개 문서만 조회"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """
    문서 목록 조회 (메타데이터만, 섹션 제외)
    
    - **user_id**: 특정 사용자의 문서만 조회
    - **is_template**: true면 템플릿만, false면 일반 문서만
    - **is_public**: true면 공개 문서만, false면 비공개 문서만
    - 페이지네이션 메타데이터 포함 (total, skip, limit, has_next)
    """
    service = DocumentService(db)
    documents = await service.list_documents(
        user_id=user_id,
        is_template=is_template,
        is_public=is_public,
        skip=skip,
        limit=limit
    )
    
    # 전체 문서 수 조회
    total = await service.count_documents(
        user_id=user_id,
        is_template=is_template,
        is_public=is_public
    )
    
    # 섹션 개수 계산
    result = []
    for doc in documents:
        doc_dict = {
            "id": doc.id,
            "user_id": doc.user_id,
            "title": doc.title,
            "description": doc.description,
            "is_public": doc.is_public,
            "is_template": doc.is_template,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
            "section_count": len(doc.sections) if hasattr(doc, 'sections') else 0
        }
        result.append(DocumentListResponse(**doc_dict))
    
    return DocumentListPaginatedResponse(
        documents=result,
        total=total,
        skip=skip,
        limit=limit,
        has_next=(skip + limit) < total
    )


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    문서 상세 조회 (전체 계층 구조 포함)
    
    - **document_id**: 문서 ID
    - 응답에 모든 sections와 blocks JSON이 포함됨
    """
    service = DocumentService(db)
    document = await service.get_document(document_id)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found"
        )
    
    return document


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    data: DocumentUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    문서 메타데이터 업데이트 (제목, 설명 등)
    
    - **document_id**: 문서 ID
    - **data**: 업데이트할 필드 (부분 업데이트 지원)
    """
    service = DocumentService(db)
    return await service.update_document(document_id, data)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    문서 삭제 (CASCADE로 섹션도 삭제됨)
    
    - **document_id**: 문서 ID
    """
    service = DocumentService(db)
    success = await service.delete_document(document_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {document_id} not found"
        )


# ====================================
# Bulk Update (Hybrid API - MVP 최적화)
# ====================================

@router.post("/{document_id}/bulk-update", response_model=DocumentBulkUpdateResponse)
async def bulk_update_document(
    document_id: int,
    data: DocumentBulkUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    문서 전체 저장 (단일 API로 모든 변경사항 반영)
    
    MVP 최적화: 프론트에서 저장 버튼 클릭 시 전체 문서 구조를 한 번에 전송
    
    - **document_id**: 문서 ID
    - **data**: 전체 섹션/블록 구조
    """
    service = DocumentService(db)
    document = await service.bulk_update_document(document_id, data)
    
    return DocumentBulkUpdateResponse(
        success=True,
        message="Document updated successfully",
        document=document
    )


# ====================================
# Section Endpoints
# ====================================

@router.post("/{document_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    document_id: int,
    data: SectionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    섹션 생성 (Document 직접 하위)
    
    - **document_id**: 문서 ID
    - **data**: 섹션 데이터 (blocks JSON 포함)
    """
    service = DocumentService(db)
    return await service.create_section(document_id, data)


@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    data: SectionUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    섹션 업데이트 (제목, 블록, 메타데이터 등)
    
    - **section_id**: 섹션 ID
    - **data**: 업데이트할 필드 (blocks JSON 포함 가능)
    """
    service = DocumentService(db)
    return await service.update_section(section_id, data)


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    섹션 삭제
    
    - **section_id**: 섹션 ID
    """
    service = DocumentService(db)
    success = await service.delete_section(section_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Section {section_id} not found"
        )
