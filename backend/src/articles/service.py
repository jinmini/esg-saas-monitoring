from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, and_, or_, text
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from .schemas import (
    ArticleResponse, ArticleListResponse, FeedResponse, ArticleQueryParams,
    MentionTrendsResponse, MentionTrendItem, CompanyMentionStats,
    CategoryTrendsResponse, CategoryTrendItem
)
from ..shared.models import Article, Company, ESGServiceCategory, CompanyServiceMapping
from ..core.database import AsyncSessionLocal


class ArticleService:
    """기사 조회 서비스"""
    
    def _has_exact_word_match(self, text: str, keyword: str) -> bool:
        """정확한 단어 경계 매칭"""
        import re
        if not text or not keyword:
            return False
        
        # 단어 경계를 고려한 정확한 매칭
        pattern = r'\b' + re.escape(keyword.strip()) + r'\b'
        return bool(re.search(pattern, text, re.IGNORECASE))
    
    def _calculate_context_score(self, title: str, summary: str) -> float:
        """비즈니스/ESG 컨텍스트 점수 계산"""
        full_text = f"{title} {summary}".lower()
        
        # 비즈니스 컨텍스트 키워드
        business_keywords = [
            "기업", "회사", "솔루션", "플랫폼", "서비스", "CEO", "대표",
            "스타트업", "기업가", "창업", "투자", "사업", "경영"
        ]
        
        # ESG 컨텍스트 키워드 (2배 가중치)
        esg_keywords = [
            "ESG", "탄소", "환경", "지속가능", "친환경", "녹색", "기후",
            "배출권", "넷제로", "탄소중립", "재생에너지", "LCA"
        ]
        
        business_score = sum(1 for kw in business_keywords if kw in full_text)
        esg_score = sum(2 for kw in esg_keywords if kw in full_text)
        
        # 정규화 (최대 7점)
        max_score = 7.0
        total_score = min(business_score + esg_score, max_score)
        
        return total_score / max_score

    def _has_company_mention(self, article: Article, company_name: str, positive_keywords: List[str] = None) -> bool:
        """개선된 회사 관련성 판단 (정확한 매칭 + 컨텍스트 고려)"""
        if not company_name:
            return True
        
        title = article.title or ''
        summary = article.summary or ''
        full_text = f"{title} {summary}"
        
        # 1. 정확한 회사명 매칭
        if self._has_exact_word_match(full_text, company_name):
            return True
        
        # 2. 정확한 positive keywords 매칭
        if positive_keywords:
            for keyword in positive_keywords:
                if self._has_exact_word_match(full_text, keyword):
                    # 키워드 매칭된 경우, 컨텍스트 점수도 고려
                    context_score = self._calculate_context_score(title, summary)
                    
                    # 컨텍스트 점수가 0.3 이상이면 관련성 있다고 판단
                    if context_score >= 0.3:
                        return True
        
        return False
    
    def _filter_articles_by_company_mention(self, articles: List[Article], company_name: str, positive_keywords: List[str] = None) -> List[Article]:
        """회사명이나 관련 키워드가 포함된 기사만 필터링"""
        if not company_name:
            return articles
        
        filtered_articles = []
        for article in articles:
            if self._has_company_mention(article, company_name, positive_keywords):
                filtered_articles.append(article)
        
        return filtered_articles
    
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
                    image_url=article.image_url,
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
    
    async def get_company_articles(self, company_id: int, page: int = 1, size: int = 20, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> ArticleListResponse:
        """특정 회사의 기사 목록 조회 (회사명 포함 기사만 필터링)"""
        async with AsyncSessionLocal() as session:
            # 회사 정보 및 키워드 조회
            company_result = await session.execute(
                select(Company.id, Company.company_name, Company.company_name_en, Company.positive_keywords)
                .where(Company.id == company_id, Company.is_active == True)
            )
            company_data = company_result.first()
            
            if not company_data:
                return ArticleListResponse(
                    articles=[],
                    total=0,
                    page=page,
                    size=size,
                    has_next=False,
                    has_prev=False
                )
            
            # 해당 회사의 기사 조회 (날짜 필터링 포함)
            query = select(Article).where(Article.company_id == company_id)
            
            # 날짜 필터링 적용
            if date_from:
                query = query.where(Article.published_at >= date_from)
            if date_to:
                query = query.where(Article.published_at <= date_to)
                
            query = query.order_by(desc(Article.published_at))
            result = await session.execute(query)
            all_articles = result.scalars().all()
            
            # 회사명이나 관련 키워드가 포함된 기사만 필터링
            filtered_articles = self._filter_articles_by_company_mention(
                all_articles, 
                company_data.company_name,
                company_data.positive_keywords or []
            )
            
            # 페이징 적용
            total = len(filtered_articles)
            offset = (page - 1) * size
            paginated_articles = filtered_articles[offset:offset + size]
            
            # 응답 데이터 구성
            articles = []
            for article in paginated_articles:
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
                    image_url=article.image_url,
                    company_id=company_data.id,
                    company_name=company_data.company_name,
                    company_name_en=company_data.company_name_en
                )
                articles.append(article_response)
            
            # 페이징 정보 계산
            has_next = offset + size < total
            has_prev = page > 1
            
            return ArticleListResponse(
                articles=articles,
                total=total,
                page=page,
                size=size,
                has_next=has_next,
                has_prev=has_prev
            )
    
    async def get_feed(self, page: int = 1, size: int = 20, date_from: Optional[datetime] = None, date_to: Optional[datetime] = None) -> FeedResponse:
        """통합 뉴스 피드 조회 (최신순, 모든 회사)"""
        async with AsyncSessionLocal() as session:
            # 최신순 기사 조회 (날짜 필터링 포함)
            params = ArticleQueryParams(
                page=page,
                size=size,
                sort="published_at",
                order="desc",
                date_from=date_from,
                date_to=date_to
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
    
    async def get_mention_trends(self, period_days: int = 30) -> MentionTrendsResponse:
        """회사별 언급량 트렌드 분석 (상위 10개)"""
        async with AsyncSessionLocal() as session:
            now = datetime.utcnow()
            
            # 현재 기간 (최근 30일)
            current_end = now
            current_start = current_end - timedelta(days=period_days)
            
            # 이전 기간 (직전 30일)
            previous_end = current_start
            previous_start = previous_end - timedelta(days=period_days)
            
            # 현재 기간 언급량 집계
            current_mentions_query = select(
                Company.id,
                Company.company_name,
                Company.company_name_en,
                func.count(Article.id).label('mention_count')
            ).select_from(
                Company
            ).outerjoin(
                Article,
                and_(
                    Article.company_id == Company.id,
                    Article.published_at >= current_start,
                    Article.published_at < current_end
                )
            ).where(
                Company.is_active == True
            ).group_by(Company.id, Company.company_name, Company.company_name_en)
            
            current_result = await session.execute(current_mentions_query)
            current_mentions = {row.id: row for row in current_result.all()}
            
            # 이전 기간 언급량 집계
            previous_mentions_query = select(
                Company.id,
                func.count(Article.id).label('mention_count')
            ).select_from(
                Company
            ).outerjoin(
                Article,
                and_(
                    Article.company_id == Company.id,
                    Article.published_at >= previous_start,
                    Article.published_at < previous_end
                )
            ).where(
                Company.is_active == True
            ).group_by(Company.id)
            
            previous_result = await session.execute(previous_mentions_query)
            previous_mentions = {row.id: row.mention_count for row in previous_result.all()}
            
            # 최신 기사 정보 조회
            latest_articles_query = select(
                Article.company_id,
                Article.title,
                Article.article_url,
                Article.published_at,
                func.row_number().over(
                    partition_by=Article.company_id,
                    order_by=desc(Article.published_at)
                ).label('rn')
            ).where(
                Article.published_at >= current_start,
                Article.published_at < current_end
            )
            
            latest_articles_subquery = latest_articles_query.subquery()
            latest_articles_final = select(latest_articles_subquery).where(
                latest_articles_subquery.c.rn == 1
            )
            
            latest_result = await session.execute(latest_articles_final)
            latest_articles = {row.company_id: row for row in latest_result.all()}
            
            # 회사별 ESG 서비스 카테고리 정보 조회
            company_categories_query = select(
                CompanyServiceMapping.company_id,
                ESGServiceCategory.category_code,
                ESGServiceCategory.main_topic
            ).join(
                ESGServiceCategory,
                CompanyServiceMapping.category_id == ESGServiceCategory.id
            ).where(
                CompanyServiceMapping.provides_service == True
            )
            
            categories_result = await session.execute(company_categories_query)
            company_categories = {}
            for row in categories_result.all():
                if row.company_id not in company_categories:
                    company_categories[row.company_id] = {
                        'categories': [],
                        'topics': set()
                    }
                company_categories[row.company_id]['categories'].append(row.category_code)
                company_categories[row.company_id]['topics'].add(row.main_topic)
            
            # 트렌드 아이템 생성
            trend_items = []
            for company_id, current_data in current_mentions.items():
                current_count = current_data.mention_count
                previous_count = previous_mentions.get(company_id, 0)
                
                # 증감률 계산
                if previous_count > 0:
                    change_rate = ((current_count - previous_count) / previous_count) * 100
                else:
                    change_rate = 100.0 if current_count > 0 else 0.0
                
                # 변화 유형 결정
                if abs(change_rate) < 5:  # 5% 이하는 안정
                    change_type = "stable"
                elif change_rate > 0:
                    change_type = "up"
                else:
                    change_type = "down"
                
                # 최신 기사 정보
                latest_article = latest_articles.get(company_id)
                
                # ESG 서비스 카테고리 정보
                company_esg_info = company_categories.get(company_id, {'categories': [], 'topics': set()})
                service_categories = company_esg_info['categories']
                primary_categories = list(company_esg_info['topics'])
                
                # 회사 유형 결정
                if len(service_categories) >= 15:
                    company_type = "All-in-One"
                elif len(service_categories) >= 8:
                    company_type = "Specialized"
                elif len(service_categories) >= 3:
                    company_type = "Focused"
                else:
                    company_type = "Niche"
                
                trend_item = MentionTrendItem(
                    rank=0,  # 임시값, 나중에 정렬 후 설정
                    company_id=company_id,
                    company_name=current_data.company_name,
                    company_name_en=current_data.company_name_en,
                    current_mentions=current_count,
                    previous_mentions=previous_count,
                    change_rate=round(change_rate, 2),
                    change_type=change_type,
                    primary_categories=primary_categories,
                    service_categories=service_categories,
                    company_type=company_type,
                    latest_article_title=latest_article.title if latest_article else None,
                    latest_article_url=latest_article.article_url if latest_article else None,
                    latest_published_at=latest_article.published_at if latest_article else None
                )
                trend_items.append(trend_item)
            
            # 현재 언급량 기준으로 정렬 (상위 10개)
            trend_items.sort(key=lambda x: x.current_mentions, reverse=True)
            top_trends = trend_items[:10]
            
            # 순위 설정
            for i, item in enumerate(top_trends):
                item.rank = i + 1
            
            return MentionTrendsResponse(
                trends=top_trends,
                period_days=period_days,
                analysis_date=now,
                total_companies=len(current_mentions)
            )
    
    async def get_company_mention_stats(self, company_id: int, period_days: int = 30) -> Optional[CompanyMentionStats]:
        """특정 회사의 언급량 통계"""
        async with AsyncSessionLocal() as session:
            # 회사 존재 확인
            company_result = await session.execute(
                select(Company).where(Company.id == company_id, Company.is_active == True)
            )
            company = company_result.scalar_one_or_none()
            if not company:
                return None
            
            now = datetime.utcnow()
            
            # 현재 기간 (최근 30일)
            current_end = now
            current_start = current_end - timedelta(days=period_days)
            
            # 이전 기간 (직전 30일)
            previous_end = current_start
            previous_start = previous_end - timedelta(days=period_days)
            
            # 현재 기간 언급량
            current_count_result = await session.execute(
                select(func.count(Article.id)).where(
                    Article.company_id == company_id,
                    Article.published_at >= current_start,
                    Article.published_at < current_end
                )
            )
            current_count = current_count_result.scalar()
            
            # 이전 기간 언급량
            previous_count_result = await session.execute(
                select(func.count(Article.id)).where(
                    Article.company_id == company_id,
                    Article.published_at >= previous_start,
                    Article.published_at < previous_end
                )
            )
            previous_count = previous_count_result.scalar()
            
            # 증감률 계산
            if previous_count > 0:
                change_rate = ((current_count - previous_count) / previous_count) * 100
            else:
                change_rate = 100.0 if current_count > 0 else 0.0
            
            # 변화 유형 결정
            if abs(change_rate) < 5:
                change_type = "stable"
            elif change_rate > 0:
                change_type = "up"
            else:
                change_type = "down"
            
            # 일별 언급량 데이터 (현재 기간)
            daily_mentions_query = select(
                func.date(Article.published_at).label('date'),
                func.count(Article.id).label('count')
            ).where(
                Article.company_id == company_id,
                Article.published_at >= current_start,
                Article.published_at < current_end
            ).group_by(
                func.date(Article.published_at)
            ).order_by(
                func.date(Article.published_at)
            )
            
            daily_result = await session.execute(daily_mentions_query)
            daily_mentions = [
                {"date": str(row.date), "count": row.count}
                for row in daily_result.all()
            ]
            
            return CompanyMentionStats(
                company_id=company_id,
                company_name=company.company_name,
                current_period_mentions=current_count,
                previous_period_mentions=previous_count,
                change_rate=round(change_rate, 2),
                change_type=change_type,
                daily_mentions=daily_mentions,
                period_start=current_start,
                period_end=current_end
            )
    
    async def get_category_trends(self, period_days: int = 30) -> CategoryTrendsResponse:
        """ESG 서비스 카테고리별 언급량 트렌드 분석"""
        async with AsyncSessionLocal() as session:
            now = datetime.utcnow()
            
            # 현재 기간 (최근 30일)
            current_end = now
            current_start = current_end - timedelta(days=period_days)
            
            # 이전 기간 (직전 30일)
            previous_end = current_start
            previous_start = previous_end - timedelta(days=period_days)
            
            # 현재 기간 카테고리별 언급량 집계
            current_category_mentions_query = select(
                ESGServiceCategory.id,
                ESGServiceCategory.category_code,
                ESGServiceCategory.category_name,
                ESGServiceCategory.category_name_en,
                ESGServiceCategory.main_topic,
                func.count(Article.id).label('mention_count'),
                func.count(func.distinct(Company.id)).label('companies_count')
            ).select_from(
                ESGServiceCategory
            ).join(
                CompanyServiceMapping,
                and_(
                    CompanyServiceMapping.category_id == ESGServiceCategory.id,
                    CompanyServiceMapping.provides_service == True
                )
            ).join(
                Company,
                and_(
                    Company.id == CompanyServiceMapping.company_id,
                    Company.is_active == True
                )
            ).outerjoin(
                Article,
                and_(
                    Article.company_id == Company.id,
                    Article.published_at >= current_start,
                    Article.published_at < current_end
                )
            ).group_by(
                ESGServiceCategory.id,
                ESGServiceCategory.category_code,
                ESGServiceCategory.category_name,
                ESGServiceCategory.category_name_en,
                ESGServiceCategory.main_topic
            )
            
            current_result = await session.execute(current_category_mentions_query)
            current_categories = {row.id: row for row in current_result.all()}
            
            # 이전 기간 카테고리별 언급량 집계
            previous_category_mentions_query = select(
                ESGServiceCategory.id,
                func.count(Article.id).label('mention_count')
            ).select_from(
                ESGServiceCategory
            ).join(
                CompanyServiceMapping,
                and_(
                    CompanyServiceMapping.category_id == ESGServiceCategory.id,
                    CompanyServiceMapping.provides_service == True
                )
            ).join(
                Company,
                and_(
                    Company.id == CompanyServiceMapping.company_id,
                    Company.is_active == True
                )
            ).outerjoin(
                Article,
                and_(
                    Article.company_id == Company.id,
                    Article.published_at >= previous_start,
                    Article.published_at < previous_end
                )
            ).group_by(ESGServiceCategory.id)
            
            previous_result = await session.execute(previous_category_mentions_query)
            previous_categories = {row.id: row.mention_count for row in previous_result.all()}
            
            # 각 카테고리별 상위 언급량 회사 조회
            top_companies_query = select(
                CompanyServiceMapping.category_id,
                Company.company_name,
                func.count(Article.id).label('mention_count')
            ).select_from(
                CompanyServiceMapping
            ).join(
                Company,
                and_(
                    Company.id == CompanyServiceMapping.company_id,
                    Company.is_active == True
                )
            ).join(
                Article,
                and_(
                    Article.company_id == Company.id,
                    Article.published_at >= current_start,
                    Article.published_at < current_end
                )
            ).where(
                CompanyServiceMapping.provides_service == True
            ).group_by(
                CompanyServiceMapping.category_id,
                Company.company_name
            ).order_by(
                CompanyServiceMapping.category_id,
                desc(func.count(Article.id))
            )
            
            top_companies_result = await session.execute(top_companies_query)
            category_top_companies = {}
            for row in top_companies_result.all():
                if row.category_id not in category_top_companies:
                    category_top_companies[row.category_id] = []
                if len(category_top_companies[row.category_id]) < 3:  # 상위 3개 회사만
                    category_top_companies[row.category_id].append(row.company_name)
            
            # 카테고리 트렌드 아이템 생성
            trend_items = []
            for category_id, current_data in current_categories.items():
                current_count = current_data.mention_count
                previous_count = previous_categories.get(category_id, 0)
                
                # 증감률 계산
                if previous_count > 0:
                    change_rate = ((current_count - previous_count) / previous_count) * 100
                else:
                    change_rate = 100.0 if current_count > 0 else 0.0
                
                # 변화 유형 결정
                if abs(change_rate) < 5:
                    change_type = "stable"
                elif change_rate > 0:
                    change_type = "up"
                else:
                    change_type = "down"
                
                # 상위 회사 목록
                top_companies = category_top_companies.get(category_id, [])
                
                trend_item = CategoryTrendItem(
                    rank=0,  # 임시값, 나중에 정렬 후 설정
                    category_code=current_data.category_code,
                    category_name=current_data.category_name,
                    category_name_en=current_data.category_name_en,
                    main_topic=current_data.main_topic,
                    current_mentions=current_count,
                    previous_mentions=previous_count,
                    change_rate=round(change_rate, 2),
                    change_type=change_type,
                    companies_count=current_data.companies_count,
                    top_companies=top_companies
                )
                trend_items.append(trend_item)
            
            # 현재 언급량 기준으로 정렬
            trend_items.sort(key=lambda x: x.current_mentions, reverse=True)
            
            # 순위 설정
            for i, item in enumerate(trend_items):
                item.rank = i + 1
            
            return CategoryTrendsResponse(
                trends=trend_items,
                period_days=period_days,
                analysis_date=now,
                total_categories=len(current_categories)
            )
