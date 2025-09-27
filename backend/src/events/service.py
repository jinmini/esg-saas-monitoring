from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from datetime import date
from fastapi import HTTPException

from .schemas import (
    EventCreate, EventUpdate, EventResponse, EventListResponse,
    EventQueryParams, EventCategoriesResponse
)
from ..shared.models import Event


class EventService:
    """이벤트 조회 및 관리 서비스"""
    
    # 카테고리 목록 (확장 가능)
    AVAILABLE_CATEGORIES = [
        "지원사업",
        "정책발표", 
        "컨퍼런스",
        "공시마감"
    ]
    
    async def get_events_by_month(
        self,
        db: AsyncSession,
        query_params: EventQueryParams
    ) -> EventListResponse:
        """월별 이벤트 목록 조회 (카테고리 필터링 포함)"""
        
        # 기본 쿼리 구성
        query = select(Event).where(
            and_(
                extract('year', Event.start_date) == query_params.year,
                extract('month', Event.start_date) == query_params.month
            )
        )
        
        # 카테고리 필터링
        if query_params.category:
            if query_params.category not in self.AVAILABLE_CATEGORIES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid category. Available categories: {', '.join(self.AVAILABLE_CATEGORIES)}"
                )
            query = query.where(Event.category == query_params.category)
        
        # 시작 날짜 순으로 정렬
        query = query.order_by(Event.start_date, Event.created_at)
        
        # 쿼리 실행
        result = await db.execute(query)
        events = result.scalars().all()
        
        # 응답 변환
        event_responses = [
            EventResponse.from_orm(event) for event in events
        ]
        
        return EventListResponse(
            events=event_responses,
            total=len(event_responses)
        )
    
    async def create_event(
        self,
        db: AsyncSession,
        event_data: EventCreate
    ) -> EventResponse:
        """새 이벤트 생성 (관리자용)"""
        
        # 카테고리 유효성 검증
        if event_data.category not in self.AVAILABLE_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Available categories: {', '.join(self.AVAILABLE_CATEGORIES)}"
            )
        
        # 종료일이 시작일보다 이르지 않은지 검증
        if event_data.end_date and event_data.end_date < event_data.start_date:
            raise HTTPException(
                status_code=400,
                detail="End date cannot be earlier than start date"
            )
        
        # 이벤트 객체 생성
        db_event = Event(
            title=event_data.title,
            description=event_data.description,
            start_date=event_data.start_date,
            end_date=event_data.end_date,
            category=event_data.category,
            source_url=event_data.source_url
        )
        
        # 데이터베이스에 저장
        db.add(db_event)
        await db.commit()
        await db.refresh(db_event)
        
        return EventResponse.from_orm(db_event)
    
    async def get_event_by_id(
        self,
        db: AsyncSession,
        event_id: int
    ) -> Optional[EventResponse]:
        """ID로 특정 이벤트 조회"""
        
        result = await db.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()
        
        if not event:
            return None
        
        return EventResponse.from_orm(event)
    
    async def update_event(
        self,
        db: AsyncSession,
        event_id: int,
        event_data: EventUpdate
    ) -> Optional[EventResponse]:
        """이벤트 수정 (관리자용)"""
        
        result = await db.execute(
            select(Event).where(Event.id == event_id)
        )
        db_event = result.scalar_one_or_none()
        
        if not db_event:
            return None
        
        # 카테고리 유효성 검증
        if event_data.category and event_data.category not in self.AVAILABLE_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Available categories: {', '.join(self.AVAILABLE_CATEGORIES)}"
            )
        
        # 필드별 업데이트 (None이 아닌 값만)
        update_data = event_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_event, field, value)
        
        # 종료일 유효성 검증 (업데이트 후)
        if db_event.end_date and db_event.end_date < db_event.start_date:
            raise HTTPException(
                status_code=400,
                detail="End date cannot be earlier than start date"
            )
        
        # 데이터베이스에 저장
        await db.commit()
        await db.refresh(db_event)
        
        return EventResponse.from_orm(db_event)
    
    async def delete_event(
        self,
        db: AsyncSession,
        event_id: int
    ) -> bool:
        """이벤트 삭제 (관리자용)"""
        
        result = await db.execute(
            select(Event).where(Event.id == event_id)
        )
        db_event = result.scalar_one_or_none()
        
        if not db_event:
            return False
        
        await db.delete(db_event)
        await db.commit()
        
        return True
    
    async def get_categories(self) -> EventCategoriesResponse:
        """사용 가능한 카테고리 목록 조회"""
        
        return EventCategoriesResponse(
            categories=self.AVAILABLE_CATEGORIES
        )
    
    async def get_events_by_date_range(
        self,
        db: AsyncSession,
        start_date: date,
        end_date: date,
        category: Optional[str] = None
    ) -> List[EventResponse]:
        """날짜 범위로 이벤트 조회 (캘린더 렌더링용)"""
        
        # 기본 쿼리 구성
        query = select(Event).where(
            Event.start_date.between(start_date, end_date)
        )
        
        # 카테고리 필터링
        if category and category in self.AVAILABLE_CATEGORIES:
            query = query.where(Event.category == category)
        
        # 시작 날짜 순으로 정렬
        query = query.order_by(Event.start_date, Event.created_at)
        
        # 쿼리 실행
        result = await db.execute(query)
        events = result.scalars().all()
        
        return [EventResponse.from_orm(event) for event in events]
