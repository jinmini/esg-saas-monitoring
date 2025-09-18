from abc import ABC, abstractmethod
from typing import List, Optional
import httpx
import asyncio
from datetime import datetime
import re
from loguru import logger

from ..schemas import CrawlResult
from ...core.config import settings


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
    async def parse_articles(self, response_data: dict, company_id: int, company_name: str = None) -> List[dict]:
        """뉴스 데이터 파싱 추상 메서드"""
        pass
    
    async def crawl_company_news(self, company_id: int, company_name: str, max_articles: int = 100) -> CrawlResult:
        """특정 회사의 뉴스를 크롤링"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting crawl for company: {company_name} (ID: {company_id})")
            
            # 개선된 검색어 생성 (DB 기반)
            query = await self._build_enhanced_query(company_id, company_name)
            
            # 첫 번째 검색으로 전체 결과 수 확인
            initial_response = await self.search_news(query, display=10, start=1, sort="date")
            total_found = initial_response.get('total', 0)
            
            logger.info(f"Found {total_found} articles for {company_name}")
            
            # 수집할 기사 수 결정
            articles_to_collect = min(total_found, max_articles)
            all_articles = []
            
            # 페이지별로 데이터 수집
            for start in range(1, articles_to_collect + 1, 10):
                display = min(10, articles_to_collect - start + 1)
                
                response = await self.search_news(query, display=display, start=start, sort="date")
                articles = await self.parse_articles(response, company_id, company_name)
                all_articles.extend(articles)
                
                # API 요청 제한 준수를 위한 지연
                if start + 10 <= articles_to_collect:
                    await asyncio.sleep(self.delay)
            
            # 중복 제거 (URL 기준)
            unique_articles = self._remove_duplicates(all_articles)
            
            duration = (datetime.now() - start_time).total_seconds()
            
            return CrawlResult(
                company_id=company_id,
                company_name=company_name,
                query=query,
                total_found=total_found,
                articles_saved=len(unique_articles),
                success=True,
                crawl_duration=duration,
                articles_data=unique_articles  # 실제 기사 데이터 포함
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
                articles_data=[]  # 에러 시 빈 배열
            )
    
    async def _build_enhanced_query(self, company_id: int, company_name: str) -> str:
        """DB에서 가져온 키워드를 기반으로 동적 검색 쿼리 생성"""
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
                    
                    if search_strategy == 'enhanced' and len(positive_keywords) > 1:
                        # 네이버 API 호환: 공백으로 키워드 조합 (첫 번째 키워드를 메인으로)
                        main_keyword = positive_keywords[0]
                        additional_keywords = positive_keywords[1:3]  # 최대 2개 추가 키워드만 사용
                        query = f"{main_keyword} {' '.join(additional_keywords)}"
                        logger.info(f"Using DB-based enhanced query for {company_name}: {query}")
                        return query
                    else:
                        # 첫 번째 키워드만 사용
                        query = positive_keywords[0]
                        logger.info(f"Using DB-based exact match query for {company_name}: {query}")
                        return query
                else:
                    # DB에 키워드가 없으면 기본 검색
                    query = f'"{company_name}"'
                    logger.info(f"Using fallback exact match query for {company_name}: {query}")
                    return query
                    
        except Exception as e:
            logger.error(f"Failed to build query from DB for {company_name}: {e}")
            # 에러 시 기본 검색 사용
            query = f'"{company_name}"'
            logger.info(f"Using fallback exact match query for {company_name}: {query}")
            return query
    
    async def _is_relevant_article(self, title: str, content: str, company_id: int, company_name: str) -> bool:
        """DB 기반 기사 관련성 검증 - 네거티브 필터링"""
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
                    
                    # 전체 텍스트 합성 (소문자 변환)
                    full_text = f"{title} {content}".lower()
                    
                    # 네거티브 키워드 확인
                    for neg_keyword in negative_keywords:
                        if neg_keyword.lower() in full_text:
                            logger.debug(f"Article filtered out for {company_name} due to negative keyword: {neg_keyword}")
                            return False
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to check relevance from DB for {company_name}: {e}")
            # 에러 시 기본적으로 관련성 있다고 판단
            return True
    
    def _remove_duplicates(self, articles: List[dict]) -> List[dict]:
        """URL 기준으로 중복 기사 제거"""
        seen_urls = set()
        unique_articles = []
        
        for article in articles:
            url = article.get('article_url')
            if url and url not in seen_urls:
                seen_urls.add(url)
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
