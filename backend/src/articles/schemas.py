from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ArticleResponse(BaseModel):
    """기사 응답 스키마"""
    id: int
    title: str
    source_name: Optional[str] = None
    article_url: str
    published_at: Optional[datetime] = None
    crawled_at: datetime
    summary: Optional[str] = None
    language: Optional[str] = "ko"
    is_verified: bool = False
    
    # 회사 정보
    company_id: int
    company_name: str
    company_name_en: Optional[str] = None
    
    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    """기사 목록 응답 스키마"""
    articles: List[ArticleResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool


class CompanyResponse(BaseModel):
    """회사 정보 응답 스키마"""
    id: int
    company_name: str
    company_name_en: Optional[str] = None
    website_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True


class FeedResponse(BaseModel):
    """통합 피드 응답 스키마"""
    articles: List[ArticleResponse]
    total: int
    page: int
    size: int
    has_next: bool
    companies_count: int
    latest_crawl: Optional[datetime] = None


class ArticleQueryParams(BaseModel):
    """기사 조회 쿼리 파라미터"""
    page: int = Field(default=1, ge=1, description="페이지 번호")
    size: int = Field(default=20, ge=1, le=100, description="페이지 크기")
    company_id: Optional[int] = Field(default=None, description="회사 ID 필터")
    sort: str = Field(default="published_at", description="정렬 기준")
    order: str = Field(default="desc", pattern="^(asc|desc)$", description="정렬 순서")
    search: Optional[str] = Field(default=None, max_length=100, description="제목 검색어")
    date_from: Optional[datetime] = Field(default=None, description="시작 날짜")
    date_to: Optional[datetime] = Field(default=None, description="종료 날짜")
