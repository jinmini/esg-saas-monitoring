from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from datetime import datetime

from .service import ArticleService
from .schemas import (
    ArticleListResponse, 
    FeedResponse, 
    ArticleResponse, 
    CompanyResponse,
    ArticleQueryParams
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
    
    모든 활성화된 회사의 최신 뉴스를 시간순으로 제공합니다.
    PRD Epic 2의 핵심 기능입니다.
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
