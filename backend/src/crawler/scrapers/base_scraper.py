from abc import ABC, abstractmethod
from typing import List, Optional, Dict
import httpx
import asyncio
from datetime import datetime
import re
from loguru import logger

from ..schemas import CrawlResult
from ...core.config import settings
from ..constants import (
    TWO_TRACK_ENABLED,
    PRECISION_MIN_RESULTS,
    BROAD_MAX_PAGES,
    DISPLAY_PER_PAGE,
    DEFAULT_SEARCH_STRATEGY,
)


class BaseScraper(ABC):
    """크롤러 베이스 클래스"""
    
    def __init__(self):
        self.client_id = settings.NAVER_CLIENT_ID
        self.client_secret = settings.NAVER_CLIENT_SECRET
        self.delay = settings.CRAWLER_DELAY_SECONDS
        
    @abstractmethod
    async def search_news(self, query: str, display: int = 10, start: int = 1, sort: str = "sim") -> dict:
        """뉴스 검색 추상 메서드"""
        pass
    
    @abstractmethod
    async def parse_articles(
        self,
        response_data: dict,
        company_id: int,
        company_name: str = None,
        source_track: Optional[str] = None,
        query_used: Optional[str] = None,
    ) -> List[dict]:
        """뉴스 데이터 파싱 추상 메서드"""
        pass
    
    async def crawl_company_news(self, company_id: int, company_name: str, max_articles: int = 100) -> CrawlResult:
        """특정 회사의 뉴스를 크롤링 (Two-Track 전략 지원)"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting crawl for company: {company_name} (ID: {company_id})")

            # Two-Track 쿼리 구성 시도
            use_two_track = False
            queries: Dict[str, List[str]] = {"precision": [], "broad": []}
            try:
                if TWO_TRACK_ENABLED:
                    queries = await self._build_two_track_queries(company_id, company_name)
                    use_two_track = bool(queries.get("precision") or queries.get("broad"))
            except Exception as e:
                logger.warning(f"Two-Track query build failed, fallback to single query: {e}")
                use_two_track = False
            
            all_articles: List[dict] = []
            total_found = 0

            if use_two_track:
                logger.info(f"Using Two-Track crawling for {company_name}")
                # 1) 정밀 트랙: 대표명/탑키워드 조합으로 충분량 확보 시 광역 생략
                precision_collected = 0
                for q in queries.get("precision", []):
                    # 첫 요청으로 total 파악
                    initial = await self.search_news(q, display=DISPLAY_PER_PAGE, start=1, sort="date")
                    q_total = max(0, int(initial.get("total", 0)))
                    total_found += q_total

                    max_pages = max(1, (q_total + DISPLAY_PER_PAGE - 1) // DISPLAY_PER_PAGE)
                    page = 1
                    while page <= max_pages and len(all_articles) < max_articles and precision_collected < PRECISION_MIN_RESULTS:
                        start = 1 + (page - 1) * DISPLAY_PER_PAGE
                        resp = await self.search_news(q, display=DISPLAY_PER_PAGE, start=start, sort="date")
                        articles = await self.parse_articles(resp, company_id, company_name, source_track="precision", query_used=q)
                        all_articles.extend(articles)
                        precision_collected += len(articles)
                        page += 1
                        if page <= max_pages:
                            await asyncio.sleep(self.delay)

                    if precision_collected >= PRECISION_MIN_RESULTS:
                        logger.info(f"Precision track collected {precision_collected} (>= {PRECISION_MIN_RESULTS}), skipping broad track for now")
                        break

                # 2) 광역 트랙: 필요 시 최대 N페이지 보강
                if precision_collected < PRECISION_MIN_RESULTS:
                    for q in queries.get("broad", []):
                        for page in range(1, BROAD_MAX_PAGES + 1):
                            if len(all_articles) >= max_articles:
                                break
                            start = 1 + (page - 1) * DISPLAY_PER_PAGE
                            resp = await self.search_news(q, display=DISPLAY_PER_PAGE, start=start, sort="date")
                            articles = await self.parse_articles(resp, company_id, company_name, source_track="broad", query_used=q)
                            all_articles.extend(articles)
                            if page < BROAD_MAX_PAGES:
                                await asyncio.sleep(self.delay)
            else:
                # 단일 쿼리 전략 (기존 로직)
                query = await self._build_enhanced_query(company_id, company_name)
                initial_response = await self.search_news(query, display=10, start=1, sort="date")
                total_found = initial_response.get('total', 0)
                logger.info(f"Found {total_found} articles for {company_name}")
                articles_to_collect = min(total_found, max_articles)
                for start in range(1, articles_to_collect + 1, 10):
                    display = min(10, articles_to_collect - start + 1)
                    response = await self.search_news(query, display=display, start=start, sort="date")
                    articles = await self.parse_articles(response, company_id, company_name, source_track="single", query_used=query)
                    all_articles.extend(articles)
                    if start + 10 <= articles_to_collect:
                        await asyncio.sleep(self.delay)
            
            # 중복 제거 (URL 정규화 + 보조 키 기준)
            unique_articles = self._dedupe_articles(all_articles)
            duration = (datetime.now() - start_time).total_seconds()
            
            return CrawlResult(
                company_id=company_id,
                company_name=company_name,
                query="two_track" if use_two_track else (query if 'query' in locals() else company_name),
                total_found=total_found,
                articles_saved=len(unique_articles),
                success=True,
                crawl_duration=duration,
                articles_data=unique_articles
            )
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(f"Crawl failed for {company_name}: {str(e)}")
            
            return CrawlResult(
                company_id=company_id,
                company_name=company_name,
                query=company_name,
                total_found=0,
                articles_saved=0,
                success=False,
                error_message=str(e),
                crawl_duration=duration,
                articles_data=[]
            )
    
    async def _build_enhanced_query(self, company_id: int, company_name: str) -> str:
        """DB에서 가져온 키워드를 기반으로 정확도 최적화된 검색 쿼리 생성"""
        try:
            from src.core.database import AsyncSessionLocal
            from src.shared.models import Company
            from sqlalchemy import select
            
            async with AsyncSessionLocal() as session:
                # DB에서 회사의 검색 키워드 조회
                result = await session.execute(
                    select(Company.positive_keywords, Company.search_strategy)
                    .where(Company.id == company_id)
                )
                row = result.first()
                
                if row and row.positive_keywords:
                    positive_keywords = row.positive_keywords
                    search_strategy = row.search_strategy or 'enhanced'
                    
                    if search_strategy == 'enhanced' and len(positive_keywords) > 0:
                        # 🎯 핵심 전략: 반드시 포함할 키워드들을 따옴표로 감싸기
                        main_keywords = [f'"{kw}"' for kw in [company_name] + positive_keywords[:2]]
                        
                        # 가장 정확한 키워드를 메인으로 사용 (보통 회사명이 가장 정확)
                        primary_keyword = f'"{company_name}"'
                        
                        # 추가 키워드가 있으면 OR 조건으로 결합하되, 네이버 API 한계로 공백 사용
                        if len(positive_keywords) > 0:
                            # 첫 번째 positive_keyword를 추가 (정확도 향상)
                            secondary_keyword = f'"{positive_keywords[0]}"'
                            query = f"{primary_keyword} {secondary_keyword}"
                        else:
                            query = primary_keyword
                        
                        logger.info(f"Using precision-optimized query for {company_name}: {query}")
                        return query
                    else:
                        # 단일 키워드 전략 - 가장 정확한 매칭
                        if positive_keywords:
                            query = f'"{positive_keywords[0]}"'
                        else:
                            query = f'"{company_name}"'
                        logger.info(f"Using exact match query for {company_name}: {query}")
                        return query
                else:
                    # DB에 키워드가 없으면 회사명 정확 매칭
                    query = f'"{company_name}"'
                    logger.info(f"Using fallback exact match query for {company_name}: {query}")
                    return query
                    
        except Exception as e:
            logger.error(f"Failed to build query from DB for {company_name}: {e}")
            # 에러 시 가장 안전한 정확 매칭 사용
            query = f'"{company_name}"'
            logger.info(f"Using fallback exact match query for {company_name}: {query}")
            return query

    async def _build_two_track_queries(self, company_id: int, company_name: str) -> Dict[str, List[str]]:
        """DB 메타(ceo_name, positive_keywords, search_strategy)로 Two-Track 쿼리 구성"""
        from src.core.database import AsyncSessionLocal
        from src.shared.models import Company
        from sqlalchemy import select

        precision: List[str] = []
        broad: List[str] = []

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(
                    Company.ceo_name,
                    Company.positive_keywords,
                    Company.search_strategy,
                ).where(Company.id == company_id)
            )
            row = result.first()

        ceo_name = None
        positive_keywords: List[str] = []
        search_strategy = DEFAULT_SEARCH_STRATEGY
        if row:
            ceo_name = row.ceo_name
            positive_keywords = row.positive_keywords or []
            search_strategy = (row.search_strategy or DEFAULT_SEARCH_STRATEGY).lower()

        # 전략에 따라 구성
        if search_strategy in ("two_track", "precision_first", "enhanced"):
            # 정밀 쿼리들
            if company_name and ceo_name:
                precision.append(f'"{company_name}" "{ceo_name}"')
            if company_name and positive_keywords:
                precision.append(f'"{company_name}" "{positive_keywords[0]}"')
            # 광역 쿼리
            if company_name:
                broad.append(f'"{company_name}"')
        elif search_strategy == "precision_only":
            if company_name and ceo_name:
                precision.append(f'"{company_name}" "{ceo_name}"')
            if company_name and positive_keywords:
                precision.append(f'"{company_name}" "{positive_keywords[0]}"')
        elif search_strategy == "broad_only":
            if company_name:
                broad.append(f'"{company_name}"')
        else:
            # 알 수 없는 전략은 안전하게 two_track로 처리
            if company_name and ceo_name:
                precision.append(f'"{company_name}" "{ceo_name}"')
            if company_name and positive_keywords:
                precision.append(f'"{company_name}" "{positive_keywords[0]}"')
            if company_name:
                broad.append(f'"{company_name}"')

        # 중복 제거 및 공백 제거
        def _dedupe(seq: List[str]) -> List[str]:
            seen = set()
            out = []
            for s in seq:
                s2 = (s or "").strip()
                if s2 and s2 not in seen:
                    seen.add(s2)
                    out.append(s2)
            return out

        queries = {
            "precision": _dedupe(precision),
            "broad": _dedupe(broad),
        }
        return queries
    
    def _has_exact_word_match(self, text: str, keyword: str) -> bool:
        """정확한 단어 경계 매칭"""
        import re
        if not text or not keyword:
            return False
        
        # 단어 경계를 고려한 정확한 매칭
        pattern = r'\b' + re.escape(keyword.strip()) + r'\b'
        return bool(re.search(pattern, text, re.IGNORECASE))

    async def _is_relevant_article(self, title: str, content: str, company_id: int, company_name: str) -> bool:
        """개선된 기사 관련성 검증 - 정확한 네거티브 필터링"""
        try:
            from src.core.database import AsyncSessionLocal
            from src.shared.models import Company
            from sqlalchemy import select
            
            async with AsyncSessionLocal() as session:
                # DB에서 회사의 네거티브 키워드 조회
                result = await session.execute(
                    select(Company.negative_keywords)
                    .where(Company.id == company_id)
                )
                row = result.first()
                
                if row and row.negative_keywords:
                    negative_keywords = row.negative_keywords
                    
                    # 전체 텍스트 합성
                    full_text = f"{title} {content}"
                    
                    # 정확한 네거티브 키워드 매칭
                    for neg_keyword in negative_keywords:
                        if self._has_exact_word_match(full_text, neg_keyword):
                            logger.debug(f"Article filtered out for {company_name} due to exact negative keyword match: {neg_keyword}")
                            return False
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to check relevance from DB for {company_name}: {e}")
            # 에러 시 기본적으로 관련성 있다고 판단
            return True
    
    def _normalize_url(self, url: Optional[str]) -> Optional[str]:
        """URL 정규화: 스킴/호스트 소문자, 추적 파라미터 제거, 쿼리 정렬"""
        if not url:
            return None
        try:
            from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
            parsed = urlparse(url)
            scheme = (parsed.scheme or 'http').lower()
            netloc = (parsed.netloc or '').lower()
            path = parsed.path or ''
            # 쿼리 정리: UTM 등 추적 파라미터 제거
            query_pairs = [(k, v) for (k, v) in parse_qsl(parsed.query, keep_blank_values=False)
                           if not k.lower().startswith('utm_') and k.lower() not in {'gclid', 'fbclid'}]
            query = urlencode(sorted(query_pairs))
            fragment = ''
            return urlunparse((scheme, netloc, path, '', query, fragment))
        except Exception:
            return url

    def _dedupe_articles(self, articles: List[dict]) -> List[dict]:
        """URL 정규화 기반 중복 제거, URL 없으면 (title, source) 키로 보조 제거"""
        seen: set = set()
        unique_articles: List[dict] = []
        for article in articles:
            url = self._normalize_url(article.get('article_url'))
            if url:
                key = ("url", url)
            else:
                title = (article.get('title') or '').strip().lower()
                source = (article.get('source_name') or '').strip().lower()
                key = ("ts", title, source)
            if key in seen:
                continue
            seen.add(key)
            unique_articles.append(article)
        return unique_articles
    
    def _clean_html_tags(self, text: str) -> str:
        """HTML 태그 제거"""
        if not text:
            return ""
        
        # HTML 태그 제거
        clean_text = re.sub(r'<[^>]+>', '', text)
        
        # HTML 엔티티 디코딩
        clean_text = clean_text.replace('&lt;', '<')
        clean_text = clean_text.replace('&gt;', '>')
        clean_text = clean_text.replace('&amp;', '&')
        clean_text = clean_text.replace('&quot;', '"')
        clean_text = clean_text.replace('&#39;', "'")
        
        return clean_text.strip()
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """네이버 API 날짜 형식을 datetime으로 변환"""
        try:
            # 네이버 API 날짜 형식: "Mon, 15 Sep 2025 10:30:00 +0900"
            from dateutil.parser import parse
            return parse(date_str)
        except Exception as e:
            logger.warning(f"Failed to parse date: {date_str}, error: {e}")
            return None
