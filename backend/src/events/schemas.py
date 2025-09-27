from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class EventBase(BaseModel):
    """이벤트 기본 스키마"""
    title: str = Field(..., max_length=255, description="이벤트 제목")
    description: Optional[str] = Field(None, description="이벤트 설명")
    start_date: date = Field(..., description="시작 날짜")
    end_date: Optional[date] = Field(None, description="종료 날짜 (없는 경우 NULL)")
    category: str = Field(..., max_length=50, description="카테고리 ('지원사업', '정책발표', '컨퍼런스', '공시마감')")
    source_url: Optional[str] = Field(None, max_length=2048, description="원문 링크")


class EventCreate(EventBase):
    """이벤트 생성 스키마"""
    pass


class EventUpdate(BaseModel):
    """이벤트 수정 스키마"""
    title: Optional[str] = Field(None, max_length=255, description="이벤트 제목")
    description: Optional[str] = Field(None, description="이벤트 설명")
    start_date: Optional[date] = Field(None, description="시작 날짜")
    end_date: Optional[date] = Field(None, description="종료 날짜")
    category: Optional[str] = Field(None, max_length=50, description="카테고리")
    source_url: Optional[str] = Field(None, max_length=2048, description="원문 링크")


class EventResponse(EventBase):
    """이벤트 응답 스키마"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    """이벤트 목록 응답 스키마"""
    events: List[EventResponse]
    total: int


class EventQueryParams(BaseModel):
    """이벤트 조회 쿼리 파라미터"""
    year: int = Field(..., ge=2020, le=2030, description="연도")
    month: int = Field(..., ge=1, le=12, description="월")
    category: Optional[str] = Field(None, description="카테고리 필터")


class EventCategoriesResponse(BaseModel):
    """카테고리 목록 응답 스키마"""
    categories: List[str] = Field(description="사용 가능한 카테고리 목록")
