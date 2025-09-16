from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, and_, or_
from sqlalchemy.orm import selectinload
from datetime import datetime

from .schemas import ArticleResponse, ArticleListResponse, FeedResponse, ArticleQueryParams
from ..shared.models import Article, Company
from ..core.database import AsyncSessionLocal


class ArticleService:
    """기사 조회 서비스"""
    
    async def get_articles(self, params: ArticleQueryParams) -> ArticleListResponse:
        """기사 목록 조회 (페이징, 필터링, 정렬)"""
        async with AsyncSessionLocal() as session:
            # 기본 쿼리 구성
            query = select(Article, Company).join(Company).where(Company.is_active == True)
            
            # 필터링 적용
            if params.company_id:
                query = query.where(Article.company_id == params.company_id)
            
            if params.search:
                search_term = f"%{params.search}%"
                query = query.where(Article.title.ilike(search_term))
            
            if params.date_from:
                query = query.where(Article.published_at >= params.date_from)
            
            if params.date_to:
                query = query.where(Article.published_at <= params.date_to)
            
            # 정렬 적용
            order_func = desc if params.order == "desc" else asc
            if params.sort == "published_at":
                query = query.order_by(order_func(Article.published_at))
            elif params.sort == "crawled_at":
                query = query.order_by(order_func(Article.crawled_at))
            elif params.sort == "title":
                query = query.order_by(order_func(Article.title))
            else:
                query = query.order_by(desc(Article.published_at))  # 기본값
            
            # 전체 개수 조회
            count_query = select(func.count()).select_from(
                query.subquery()
            )
            total_result = await session.execute(count_query)
            total = total_result.scalar()
            
            # 페이징 적용
            offset = (params.page - 1) * params.size
            query = query.offset(offset).limit(params.size)
            
            # 데이터 조회
            result = await session.execute(query)
            rows = result.all()
            
            # 응답 데이터 구성
            articles = []
            for article, company in rows:
                article_response = ArticleResponse(
                    id=article.id,
                    title=article.title,
                    source_name=article.source_name,
                    article_url=article.article_url,
                    published_at=article.published_at,
                    crawled_at=article.crawled_at,
                    summary=article.summary,
                    language=article.language,
                    is_verified=article.is_verified,
                    company_id=company.id,
                    company_name=company.company_name,
                    company_name_en=company.company_name_en
                )
                articles.append(article_response)
            
            # 페이징 정보 계산
            has_next = offset + params.size < total
            has_prev = params.page > 1
            
            return ArticleListResponse(
                articles=articles,
                total=total,
                page=params.page,
                size=params.size,
                has_next=has_next,
                has_prev=has_prev
            )
    
    async def get_company_articles(self, company_id: int, page: int = 1, size: int = 20) -> ArticleListResponse:
        """특정 회사의 기사 목록 조회"""
        params = ArticleQueryParams(
            page=page,
            size=size,
            company_id=company_id,
            sort="published_at",
            order="desc"
        )
        return await self.get_articles(params)
    
    async def get_feed(self, page: int = 1, size: int = 20) -> FeedResponse:
        """통합 뉴스 피드 조회 (최신순, 모든 회사)"""
        async with AsyncSessionLocal() as session:
            # 최신순 기사 조회
            params = ArticleQueryParams(
                page=page,
                size=size,
                sort="published_at",
                order="desc"
            )
            
            articles_response = await self.get_articles(params)
            
            # 추가 통계 정보
            # 활성 회사 수
            companies_count_result = await session.execute(
                select(func.count(Company.id)).where(Company.is_active == True)
            )
            companies_count = companies_count_result.scalar()
            
            # 최근 크롤링 시간
            latest_crawl_result = await session.execute(
                select(func.max(Article.crawled_at))
            )
            latest_crawl = latest_crawl_result.scalar()
            
            return FeedResponse(
                articles=articles_response.articles,
                total=articles_response.total,
                page=page,
                size=size,
                has_next=articles_response.has_next,
                companies_count=companies_count,
                latest_crawl=latest_crawl
            )
    
    async def get_article_by_id(self, article_id: int) -> Optional[ArticleResponse]:
        """특정 기사 상세 조회"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Article, Company)
                .join(Company)
                .where(Article.id == article_id)
            )
            row = result.first()
            
            if not row:
                return None
            
            article, company = row
            return ArticleResponse(
                id=article.id,
                title=article.title,
                source_name=article.source_name,
                article_url=article.article_url,
                published_at=article.published_at,
                crawled_at=article.crawled_at,
                summary=article.summary,
                language=article.language,
                is_verified=article.is_verified,
                company_id=company.id,
                company_name=company.company_name,
                company_name_en=company.company_name_en
            )
    
    async def get_companies(self) -> List[Company]:
        """활성화된 회사 목록 조회"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Company).where(Company.is_active == True).order_by(Company.company_name)
            )
            return result.scalars().all()
    
    async def search_articles(self, query: str, page: int = 1, size: int = 20) -> ArticleListResponse:
        """기사 제목 검색"""
        params = ArticleQueryParams(
            page=page,
            size=size,
            search=query,
            sort="published_at",
            order="desc"
        )
        return await self.get_articles(params)
