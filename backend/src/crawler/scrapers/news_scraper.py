import httpx
from typing import List, Dict
from datetime import datetime
from loguru import logger

from .base_scraper import BaseScraper
from ..schemas import NaverNewsResponse, NaverNewsItem
from ...core.config import settings


class NaverNewsScraper(BaseScraper):
    """네이버 뉴스 검색 API 크롤러"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://openapi.naver.com/v1/search/news.json"
    
    async def search_news(self, query: str, display: int = 10, start: int = 1, sort: str = "sim") -> dict:
        """네이버 뉴스 검색 API 호출"""
        headers = {
            "X-Naver-Client-Id": self.client_id,
            "X-Naver-Client-Secret": self.client_secret,
            "User-Agent": "ESG-SaaS-Monitor/1.0"
        }
        
        params = {
            "query": query,
            "display": display,
            "start": start,
            "sort": sort
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    self.base_url,
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 400:
                    raise Exception(f"Bad Request: Invalid parameters")
                elif response.status_code == 401:
                    raise Exception(f"Unauthorized: Invalid API credentials")
                elif response.status_code == 403:
                    raise Exception(f"Forbidden: API access denied")
                elif response.status_code == 429:
                    raise Exception(f"Too Many Requests: API rate limit exceeded")
                elif response.status_code >= 500:
                    raise Exception(f"Server Error: {response.status_code}")
                else:
                    raise Exception(f"Unexpected status code: {response.status_code}")
                    
            except httpx.TimeoutException:
                raise Exception("Request timeout")
            except httpx.RequestError as e:
                raise Exception(f"Request error: {str(e)}")
    
    async def parse_articles(self, response_data: dict, company_id: int, company_name: str = None) -> List[dict]:
        """네이버 API 응답을 Article 모델 형식으로 변환 (2단계 필터링 적용)"""
        try:
            # Pydantic 모델로 검증
            naver_response = NaverNewsResponse(**response_data)
            
            # DB에서 회사 메타데이터 조회
            company_meta = await self._get_company_metadata(company_id) if company_name else {}
            
            articles = []
            title_filtered_count = 0
            relevance_filtered_count = 0
            
            for item in naver_response.items:
                title = self._clean_html_tags(item.title)
                summary = self._clean_html_tags(item.description)
                
                # 🛡️ 2단계 방어: 제목 기반 즉시 필터링 (가장 강력한 필터)
                if company_name:
                    keywords_to_check = [company_name.lower()]
                    if company_meta.get('positive_keywords'):
                        keywords_to_check.extend([kw.lower() for kw in company_meta['positive_keywords']])
                    
                    # 제목에 회사명이나 핵심 키워드가 하나도 없으면 즉시 제외
                    if not any(keyword in title.lower() for keyword in keywords_to_check):
                        title_filtered_count += 1
                        logger.debug(f"Title-filtered: '{title}' - no matching keywords")
                        continue
                
                # 네거티브 키워드 기반 관련성 검증 (기존 로직)
                if company_name and not await self._is_relevant_article(title, summary, company_id, company_name):
                    relevance_filtered_count += 1
                    continue
                
                article_data = {
                    "company_id": company_id,
                    "title": title,
                    "source_name": self._extract_source_name(item.link),
                    "article_url": item.originallink or item.link,
                    "published_at": self._parse_date(item.pubDate),
                    "summary": summary,
                    "language": "ko",
                    "is_verified": False
                }
                articles.append(article_data)
            
            logger.info(f"Parsed {len(articles)} articles for {company_name} (company_id: {company_id})")
            if title_filtered_count > 0:
                logger.info(f"🛡️ Title-filtered out {title_filtered_count} articles for {company_name}")
            if relevance_filtered_count > 0:
                logger.info(f"🛡️ Relevance-filtered out {relevance_filtered_count} articles for {company_name}")
            
            return articles
            
        except Exception as e:
            logger.error(f"Failed to parse articles: {str(e)}")
            return []
    
    async def _get_company_metadata(self, company_id: int) -> dict:
        """DB에서 회사 메타데이터 조회 (positive_keywords, negative_keywords)"""
        try:
            from src.core.database import AsyncSessionLocal
            from src.shared.models import Company
            from sqlalchemy import select
            
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(Company.positive_keywords, Company.negative_keywords)
                    .where(Company.id == company_id)
                )
                row = result.first()
                
                if row:
                    return {
                        'positive_keywords': row.positive_keywords or [],
                        'negative_keywords': row.negative_keywords or []
                    }
                return {}
                
        except Exception as e:
            logger.error(f"Failed to get company metadata for ID {company_id}: {e}")
            return {}
    
    def _extract_source_name(self, link: str) -> str:
        """뉴스 링크에서 언론사명 추출"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(link)
            domain = parsed.netloc
            
            # 네이버 뉴스 도메인 매핑
            source_mapping = {
                "news.naver.com": "네이버뉴스",
                "www.chosun.com": "조선일보",
                "www.donga.com": "동아일보",
                "www.joongang.co.kr": "중앙일보",
                "www.hankyung.com": "한국경제",
                "www.mk.co.kr": "매일경제",
                "www.etnews.com": "전자신문",
                "biz.chosun.com": "조선비즈",
                "www.sedaily.com": "서울경제",
                "www.fnnews.com": "파이낸셜뉴스"
            }
            
            return source_mapping.get(domain, domain)
            
        except Exception:
            return "Unknown"
    
    async def crawl_multiple_companies(self, companies: List[Dict[str, any]], max_articles_per_company: int = 50) -> List[dict]:
        """여러 회사의 뉴스를 순차적으로 크롤링"""
        results = []
        
        for company in companies:
            company_id = company['id']
            company_name = company['company_name']
            
            try:
                result = await self.crawl_company_news(
                    company_id=company_id,
                    company_name=company_name,
                    max_articles=max_articles_per_company
                )
                results.append(result)
                
                logger.info(f"Completed crawling for {company_name}: {result.articles_saved} articles")
                
            except Exception as e:
                logger.error(f"Failed to crawl {company_name}: {str(e)}")
                continue
        
        return results
