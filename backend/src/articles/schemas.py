from pydantic import BaseModel, Field
from typing import Optional, List, Literal
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
    image_url: Optional[str] = None
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


class MentionTrendItem(BaseModel):
    """회사별 언급량 트렌드 항목"""
    rank: int = Field(description="순위 (1-10)")
    company_id: int = Field(description="회사 ID")
    company_name: str = Field(description="회사명")
    company_name_en: Optional[str] = Field(default=None, description="회사 영문명")
    current_mentions: int = Field(description="최근 30일 언급량")
    previous_mentions: int = Field(description="직전 30일 언급량")
    change_rate: float = Field(description="증감률 (%)")
    change_type: Literal["up", "down", "stable"] = Field(description="변화 유형")
    
    # 새로 추가된 ESG 서비스 카테고리 정보
    primary_categories: List[str] = Field(default=[], description="주요 서비스 카테고리 (예: ['Carbon Accounting', 'ESG Reporting'])")
    service_categories: List[str] = Field(default=[], description="제공 서비스 코드 (예: ['A1', 'B1', 'C1'])")
    company_type: str = Field(default="", description="회사 유형 (All-in-One, Specialized, Niche)")
    
    latest_article_title: Optional[str] = Field(default=None, description="최신 기사 제목")
    latest_article_url: Optional[str] = Field(default=None, description="최신 기사 URL")
    latest_published_at: Optional[datetime] = Field(default=None, description="최신 기사 발행일")


class MentionTrendsResponse(BaseModel):
    """언급량 트렌드 응답 스키마"""
    trends: List[MentionTrendItem] = Field(description="상위 10개 회사 트렌드")
    period_days: int = Field(default=30, description="분석 기간 (일)")
    analysis_date: datetime = Field(description="분석 실행 시점")
    total_companies: int = Field(description="분석 대상 회사 수")


class CompanyMentionStats(BaseModel):
    """특정 회사 언급량 통계"""
    company_id: int = Field(description="회사 ID")
    company_name: str = Field(description="회사명")
    current_period_mentions: int = Field(description="현재 기간 언급량")
    previous_period_mentions: int = Field(description="이전 기간 언급량")
    change_rate: float = Field(description="증감률 (%)")
    change_type: Literal["up", "down", "stable"] = Field(description="변화 유형")
    daily_mentions: List[dict] = Field(description="일별 언급량 데이터")
    period_start: datetime = Field(description="분석 시작일")
    period_end: datetime = Field(description="분석 종료일")


class CategoryTrendItem(BaseModel):
    """카테고리별 언급량 트렌드 항목"""
    rank: int = Field(description="순위")
    category_code: str = Field(description="카테고리 코드 (A1, B1, C1 등)")
    category_name: str = Field(description="카테고리명")
    category_name_en: str = Field(description="카테고리 영문명")
    main_topic: str = Field(description="주요 토픽")
    current_mentions: int = Field(description="현재 기간 총 언급량")
    previous_mentions: int = Field(description="이전 기간 총 언급량")
    change_rate: float = Field(description="증감률 (%)")
    change_type: Literal["up", "down", "stable"] = Field(description="변화 유형")
    companies_count: int = Field(description="해당 카테고리 서비스 제공 회사 수")
    top_companies: List[str] = Field(description="상위 언급량 회사명 목록")


class CategoryTrendsResponse(BaseModel):
    """카테고리별 트렌드 응답 스키마"""
    trends: List[CategoryTrendItem] = Field(description="카테고리별 트렌드")
    period_days: int = Field(default=30, description="분석 기간 (일)")
    analysis_date: datetime = Field(description="분석 실행 시점")
    total_categories: int = Field(description="분석 대상 카테고리 수")
