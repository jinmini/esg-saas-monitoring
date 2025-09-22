from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from .scrapers.news_scraper import NaverNewsScraper
from .schemas import CrawlResult, ArticleCreateRequest
from ..shared.models import Company, Article
from ..core.database import AsyncSessionLocal


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
                
                # 크롤링된 기사들을 데이터베이스에 저장 (중복 API 호출 제거)
                if result.success and result.articles_data:
                    saved_count = await self.save_articles(result.articles_data)
                    result.articles_saved = saved_count
                    logger.info(f"Saved {saved_count} articles for {company['company_name']}")
                elif result.success:
                    logger.warning(f"No articles data returned for {company['company_name']}")
                else:
                    logger.error(f"Crawl failed for {company['company_name']}: {result.error_message}")
                
                crawl_results.append(result)
                logger.info(f"Crawled {company['company_name']}: {result.articles_saved} articles")
                
            except Exception as e:
                logger.error(f"Failed to crawl {company['company_name']}: {str(e)}")
                continue
        
        total_articles = sum(result.articles_saved for result in crawl_results if result.success)
        logger.info(f"Crawling completed. Total articles saved: {total_articles}")
        
        return crawl_results
    
    async def crawl_single_company(self, company_id: int, max_articles: int = 50) -> CrawlResult:
        """특정 회사의 뉴스 크롤링"""
        async with AsyncSessionLocal() as session:
            # 회사 정보 조회
            result = await session.execute(
                select(Company).where(Company.id == company_id, Company.is_active == True)
            )
            company = result.scalar_one_or_none()
            
            if not company:
                raise ValueError(f"Active company not found with ID: {company_id}")
            
            # 뉴스 크롤링
            crawl_result = await self.scraper.crawl_company_news(
                company_id=company.id,
                company_name=company.company_name,
                max_articles=max_articles
            )
            
            # 성공한 경우 기사 저장 (중복 API 호출 제거)
            if crawl_result.success and crawl_result.articles_data:
                saved_count = await self.save_articles(crawl_result.articles_data)
                crawl_result.articles_saved = saved_count
            
            return crawl_result
    
    async def save_articles(self, articles_data: List[Dict]) -> int:
        """기사 데이터를 데이터베이스에 저장 (3단계 Quality Gate 적용)"""
        if not articles_data:
            return 0
        
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
                    relevance_score = await self._calculate_relevance_score(article_data)
                    
                    # Quality Gate: 최소 점수 미달 시 저장 거부
                    min_quality_score = 0.6  # 60% 이상의 관련성 요구
                    if relevance_score < min_quality_score:
                        quality_filtered_count += 1
                        logger.debug(f"Quality Gate blocked: '{article_data['title']}' (score: {relevance_score:.2f})")
                        continue
                    
                    # 새 기사 생성
                    # TODO: 향후 relevance_score 필드 추가 시 저장 예정
                    article = Article(**article_data)
                    session.add(article)
                    saved_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to save article: {str(e)}")
                    continue
            
            try:
                await session.commit()
                logger.info(f"Saved {saved_count} new articles to database")
                if quality_filtered_count > 0:
                    logger.info(f"🛡️ Quality Gate blocked {quality_filtered_count} low-quality articles")
                return saved_count
                
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to commit articles: {str(e)}")
                return 0
    
    async def _calculate_relevance_score(self, article_data: Dict) -> float:
        """기사의 관련도 점수 계산 (0.0 ~ 1.0)"""
        try:
            company_id = article_data.get('company_id')
            title = article_data.get('title', '').lower()
            summary = article_data.get('summary', '').lower()
            
            if not company_id:
                return 0.0
            
            # DB에서 회사 정보 조회
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(Company.company_name, Company.company_name_en, Company.positive_keywords, Company.negative_keywords)
                    .where(Company.id == company_id)
                )
                row = result.first()
                
                if not row:
                    return 0.0
                
                company_name = row.company_name.lower()
                company_name_en = (row.company_name_en or '').lower()
                positive_keywords = [kw.lower() for kw in (row.positive_keywords or [])]
                negative_keywords = [kw.lower() for kw in (row.negative_keywords or [])]
                
                full_text = f"{title} {summary}"
                score = 0.0
                
                # 1. 회사명 정확 매칭 (가중치: 40%)
                if company_name in title:
                    score += 0.4
                elif company_name in summary:
                    score += 0.2
                
                # 2. 영어 회사명 매칭 (가중치: 30%)
                if company_name_en and company_name_en in full_text:
                    score += 0.3
                
                # 3. Positive keywords 매칭 (가중치: 20%)
                positive_matches = sum(1 for kw in positive_keywords if kw in full_text)
                if positive_keywords:
                    positive_ratio = min(positive_matches / len(positive_keywords), 1.0)
                    score += 0.2 * positive_ratio
                
                # 4. 제목 내 키워드 밀도 보너스 (가중치: 10%)
                all_keywords = [company_name] + positive_keywords
                title_keyword_count = sum(1 for kw in all_keywords if kw in title)
                if all_keywords:
                    title_density = min(title_keyword_count / len(all_keywords), 1.0)
                    score += 0.1 * title_density
                
                # 5. Negative keywords 패널티 (-50%)
                for neg_kw in negative_keywords:
                    if neg_kw in full_text:
                        score -= 0.5
                        logger.debug(f"Negative keyword penalty: '{neg_kw}' found in article")
                        break
                
                # 점수 정규화 (0.0 ~ 1.0)
                final_score = max(0.0, min(1.0, score))
                
                logger.debug(f"Relevance score for '{title[:50]}...': {final_score:.2f}")
                return final_score
                
        except Exception as e:
            logger.error(f"Failed to calculate relevance score: {e}")
            return 0.5  # 에러 시 중간값 반환
    
    async def get_crawl_statistics(self) -> Dict:
        """크롤링 통계 정보 조회"""
        async with AsyncSessionLocal() as session:
            # 전체 기사 수
            total_articles = await session.execute(select(Article))
            total_count = len(total_articles.scalars().all())
            
            # 회사별 기사 수 (정확한 집계)
            from sqlalchemy import func
            companies_with_articles = await session.execute(
                select(Company.company_name, func.count(Article.id).label('article_count'))
                .join(Article)
                .group_by(Company.id, Company.company_name)
            )
            
            company_stats = {}
            for company_name, article_count in companies_with_articles:
                company_stats[company_name] = article_count
            
            return {
                "total_articles": total_count,
                "companies_count": len(company_stats),
                "company_statistics": company_stats
            }
