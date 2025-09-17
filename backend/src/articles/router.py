from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from datetime import datetime

from .service import ArticleService
from .schemas import (
    ArticleListResponse, 
    FeedResponse, 
    ArticleResponse, 
    CompanyResponse,
    ArticleQueryParams,
    MentionTrendsResponse,
    CompanyMentionStats,
    CategoryTrendsResponse
)

router = APIRouter(prefix="/articles", tags=["articles"])
article_service = ArticleService()


@router.get("/", response_model=ArticleListResponse)
async def get_articles(
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    size: int = Query(default=20, ge=1, le=100, description="페이지 크기"),
    company_id: Optional[int] = Query(default=None, description="회사 ID 필터"),
    sort: str = Query(default="published_at", description="정렬 기준 (published_at, crawled_at, title)"),
    order: str = Query(default="desc", pattern="^(asc|desc)$", description="정렬 순서"),
    search: Optional[str] = Query(default=None, max_length=100, description="제목 검색어"),
    date_from: Optional[datetime] = Query(default=None, description="시작 날짜 (ISO 8601)"),
    date_to: Optional[datetime] = Query(default=None, description="종료 날짜 (ISO 8601)")
):
    """
    기사 목록 조회
    
    - **page**: 페이지 번호 (1부터 시작)
    - **size**: 페이지당 기사 수 (최대 100개)
    - **company_id**: 특정 회사의 기사만 조회
    - **sort**: 정렬 기준 (published_at, crawled_at, title)
    - **order**: 정렬 순서 (asc, desc)
    - **search**: 제목 검색어
    - **date_from**: 시작 날짜
    - **date_to**: 종료 날짜
    """
    try:
        params = ArticleQueryParams(
            page=page,
            size=size,
            company_id=company_id,
            sort=sort,
            order=order,
            search=search,
            date_from=date_from,
            date_to=date_to
        )
        
        return await article_service.get_articles(params)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get articles: {str(e)}")


@router.get("/feed", response_model=FeedResponse)
async def get_feed(
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    size: int = Query(default=20, ge=1, le=100, description="페이지 크기")
):
    """
    통합 뉴스 피드 조회
    """
    try:
        return await article_service.get_feed(page=page, size=size)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get feed: {str(e)}")


@router.get("/company/{company_id}", response_model=ArticleListResponse)
async def get_company_articles(
    company_id: int,
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    size: int = Query(default=20, ge=1, le=100, description="페이지 크기")
):
    """특정 회사의 기사 목록 조회"""
    try:
        return await article_service.get_company_articles(
            company_id=company_id,
            page=page,
            size=size
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company articles: {str(e)}")


@router.get("/search", response_model=ArticleListResponse)
async def search_articles(
    q: str = Query(..., min_length=1, max_length=100, description="검색어"),
    page: int = Query(default=1, ge=1, description="페이지 번호"),
    size: int = Query(default=20, ge=1, le=100, description="페이지 크기")
):
    """기사 제목 검색"""
    try:
        return await article_service.search_articles(
            query=q,
            page=page,
            size=size
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search articles: {str(e)}")


@router.get("/trends", response_model=MentionTrendsResponse)
async def get_mention_trends(
    period_days: int = Query(default=30, ge=1, le=90, description="분석 기간 (일)")
):
    """
    회사별 언급량 트렌드 분석 (상위 10개)
    
    - **period_days**: 분석 기간 (기본값: 30일)
    - 직전 동일 기간 대비 증감률 계산
    - 현재 언급량 기준으로 상위 10개 회사 반환
    """
    try:
        return await article_service.get_mention_trends(period_days=period_days)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get mention trends: {str(e)}")


@router.get("/company/{company_id}/stats", response_model=CompanyMentionStats)
async def get_company_mention_stats(
    company_id: int,
    period_days: int = Query(default=30, ge=1, le=90, description="분석 기간 (일)")
):
    """
    특정 회사의 언급량 통계
    
    - **company_id**: 회사 ID
    - **period_days**: 분석 기간 (기본값: 30일)
    - 일별 언급량 데이터 포함
    """
    try:
        stats = await article_service.get_company_mention_stats(
            company_id=company_id,
            period_days=period_days
        )
        
        if not stats:
            raise HTTPException(status_code=404, detail="Company not found or not active")
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get company stats: {str(e)}")


@router.get("/trends/categories", response_model=CategoryTrendsResponse)
async def get_category_trends(
    period_days: int = Query(default=30, ge=1, le=90, description="분석 기간 (일)")
):
    """
    ESG 서비스 카테고리별 언급량 트렌드 분석
    
    - **period_days**: 분석 기간 (기본값: 30일)
    - 카테고리별 총 언급량과 증감률 분석
    - 각 카테고리의 상위 언급량 회사 목록 포함
    """
    try:
        return await article_service.get_category_trends(period_days=period_days)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get category trends: {str(e)}")


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int):
    """특정 기사 상세 조회"""
    try:
        article = await article_service.get_article_by_id(article_id)
        
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
        
        return article
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get article: {str(e)}")


@router.get("/companies/list")
async def get_companies():
    """활성화된 회사 목록 조회"""
    try:
        companies = await article_service.get_companies()
        
        return {
            "companies": [
                {
                    "id": company.id,
                    "company_name": company.company_name,
                    "company_name_en": company.company_name_en,
                    "website_url": company.website_url,
                    "description": company.description,
                    "is_active": company.is_active
                }
                for company in companies
            ],
            "count": len(companies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get companies: {str(e)}")
