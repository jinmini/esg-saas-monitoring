from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from loguru import logger

from .service import CrawlerService
from .schemas import CrawlResult, NewsSearchRequest
from .scrapers.scheduler import crawler_scheduler

router = APIRouter(prefix="/crawler", tags=["crawler"])
crawler_service = CrawlerService()


@router.post("/crawl/all", response_model=List[CrawlResult])
async def crawl_all_companies(
    background_tasks: BackgroundTasks,
    max_articles_per_company: int = 50
):
    """모든 활성화된 회사의 뉴스 크롤링 (백그라운드 실행)"""
    try:
        # 백그라운드에서 크롤링 실행
        background_tasks.add_task(
            crawler_service.crawl_all_companies,
            max_articles_per_company
        )
        
        return {"message": "Crawling started in background", "status": "started"}
        
    except Exception as e:
        logger.error(f"Failed to start crawling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start crawling: {str(e)}")


@router.post("/crawl/company/{company_id}", response_model=CrawlResult)
async def crawl_single_company(
    company_id: int,
    max_articles: int = 50
):
    """특정 회사의 뉴스 크롤링"""
    try:
        result = await crawler_service.crawl_single_company(company_id, max_articles)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to crawl company {company_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Crawling failed: {str(e)}")


@router.get("/companies")
async def get_active_companies():
    """활성화된 회사 목록 조회"""
    try:
        companies = await crawler_service.get_active_companies()
        return {
            "companies": companies,
            "count": len(companies)
        }
        
    except Exception as e:
        logger.error(f"Failed to get companies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get companies: {str(e)}")


@router.get("/statistics")
async def get_crawl_statistics():
    """크롤링 통계 정보 조회"""
    try:
        stats = await crawler_service.get_crawl_statistics()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")


@router.get("/health")
async def crawler_health_check():
    """크롤러 서비스 헬스체크"""
    try:
        # 네이버 API 연결 테스트
        scraper = crawler_service.scraper
        test_result = await scraper.search_news("테스트", display=1)
        
        if test_result and 'items' in test_result:
            return {
                "status": "healthy",
                "naver_api": "connected",
                "message": "Crawler service is running properly"
            }
        else:
            return {
                "status": "unhealthy",
                "naver_api": "disconnected",
                "message": "Naver API connection failed"
            }
            
    except Exception as e:
        logger.error(f"Crawler health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "naver_api": "error",
            "message": f"Health check failed: {str(e)}"
        }


# 스케줄러 관리 API 엔드포인트들
@router.post("/scheduler/start")
async def start_scheduler():
    """크롤링 스케줄러 시작"""
    try:
        await crawler_scheduler.start()
        return {
            "status": "success",
            "message": "크롤링 스케줄러가 시작되었습니다.",
            "is_running": crawler_scheduler.is_running
        }
        
    except Exception as e:
        logger.error(f"스케줄러 시작 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"스케줄러 시작 실패: {str(e)}")


@router.post("/scheduler/stop")
async def stop_scheduler():
    """크롤링 스케줄러 중지"""
    try:
        await crawler_scheduler.stop()
        return {
            "status": "success",
            "message": "크롤링 스케줄러가 중지되었습니다.",
            "is_running": crawler_scheduler.is_running
        }
        
    except Exception as e:
        logger.error(f"스케줄러 중지 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"스케줄러 중지 실패: {str(e)}")


@router.get("/scheduler/status")
async def get_scheduler_status():
    """크롤링 스케줄러 상태 조회"""
    try:
        jobs = crawler_scheduler.get_jobs()
        return {
            "is_running": crawler_scheduler.is_running,
            "jobs_count": len(jobs),
            "jobs": jobs
        }
        
    except Exception as e:
        logger.error(f"스케줄러 상태 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"스케줄러 상태 조회 실패: {str(e)}")


@router.post("/scheduler/crawl/manual/all")
async def manual_crawl_all():
    """수동 전체 크롤링 실행"""
    try:
        # 백그라운드에서 실행
        import asyncio
        asyncio.create_task(crawler_scheduler.manual_crawl_all())
        
        return {
            "status": "success",
            "message": "수동 전체 크롤링이 백그라운드에서 시작되었습니다."
        }
        
    except Exception as e:
        logger.error(f"수동 전체 크롤링 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"수동 전체 크롤링 실패: {str(e)}")


@router.post("/scheduler/crawl/manual/company/{company_id}")
async def manual_crawl_company(company_id: int):
    """수동 개별 회사 크롤링 실행"""
    try:
        # 백그라운드에서 실행
        import asyncio
        task = asyncio.create_task(crawler_scheduler.manual_crawl_company(company_id))
        
        return {
            "status": "success",
            "message": f"회사 ID {company_id}의 수동 크롤링이 백그라운드에서 시작되었습니다."
        }
        
    except Exception as e:
        logger.error(f"수동 개별 크롤링 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"수동 개별 크롤링 실패: {str(e)}")
