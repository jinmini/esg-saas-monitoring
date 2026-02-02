import httpx
from bs4 import BeautifulSoup
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from loguru import logger

# BaseScraper가 같은 폴더에 있다고 가정, 경로는 프로젝트 구조에 맞게
from .base_scraper import BaseScraper
from ..schemas import NaverNewsResponse
from ...core.config import settings

# 타입 힌팅용 (필요시)
from sqlalchemy.ext.asyncio import AsyncSession


class NaverNewsScraper(BaseScraper):
    """네이버 뉴스 검색 API 크롤러 + OG 이미지 추출기"""
    
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
        params = { "query": query, "display": display, "start": start, "sort": sort }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(self.base_url, headers=headers, params=params)
                if response.status_code == 200: return response.json()
                elif response.status_code == 400: raise Exception(f"Bad Request")
                elif response.status_code == 401: raise Exception(f"Unauthorized")
                elif response.status_code == 403: raise Exception(f"Forbidden")
                elif response.status_code == 429: raise Exception(f"Too Many Requests")
                elif response.status_code >= 500: raise Exception(f"Server Error: {response.status_code}")
                else: raise Exception(f"Unexpected status code: {response.status_code}")
            except Exception as e:
                raise Exception(f"Request error: {str(e)}")

    async def _fetch_og_image(self, client: httpx.AsyncClient, url: str) -> Optional[str]:
        """기사 페이지에 접속하여 OG:IMAGE 태그 추출"""
        if not url: return None
        
        try:
            # 타임아웃 5초 설정 (이미지 때문에 전체가 느려지는 것 방지)
            response = await client.get(
                url, 
                follow_redirects=True, 
                timeout=5.0,
                headers={"User-Agent": "Mozilla/5.0 (compatible; ESG-Monitor/1.0)"}
            )
            
            if response.status_code != 200:
                return None
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 1. og:image 우선 확인
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                return og_image["content"]
                
            # 2. twitter:image 차선 확인
            twitter_image = soup.find("meta", name="twitter:image")
            if twitter_image and twitter_image.get("content"):
                return twitter_image["content"]
                
            return None
            
        except Exception:
            # 이미지 추출 실패는 조용히 넘어감
            return None

    async def parse_articles(self, response_data: dict, company_id: int, company_name: str = None, source_track: str = None, query_used: str = None) -> List[dict]:
        """네이버 API 응답을 Article 모델 형식으로 변환 + 이미지 추출 병렬 처리"""
        try:
            naver_response = NaverNewsResponse(**response_data)
            parsed_items = []

            # 비동기 HTTP 클라이언트 생성 (이미지 추출용)
            async with httpx.AsyncClient() as client:
                tasks = []
                
                for item in naver_response.items:
                    title = self._clean_html_tags(item.title)
                    summary = self._clean_html_tags(item.description)
                    article_url = item.originallink or item.link
                    
                    # 기본 기사 데이터 구성
                    article_data = {
                        "company_id": company_id,
                        "title": title,
                        "source_name": self._extract_source_name(item.link),
                        "article_url": article_url,
                        "published_at": self._parse_date(item.pubDate),
                        "summary": summary,
                        "language": "ko",
                        "is_verified": False,
                        "_source_track": source_track,
                        "_query_used": query_used,
                        "image_url": None  # 초기값
                    }
                    
                    parsed_items.append(article_data)
                    
                    # 이미지 추출 작업 예약
                    tasks.append(self._fetch_og_image(client, article_url))
                
                # 병렬 실행: 모든 기사의 이미지를 동시에 긁어옴
                if tasks:
                    logger.info(f"Fetching images for {len(tasks)} articles...")
                    image_urls = await asyncio.gather(*tasks, return_exceptions=True)
                    
                    # 결과 매핑
                    for idx, result in enumerate(image_urls):
                        if isinstance(result, str): # 성공한 URL만 저장
                            parsed_items[idx]['image_url'] = result
            
            logger.info(f"Parsed {len(parsed_items)} articles for {company_name}")
            return parsed_items
            
        except Exception as e:
            logger.error(f"Failed to parse articles: {str(e)}")
            return []

    # ✅ [수정] 인자에서 session 제거 (내부에서 생성해서 사용)
    async def _get_company_metadata(self, company_id: int) -> dict:
        """DB에서 회사 메타데이터 조회"""
        try:
            # 순환 참조 방지를 위해 함수 내부 import
            from src.core.database import AsyncSessionLocal
            from src.companies.models import Company
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

    def _clean_html_tags(self, text: str) -> str:
        import re
        if not text: return ""
        return re.sub(r'<[^>]+>', '', text).replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')

    def _parse_date(self, date_str: str) -> Optional[datetime]:
        try:
            return datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S +0900')
        except:
            return datetime.now()
            
    def _extract_source_name(self, link: str) -> str:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(link)
            domain = parsed.netloc
            
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
                "www.fnnews.com": "파이낸셜뉴스",
                "www.impacton.net": "임팩트온"
            }
            return source_mapping.get(domain, domain)
        except Exception:
            return "Unknown"
    
