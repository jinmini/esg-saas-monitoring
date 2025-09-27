from fastapi import APIRouter, HTTPException, Query, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from .service import EventService
from .schemas import (
    EventCreate,
    EventUpdate, 
    EventResponse,
    EventListResponse,
    EventQueryParams,
    EventCategoriesResponse
)
from ..core.database import get_db

router = APIRouter(prefix="/events", tags=["events"])
event_service = EventService()


@router.get("/", response_model=EventListResponse)
async def get_events(
    year: int = Query(..., ge=2020, le=2030, description="연도"),
    month: int = Query(..., ge=1, le=12, description="월"), 
    category: Optional[str] = Query(None, description="카테고리 필터"),
    db: AsyncSession = Depends(get_db)
):
    """
    월별 이벤트 목록 조회
    
    - **year**: 조회할 연도 (2020-2030)
    - **month**: 조회할 월 (1-12)
    - **category**: 카테고리 필터 ('지원사업', '정책발표', '컨퍼런스', '공시마감')
    """
    try:
        query_params = EventQueryParams(year=year, month=month, category=category)
        return await event_service.get_events_by_month(db, query_params)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch events: {str(e)}"
        )


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    새 이벤트 생성 (관리자용)
    
    - **title**: 이벤트 제목 (필수)
    - **description**: 이벤트 설명 (선택)
    - **start_date**: 시작 날짜 (필수)
    - **end_date**: 종료 날짜 (선택)
    - **category**: 카테고리 (필수)
    - **source_url**: 원문 링크 (선택)
    """
    try:
        return await event_service.create_event(db, event_data)
    except Exception as e:
        if "Invalid category" in str(e) or "End date cannot be earlier" in str(e):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}"
        )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    특정 이벤트 조회
    
    - **event_id**: 조회할 이벤트 ID
    """
    event = await event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found"
        )
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    이벤트 수정 (관리자용)
    
    - **event_id**: 수정할 이벤트 ID
    - 수정할 필드만 제공하면 됨 (부분 업데이트)
    """
    try:
        updated_event = await event_service.update_event(db, event_id, event_data)
        if not updated_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        return updated_event
    except Exception as e:
        if "Invalid category" in str(e) or "End date cannot be earlier" in str(e):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}"
        )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    이벤트 삭제 (관리자용)
    
    - **event_id**: 삭제할 이벤트 ID
    """
    success = await event_service.delete_event(db, event_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} not found"
        )
    return None  # 204 No Content


@router.get("/meta/categories", response_model=EventCategoriesResponse)
async def get_categories():
    """
    사용 가능한 카테고리 목록 조회
    """
    return await event_service.get_categories()
