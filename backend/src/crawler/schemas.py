from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NaverNewsItem(BaseModel):
    """네이버 뉴스 API 응답 아이템 스키마"""
    title: str
    originallink: str
    link: str
    description: str
    pubDate: str


class NaverNewsResponse(BaseModel):
    """네이버 뉴스 API 응답 스키마"""
    lastBuildDate: str
    total: int
    start: int
    display: int
    items: List[NaverNewsItem]


class NewsSearchRequest(BaseModel):
    """뉴스 검색 요청 스키마"""
    query: str = Field(..., min_length=1, max_length=100, description="검색어")
    display: Optional[int] = Field(default=10, ge=1, le=100, description="검색 결과 출력 건수")
    start: Optional[int] = Field(default=1, ge=1, le=1000, description="검색 시작 위치")
    sort: Optional[str] = Field(default="sim", pattern="^(sim|date)$", description="정렬 옵션")


class CrawlResult(BaseModel):
    """크롤링 결과 스키마"""
    company_id: int
    company_name: str
    query: str
    total_found: int
    articles_saved: int
    success: bool
    error_message: Optional[str] = None
    crawl_duration: float
    articles_data: Optional[List[dict]] = []  # 크롤링된 실제 기사 데이터


class CrawlStartResponse(BaseModel):
    """크롤링 시작 응답 스키마 (백그라운드 실행)"""
    message: str = Field(description="응답 메시지")
    status: str = Field(description="크롤링 상태 (started, failed 등)")


class ArticleCreateRequest(BaseModel):
    """기사 생성 요청 스키마"""
    company_id: int
    title: str
    source_name: Optional[str] = None
    article_url: str
    published_at: Optional[datetime] = None
    content: Optional[str] = None
    summary: Optional[str] = None
