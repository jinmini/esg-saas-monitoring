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
    async def parse_articles(self, response_data: dict, company_id: int) -> List[dict]:
        """뉴스 데이터 파싱 추상 메서드"""
        pass
    
    async def crawl_company_news(self, company_id: int, company_name: str, max_articles: int = 100) -> CrawlResult:
        """특정 회사의 뉴스를 크롤링"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting crawl for company: {company_name} (ID: {company_id})")
            
            # 검색어 생성 (회사명으로 검색)
            query = company_name
            
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
                articles = await self.parse_articles(response, company_id)
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
                crawl_duration=duration
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
                crawl_duration=duration
            )
    
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
