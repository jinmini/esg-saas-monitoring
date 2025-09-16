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
                
                # 크롤링된 기사들을 데이터베이스에 저장
                if result.success:
                    articles_data = await self.scraper.parse_articles(
                        await self.scraper.search_news(
                            query=company['company_name'],
                            display=min(result.articles_saved, 100),
                            sort="date"
                        ),
                        company['id']
                    )
                    
                    saved_count = await self.save_articles(articles_data)
                    result.articles_saved = saved_count
                
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
            
            # 성공한 경우 기사 저장
            if crawl_result.success:
                articles_data = await self.scraper.parse_articles(
                    await self.scraper.search_news(
                        query=company.company_name,
                        display=min(crawl_result.articles_saved, 100),
                        sort="date"
                    ),
                    company.id
                )
                
                saved_count = await self.save_articles(articles_data)
                crawl_result.articles_saved = saved_count
            
            return crawl_result
    
    async def save_articles(self, articles_data: List[Dict]) -> int:
        """기사 데이터를 데이터베이스에 저장"""
        if not articles_data:
            return 0
        
        async with AsyncSessionLocal() as session:
            saved_count = 0
            
            for article_data in articles_data:
                try:
                    # 중복 기사 확인 (URL 기준)
                    existing = await session.execute(
                        select(Article).where(Article.article_url == article_data['article_url'])
                    )
                    
                    if existing.scalar_one_or_none():
                        logger.debug(f"Article already exists: {article_data['article_url']}")
                        continue
                    
                    # 새 기사 생성
                    article = Article(**article_data)
                    session.add(article)
                    saved_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to save article: {str(e)}")
                    continue
            
            try:
                await session.commit()
                logger.info(f"Saved {saved_count} new articles to database")
                return saved_count
                
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to commit articles: {str(e)}")
                return 0
    
    async def get_crawl_statistics(self) -> Dict:
        """크롤링 통계 정보 조회"""
        async with AsyncSessionLocal() as session:
            # 전체 기사 수
            total_articles = await session.execute(select(Article))
            total_count = len(total_articles.scalars().all())
            
            # 회사별 기사 수
            companies_with_articles = await session.execute(
                select(Company.company_name, Article.id.label('article_count'))
                .join(Article)
                .group_by(Company.id, Company.company_name)
            )
            
            company_stats = {}
            for company_name, _ in companies_with_articles:
                company_articles = await session.execute(
                    select(Article).join(Company).where(Company.company_name == company_name)
                )
                company_stats[company_name] = len(company_articles.scalars().all())
            
            return {
                "total_articles": total_count,
                "companies_count": len(company_stats),
                "company_statistics": company_stats
            }
