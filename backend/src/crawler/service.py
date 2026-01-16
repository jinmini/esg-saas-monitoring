from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from loguru import logger
import re

from .scrapers.news_scraper import NaverNewsScraper
from .schemas import CrawlResult, ArticleCreateRequest
from ..shared.models import Company, Article
from ..core.database import AsyncSessionLocal
from .constants import PRECISION_SCORE_BOOST


class CrawlerService:
    """크롤러 서비스 클래스"""
    
    def __init__(self):
        self.scraper = NaverNewsScraper()
    
    async def get_active_companies(self) -> List[Dict]:
        """활성화된 회사 목록 조회"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Company).where(Company.is_active == True)
            )
            companies = result.scalars().all()
            
            return [
                {
                    "id": company.id,
                    "company_name": company.company_name,
                    "company_name_en": company.company_name_en
                }
                for company in companies
            ]
    
    async def crawl_all_companies(self, max_articles_per_company: int = 50) -> List[CrawlResult]:
        """모든 활성화된 회사의 뉴스 크롤링"""
        logger.info("Starting news crawling for all active companies")
        
        # 활성화된 회사 목록 조회
        companies = await self.get_active_companies()
        logger.info(f"Found {len(companies)} active companies")
        
        if not companies:
            logger.warning("No active companies found")
            return []
        
        # 각 회사별 뉴스 크롤링
        crawl_results = []
        for company in companies:
            try:
                result = await self.scraper.crawl_company_news(
                    company_id=company['id'],
                    company_name=company['company_name'],
                    max_articles=max_articles_per_company
                )
                
                # 크롤링된 기사들을 데이터베이스에 저장
                if result.success and result.articles_data:
                    saved_count = await self.save_articles(result.articles_data)
                    result.articles_saved = saved_count
                    logger.info(f"Saved {saved_count} articles for {company['company_name']}")
                elif result.success:
                    logger.warning(f"No articles data returned for {company['company_name']}")
                else:
                    logger.error(f"Crawl failed for {company['company_name']}: {result.error_message}")
                
                crawl_results.append(result)
                
            except Exception as e:
                logger.error(f"Failed to crawl {company['company_name']}: {str(e)}")
                continue
        
        total_articles = sum(result.articles_saved for result in crawl_results if result.success)
        logger.info(f"Crawling completed. Total articles saved: {total_articles}")
        
        return crawl_results
    
    async def crawl_single_company(self, company_id: int, max_articles: int = 50) -> CrawlResult:
        """특정 회사의 뉴스 크롤링"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Company).where(Company.id == company_id, Company.is_active == True)
            )
            company = result.scalar_one_or_none()
            
            if not company:
                raise ValueError(f"Active company not found with ID: {company_id}")
            
            crawl_result = await self.scraper.crawl_company_news(
                company_id=company.id,
                company_name=company.company_name,
                max_articles=max_articles
            )
            
            if crawl_result.success and crawl_result.articles_data:
                saved_count = await self.save_articles(crawl_result.articles_data)
                crawl_result.articles_saved = saved_count
            
            return crawl_result
    
    async def save_articles(self, articles_data: List[Dict]) -> int:
        """기사 데이터를 데이터베이스에 저장 (3단계 Quality Gate 적용)"""
        if not articles_data:
            return 0
        
        # ✅ [Refactor] 세션을 한 번만 열고 루프 내에서 재사용
        async with AsyncSessionLocal() as session:
            saved_count = 0
            quality_filtered_count = 0
            
            for article_data in articles_data:
                try:
                    # 중복 기사 확인 (URL 기준)
                    existing = await session.execute(
                        select(Article).where(Article.article_url == article_data['article_url'])
                    )
                    
                    if existing.scalar_one_or_none():
                        logger.debug(f"Article already exists: {article_data['article_url']}")
                        continue
                    
                    # 🛡️ 3단계 방어: Quality Gate - 관련도 점수 계산
                    # ✅ [Refactor] 세션 객체 전달 (DB 연결 오버헤드 제거)
                    relevance_score = await self._calculate_relevance_score(session, article_data)
                    
                    min_quality_score = 0.6
                    if relevance_score < min_quality_score:
                        quality_filtered_count += 1
                        logger.debug(f"Quality Gate blocked: '{article_data.get('title')}' (score: {relevance_score:.2f})")
                        continue
                    
                    # 새 기사 생성
                    # 내부 메타데이터('_'로 시작) 제거
                    sanitized = {k: v for k, v in article_data.items() if not str(k).startswith('_')}
                    
                    # ✅ [Update] image_url 포함하여 객체 생성
                    article = Article(
                        company_id=sanitized.get('company_id'),
                        title=sanitized.get('title'),
                        source_name=sanitized.get('source_name'),
                        article_url=sanitized.get('article_url'),
                        published_at=sanitized.get('published_at'),
                        content=sanitized.get('content'),
                        summary=sanitized.get('summary'),
                        image_url=sanitized.get('image_url'),  # 이미지 URL 저장
                        # 필요한 경우 추가 필드 매핑
                    )
                    
                    session.add(article)
                    saved_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to save article: {str(e)}")
                    continue
            
            try:
                await session.commit()
                if saved_count > 0:
                    logger.info(f"Saved {saved_count} new articles to database")
                if quality_filtered_count > 0:
                    logger.info(f"🛡️ Quality Gate blocked {quality_filtered_count} low-quality articles")
                return saved_count
                
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to commit articles: {str(e)}")
                return 0
    
    def _has_exact_word_match(self, text: str, keyword: str) -> bool:
        """정확한 단어 경계 매칭"""
        if not text or not keyword:
            return False
        
        # 특수문자 이스케이프 처리
        pattern = r'\b' + re.escape(keyword.strip()) + r'\b'
        return bool(re.search(pattern, text, re.IGNORECASE))
    
    def _calculate_context_score(self, title: str, summary: str) -> float:
        """비즈니스/ESG 컨텍스트 점수 계산 (0.0 ~ 1.0)"""
        full_text = f"{title} {summary}".lower()
        
        business_keywords = [
            "기업", "회사", "솔루션", "플랫폼", "서비스", "CEO", "대표",
            "스타트업", "기업가", "창업", "투자", "사업", "경영"
        ]
        
        esg_keywords = [
            "ESG", "탄소", "환경", "지속가능", "친환경", "녹색", "기후",
            "배출권", "넷제로", "탄소중립", "재생에너지", "LCA"
        ]
        
        business_score = sum(1 for kw in business_keywords if kw in full_text)
        esg_score = sum(2 for kw in esg_keywords if kw in full_text)
        
        max_possible_score = 7.0
        total_score = min(business_score + esg_score, max_possible_score)
        
        return total_score / max_possible_score

    async def _calculate_relevance_score(self, session: AsyncSession, article_data: Dict) -> float:
        """개선된 관련도 점수 계산 (세션 재사용 버전)"""
        try:
            company_id = article_data.get('company_id')
            title = article_data.get('title', '')
            summary = article_data.get('summary', '')
            
            if not company_id:
                return 0.0
            
            # ✅ [Refactor] 전달받은 session 사용 (새 연결 안 만듦)
            result = await session.execute(
                select(Company.company_name, Company.company_name_en, Company.positive_keywords, Company.negative_keywords)
                .where(Company.id == company_id)
            )
            row = result.first()
            
            if not row:
                return 0.0
            
            company_name = row.company_name
            company_name_en = row.company_name_en or ''
            positive_keywords = row.positive_keywords or []
            negative_keywords = row.negative_keywords or []
            
            full_text = f"{title} {summary}"
            score = 0.0
            
            # 1. 회사명 정확 매칭
            title_has_company = self._has_exact_word_match(title, company_name)
            summary_has_company = self._has_exact_word_match(summary, company_name)
            if title_has_company:
                score += 0.35
            elif summary_has_company:
                score += 0.20
            else:
                score -= 0.10
            
            # 2. 영어 회사명 정확 매칭
            if company_name_en and self._has_exact_word_match(full_text, company_name_en):
                score += 0.25
            
            # 3. Positive keywords 정확 매칭
            if positive_keywords:
                positive_matches = sum(1 for kw in positive_keywords 
                                     if self._has_exact_word_match(full_text, kw))
                positive_ratio = min(positive_matches / len(positive_keywords), 1.0)
                score += 0.2 * positive_ratio
            
            # 4. 컨텍스트 점수
            context_score = self._calculate_context_score(title, summary)
            score += 0.2 * context_score
            
            # 5. Negative keywords 패널티
            for neg_kw in negative_keywords:
                if self._has_exact_word_match(full_text, neg_kw):
                    score -= 0.6
                    break
            
            # 6. 정밀 트랙 가산점
            try:
                if article_data.get('_source_track') == 'precision':
                    score += PRECISION_SCORE_BOOST
            except Exception:
                pass

            final_score = max(0.0, min(1.0, score))
            return final_score
                
        except Exception as e:
            logger.error(f"Failed to calculate enhanced relevance score: {e}")
            return 0.5  # 에러 시 기본값
    
    async def get_crawl_statistics(self) -> Dict:
        """크롤링 통계 정보 조회"""
        async with AsyncSessionLocal() as session:
            total_articles = await session.execute(select(func.count(Article.id)))
            total_count = total_articles.scalar()
            
            companies_with_articles = await session.execute(
                select(Company.company_name, func.count(Article.id).label('article_count'))
                .join(Article)
                .group_by(Company.id, Company.company_name)
            )
            
            company_stats = {name: count for name, count in companies_with_articles}
            
            return {
                "total_articles": total_count,
                "companies_count": len(company_stats),
                "company_statistics": company_stats
            }