"""
주기적 크롤링 스케줄러
APScheduler를 사용한 백그라운드 작업 관리
"""
import asyncio
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger

from ..service import CrawlerService


class CrawlingScheduler:
    """크롤링 작업 스케줄러"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.crawler_service = CrawlerService()
        self.is_running = False
    
    async def start(self):
        """스케줄러 시작"""
        if self.is_running:
            logger.warning("스케줄러가 이미 실행 중입니다.")
            return
        
        try:
            # 기본 크롤링 작업 등록
            await self._register_crawling_jobs()
            
            # 스케줄러 시작
            self.scheduler.start()
            self.is_running = True
            logger.info("크롤링 스케줄러가 시작되었습니다.")
            
        except Exception as e:
            logger.error(f"스케줄러 시작 실패: {str(e)}")
            raise
    
    async def stop(self):
        """스케줄러 중지"""
        if not self.is_running:
            logger.warning("스케줄러가 실행되지 않고 있습니다.")
            return
        
        try:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("크롤링 스케줄러가 중지되었습니다.")
            
        except Exception as e:
            logger.error(f"스케줄러 중지 실패: {str(e)}")
            raise
    
    async def _register_crawling_jobs(self):
        """크롤링 작업들을 스케줄러에 등록"""
        
        # 1. 일일 전체 크롤링 (매일 자정 30분)
        self.scheduler.add_job(
            func=self._daily_full_crawl,
            trigger=CronTrigger(hour=0, minute=30),
            id="daily_full_crawl",
            name="일일 전체 크롤링",
            max_instances=1,
            coalesce=True,
            misfire_grace_time=3600  # 1시간 이내 실행 허용
        )
        logger.info("일일 전체 크롤링 작업 등록 완료 (매일 00:30)")
        
        # 2. 6시간마다 증분 크롤링
        self.scheduler.add_job(
            func=self._incremental_crawl,
            trigger=IntervalTrigger(hours=6),
            id="incremental_crawl",
            name="6시간마다 증분 크롤링",
            max_instances=1,
            coalesce=True,
            misfire_grace_time=1800  # 30분 이내 실행 허용
        )
        logger.info("증분 크롤링 작업 등록 완료 (6시간마다)")
        
        # 3. 주간 통계 업데이트 (매주 일요일 오전 2시)
        self.scheduler.add_job(
            func=self._weekly_stats_update,
            trigger=CronTrigger(day_of_week=6, hour=2, minute=0),  # 일요일 오전 2시
            id="weekly_stats_update",
            name="주간 통계 업데이트",
            max_instances=1,
            coalesce=True
        )
        logger.info("주간 통계 업데이트 작업 등록 완료 (매주 일요일 02:00)")
    
    async def _daily_full_crawl(self):
        """일일 전체 크롤링 작업"""
        logger.info("일일 전체 크롤링 시작")
        
        try:
            # 모든 활성 회사에 대해 크롤링 수행
            results = await self.crawler_service.crawl_all_companies(
                max_articles_per_company=100  # 일일 크롤링은 더 많은 기사 수집
            )
            
            # 결과 로깅
            total_articles = sum(r.articles_saved for r in results if r.success)
            success_count = sum(1 for r in results if r.success)
            
            logger.info(f"일일 전체 크롤링 완료: {success_count}/{len(results)} 회사, {total_articles}개 기사 수집")
            
            # 실패한 회사들에 대한 재시도 (1시간 후)
            failed_companies = [r for r in results if not r.success]
            if failed_companies:
                logger.warning(f"{len(failed_companies)}개 회사 크롤링 실패, 1시간 후 재시도 예약")
                self.scheduler.add_job(
                    func=self._retry_failed_crawls,
                    trigger='date',
                    run_date=datetime.now() + timedelta(hours=1),
                    args=[failed_companies],
                    id=f"retry_failed_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    name="실패 크롤링 재시도",
                    max_instances=1
                )
            
        except Exception as e:
            logger.error(f"일일 전체 크롤링 실패: {str(e)}")
    
    async def _incremental_crawl(self):
        """증분 크롤링 작업 (최신 기사만)"""
        logger.info("증분 크롤링 시작")
        
        try:
            # 모든 활성 회사에 대해 적은 수의 최신 기사만 수집
            results = await self.crawler_service.crawl_all_companies(
                max_articles_per_company=20  # 증분 크롤링은 적은 수의 기사만
            )
            
            # 결과 로깅
            total_articles = sum(r.articles_saved for r in results if r.success)
            success_count = sum(1 for r in results if r.success)
            
            logger.info(f"증분 크롤링 완료: {success_count}/{len(results)} 회사, {total_articles}개 기사 수집")
            
        except Exception as e:
            logger.error(f"증분 크롤링 실패: {str(e)}")
    
    async def _weekly_stats_update(self):
        """주간 통계 업데이트 작업"""
        logger.info("주간 통계 업데이트 시작")
        
        try:
            # 크롤링 통계 조회
            stats = await self.crawler_service.get_crawl_statistics()
            
            logger.info(f"주간 통계: 총 {stats['total_articles']}개 기사, {stats['companies_count']}개 회사")
            logger.info(f"회사별 통계: {stats['company_statistics']}")
            
            # TODO: 향후 일일 집계 테이블 업데이트 로직 추가
            # await self._update_daily_aggregations()
            
        except Exception as e:
            logger.error(f"주간 통계 업데이트 실패: {str(e)}")
    
    async def _retry_failed_crawls(self, failed_results):
        """실패한 크롤링 재시도"""
        logger.info(f"{len(failed_results)}개 회사 크롤링 재시도 시작")
        
        retry_count = 0
        for failed_result in failed_results:
            try:
                # 개별 회사 크롤링 재시도
                company_id = failed_result.company_id
                if company_id:
                    result = await self.crawler_service.crawl_single_company(
                        company_id=company_id,
                        max_articles=50
                    )
                    
                    if result.success:
                        retry_count += 1
                        logger.info(f"재시도 성공: 회사 ID {company_id}, {result.articles_saved}개 기사 수집")
                    else:
                        logger.warning(f"재시도 실패: 회사 ID {company_id}")
                        
            except Exception as e:
                logger.error(f"재시도 중 오류 발생: {str(e)}")
        
        logger.info(f"크롤링 재시도 완료: {retry_count}개 회사 성공")
    
    def add_custom_job(self, func, trigger, job_id: str, name: str, **kwargs):
        """사용자 정의 작업 추가"""
        try:
            self.scheduler.add_job(
                func=func,
                trigger=trigger,
                id=job_id,
                name=name,
                max_instances=1,
                coalesce=True,
                **kwargs
            )
            logger.info(f"사용자 정의 작업 추가: {name} ({job_id})")
            
        except Exception as e:
            logger.error(f"사용자 정의 작업 추가 실패: {str(e)}")
            raise
    
    def remove_job(self, job_id: str):
        """작업 제거"""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"작업 제거 완료: {job_id}")
            
        except Exception as e:
            logger.error(f"작업 제거 실패: {str(e)}")
            raise
    
    def get_jobs(self):
        """등록된 작업 목록 조회"""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time,
                'trigger': str(job.trigger)
            })
        return jobs
    
    async def manual_crawl_all(self):
        """수동 전체 크롤링 실행"""
        logger.info("수동 전체 크롤링 시작")
        await self._daily_full_crawl()
    
    async def manual_crawl_company(self, company_id: int):
        """수동 개별 회사 크롤링 실행"""
        logger.info(f"수동 개별 크롤링 시작: 회사 ID {company_id}")
        
        try:
            result = await self.crawler_service.crawl_single_company(
                company_id=company_id,
                max_articles=50
            )
            
            if result.success:
                logger.info(f"수동 개별 크롤링 완료: {result.articles_saved}개 기사 수집")
            else:
                logger.warning(f"수동 개별 크롤링 실패: 회사 ID {company_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"수동 개별 크롤링 오류: {str(e)}")
            raise


# 전역 스케줄러 인스턴스
crawler_scheduler = CrawlingScheduler()
