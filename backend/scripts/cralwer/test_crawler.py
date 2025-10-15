"""
크롤러 테스트 스크립트
네이버 API 키 설정 후 실행하여 크롤링 기능을 테스트합니다.
"""
import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.crawler.service import CrawlerService
from src.crawler.scrapers.news_scraper import NaverNewsScraper
from src.core.config import settings


async def test_naver_api():
    """네이버 API 연결 테스트"""
    print("🔍 네이버 API 연결 테스트 시작...")
    
    # API 키 확인
    if settings.NAVER_CLIENT_ID == "your-naver-client-id":
        print("❌ 네이버 API 키가 설정되지 않았습니다.")
        print("   .env.dev 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정하세요.")
        return False
    
    scraper = NaverNewsScraper()
    
    try:
        # 간단한 검색 테스트
        result = await scraper.search_news("ESG", display=5, sort="date")
        
        if result and 'items' in result:
            print(f"✅ API 연결 성공! 검색 결과: {len(result['items'])}개")
            print(f"   전체 결과 수: {result.get('total', 0)}개")
            
            # 첫 번째 기사 정보 출력
            if result['items']:
                first_item = result['items'][0]
                print(f"   첫 번째 기사: {first_item['title'][:50]}...")
            
            return True
        else:
            print("❌ 검색 결과가 없습니다.")
            return False
            
    except Exception as e:
        print(f"❌ API 연결 실패: {str(e)}")
        return False


async def test_company_crawling():
    """회사별 뉴스 크롤링 테스트"""
    print("\n📰 회사별 뉴스 크롤링 테스트 시작...")
    
    crawler_service = CrawlerService()
    
    try:
        # 활성화된 회사 목록 조회
        companies = await crawler_service.get_active_companies()
        print(f"📋 활성화된 회사 수: {len(companies)}")
        
        if not companies:
            print("❌ 활성화된 회사가 없습니다.")
            return
        
        # 첫 번째 회사로 테스트
        test_company = companies[0]
        print(f"🏢 테스트 대상: {test_company['company_name']}")
        
        result = await crawler_service.crawl_single_company(
            company_id=test_company['id'],
            max_articles=5  # 테스트용으로 5개만
        )
        
        if result.success:
            print(f"✅ 크롤링 성공!")
            print(f"   - 검색어: {result.query}")
            print(f"   - 발견된 기사 수: {result.total_found}")
            print(f"   - 저장된 기사 수: {result.articles_saved}")
            print(f"   - 소요 시간: {result.crawl_duration:.2f}초")
        else:
            print(f"❌ 크롤링 실패: {result.error_message}")
    
    except Exception as e:
        print(f"❌ 크롤링 테스트 실패: {str(e)}")


async def test_crawl_statistics():
    """크롤링 통계 조회 테스트"""
    print("\n📊 크롤링 통계 조회 테스트...")
    
    crawler_service = CrawlerService()
    
    try:
        stats = await crawler_service.get_crawl_statistics()
        
        print(f"📈 크롤링 통계:")
        print(f"   - 전체 기사 수: {stats['total_articles']}")
        print(f"   - 회사 수: {stats['companies_count']}")
        
        if stats['company_statistics']:
            print("   - 회사별 기사 수:")
            for company_name, count in stats['company_statistics'].items():
                print(f"     * {company_name}: {count}개")
        
    except Exception as e:
        print(f"❌ 통계 조회 실패: {str(e)}")


async def main():
    """메인 테스트 함수"""
    print("🚀 크롤러 테스트 시작")
    print("=" * 50)
    
    # 1. API 연결 테스트
    api_ok = await test_naver_api()
    
    if not api_ok:
        print("\n❌ API 연결이 실패하여 추가 테스트를 중단합니다.")
        return
    
    # 2. 회사별 크롤링 테스트
    await test_company_crawling()
    
    # 3. 통계 조회 테스트
    await test_crawl_statistics()
    
    print("\n" + "=" * 50)
    print("✅ 크롤러 테스트 완료")


if __name__ == "__main__":
    asyncio.run(main())
