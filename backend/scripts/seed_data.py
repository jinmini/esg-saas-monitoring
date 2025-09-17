"""
초기 테스트 데이터 삽입 스크립트
"""
import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from core.database import AsyncSessionLocal
from shared.models import Company, ESGServiceCategory, CompanyServiceMapping
from sqlalchemy import select


async def seed_companies():
    """ESG SaaS 기업 초기 데이터 삽입"""
    async with AsyncSessionLocal() as session:
        # 기존 데이터 확인
        companies_data = [
            {
                "company_name": "엔츠",
                "company_name_en": "AENTS",
                "website_url": "https://aents.co",
                "description": "AI 기반 제로에너지 빌딩 관리",
                "is_active": True
            },
            {
                "company_name": "그리너리",
                "company_name_en": "Greenery",
                "website_url": "https://www.greenery.im/ko/lca?gad_source=1&gad_campaignid=22206082265&gbraid=0AAAAA-nrf3rBUrx_b4GCAHx4bDkeQ2MBq&gclid=EAIaIQobChMIj9q82ufejwMV7s5MAh0ZNSHwEAAYASAAEgJfafD_BwE",
                "description": "탄소중립 솔루션 및 LCA 시스템",
                "is_active": True
            },
            {
                "company_name": "오후두시랩",
                "company_name_en": "AfternoonLab",
                "website_url": "https://www.greenflow.eco/",
                "description": "AI 기반 탄소배출량 측정 '그린플로'",
                "is_active": True
            },
            {
                "company_name": "EDK",
                "company_name_en": "EDK",
                "website_url": "https://www.edk.kr/",
                "description": "ESG 데이터 관리 및 분석 솔루션",
                "is_active": True
            },
            {
                "company_name": "리빗",
                "company_name_en": "Rebit",
                "website_url": "https://www.tanso.life/ko/home",
                "description": "탄소회계 전문 (탄솔루션)",
                "is_active": True
            },
            {
                "company_name": "쿤텍",
                "company_name_en": "Kuntech",
                "website_url": "https://www.planesg.ai/",
                "description": "DX 보안 및 ESG 솔루션",
                "is_active": True
            },
            {
                "company_name": "글래스돔",
                "company_name_en": "Glassdome",
                "website_url": "https://glassdome.com/ko/",
                "description": "제조업 탄소발자국 관리",
                "is_active": True
            },
            {
                "company_name": "윈클",
                "company_name_en": "Winkle",
                "website_url": "https://www.wincl.io/",
                "description": "탄소배출권 거래 플랫폼",
                "is_active": True
            },
            {
                "company_name": "후시파트너스",
                "company_name_en": "Fusi Partners",
                "website_url": "https://www.hooxipartners.com/",
                "description": "미래배출권 운용 전문",
                "is_active": True
            },
            {
                "company_name": "페어랩스",
                "company_name_en": "Fair Labs",
                "website_url": "https://www.fairlabs.io/ko/",
                "description": "ESG 데이터 분석 플랫폼",
                "is_active": True
            },
            {
                "company_name": "서스틴베스트",
                "company_name_en": "SustinVest",
                "website_url": "https://www.sustinvest.com/",
                "description": "ESG 평가 및 컨설팅",
                "is_active": True
            },
            {
                "company_name": "퀀티파이드이에스지",
                "company_name_en": "Quantified ESG",
                "website_url": "https://qesg.co.kr/reporting_tool",
                "description": "ESG 평가 및 리포팅",
                "is_active": True
            },
            {
                "company_name": "누빅스",
                "company_name_en": "Nubics",
                "website_url": "",
                "description": "VCP-X 플랫폼 기반 LCA",
                "is_active": True
            },
            {
                "company_name": "하나루프",
                "company_name_en": "Hanaloop",
                "website_url": "https://hanaloop.com",
                "description": "클라우드 기반 탄소관리 '하나에코'",
                "is_active": True
            },
            {
                "company_name": "chemtopia",
                "company_name_en": "Chemtopia",
                "website_url": "https://carbon-slim.net/",
                "description": "화학물질 및 환경안전보건",
                "is_active": True
            },
            {
                "company_name": "로그블랙",
                "company_name_en": "LogBlack",
                "website_url": "https://logblack.com/ko",
                "description": "ESG 올인원 SaaS 솔루션",
                "is_active": True
            },
            {
                "company_name": "space bank",
                "company_name_en": "Space Bank",
                "website_url": "https://www.spacebank.company/esg",
                "description": "DX 솔루션 및 데이터 플랫폼",
                "is_active": True
            },
            {
                "company_name": "에코비즈허브",
                "company_name_en": "EcoBizHub",
                "website_url": "https://www.ecobizhub.com/",
                "description": "ESG 비즈니스 허브 플랫폼",
                "is_active": True
            }
        ]
        
        for company_data in companies_data:
            company = Company(**company_data)
            session.add(company)
        
        try:
            await session.commit()
            print(f"✅ {len(companies_data)}개 회사 데이터 삽입 완료")
        except Exception as e:
            await session.rollback()
            print(f"❌ 데이터 삽입 실패: {e}")


async def seed_esg_categories():
    """ESG 서비스 카테고리 초기 데이터 삽입"""
    async with AsyncSessionLocal() as session:
        categories_data = [
            # A. 데이터 수집 및 관리
            {"category_code": "A1", "category_name": "데이터 수집 및 통합", "category_name_en": "Data Collection and Integration", "main_topic": "Data Management", "description": "ESG 데이터의 수집 및 통합 기능"},
            {"category_code": "A2", "category_name": "데이터 품질 관리", "category_name_en": "Data Quality Management", "main_topic": "Data Management", "description": "수집된 데이터의 품질 검증 및 관리"},
            {"category_code": "A3", "category_name": "데이터 검증 및 감사", "category_name_en": "Data Verification and Audit", "main_topic": "Data Management", "description": "데이터 정확성 검증 및 감사 추적"},
            {"category_code": "A4", "category_name": "외부 시스템 연동", "category_name_en": "External System Integration", "main_topic": "Data Management", "description": "외부 시스템과의 데이터 연동"},
            
            # B. GHG 배출량 계산
            {"category_code": "B1", "category_name": "GHG 배출량 계산", "category_name_en": "GHG Emissions Calculation", "main_topic": "Carbon Accounting", "description": "온실가스 배출량 산정 및 관리"},
            {"category_code": "B2", "category_name": "제품 탄소발자국", "category_name_en": "Product Carbon Footprint", "main_topic": "Carbon Accounting", "description": "제품별 탄소발자국 계산"},
            {"category_code": "B3", "category_name": "생애주기 평가", "category_name_en": "Life Cycle Assessment", "main_topic": "Carbon Accounting", "description": "제품/서비스의 전체 생애주기 환경영향 평가"},
            {"category_code": "B4", "category_name": "실시간 데이터 기반 계산", "category_name_en": "Real-time Data-based Calculation", "main_topic": "Carbon Accounting", "description": "실시간 데이터를 활용한 배출량 계산"},
            
            # C. 자동 보고서 생성
            {"category_code": "C1", "category_name": "자동 보고서 생성", "category_name_en": "Automated Report Generation", "main_topic": "ESG Reporting", "description": "ESG 보고서 자동 생성 기능"},
            {"category_code": "C2", "category_name": "규제 프레임워크 대응", "category_name_en": "Regulatory Framework Compliance", "main_topic": "ESG Reporting", "description": "각종 ESG 규제 및 프레임워크 대응"},
            {"category_code": "C3", "category_name": "중대성 평가", "category_name_en": "Materiality Assessment", "main_topic": "ESG Reporting", "description": "ESG 이슈의 중대성 평가"},
            {"category_code": "C4", "category_name": "국제 표준 인증 지원", "category_name_en": "International Standards Certification", "main_topic": "ESG Reporting", "description": "ISO, GRI 등 국제 표준 인증 지원"},
            
            # D. 감축 목표 설정
            {"category_code": "D1", "category_name": "감축 목표 설정", "category_name_en": "Reduction Target Setting", "main_topic": "Target Management", "description": "탄소 감축 목표 설정 및 관리"},
            {"category_code": "D2", "category_name": "전환상황 모니터링", "category_name_en": "Transition Monitoring", "main_topic": "Target Management", "description": "탄소중립 전환 과정 모니터링"},
            {"category_code": "D3", "category_name": "시나리오 모델링", "category_name_en": "Scenario Modeling", "main_topic": "Target Management", "description": "다양한 시나리오 기반 모델링"},
            {"category_code": "D4", "category_name": "경제성 분석", "category_name_en": "Economic Analysis", "main_topic": "Target Management", "description": "ESG 투자 및 활동의 경제성 분석"},
            
            # E. 탄소크레딧 거래
            {"category_code": "E1", "category_name": "탄소크레딧 거래", "category_name_en": "Carbon Credit Trading", "main_topic": "Carbon Trading", "description": "탄소크레딧 거래 플랫폼"},
            {"category_code": "E2", "category_name": "배출권 관리", "category_name_en": "Emission Trading", "main_topic": "Carbon Trading", "description": "배출권 거래 및 관리"},
            
            # F. AI 기반 데이터 분석
            {"category_code": "F1", "category_name": "AI 기반 데이터 분석", "category_name_en": "AI-based Data Analysis", "main_topic": "AI Analytics", "description": "AI를 활용한 ESG 데이터 분석"},
            {"category_code": "F2", "category_name": "예측 모델링", "category_name_en": "Predictive Modeling", "main_topic": "AI Analytics", "description": "AI 기반 예측 모델링"},
            
            # G. 직원 탄소관리 앱
            {"category_code": "G1", "category_name": "직원 탄소관리 앱", "category_name_en": "Employee Carbon Management App", "main_topic": "Workplace Management", "description": "직원 대상 탄소관리 앱"},
            {"category_code": "G2", "category_name": "ESG 챌린지", "category_name_en": "ESG Challenge", "main_topic": "Workplace Management", "description": "ESG 실천 챌린지 프로그램"},
            {"category_code": "G3", "category_name": "출퇴근/출장 관리", "category_name_en": "Commute/Business Trip Management", "main_topic": "Workplace Management", "description": "출퇴근 및 출장 관련 탄소배출 관리"},
            
            # H. 제조 공정 최적화
            {"category_code": "H1", "category_name": "제조 공정 최적화", "category_name_en": "Manufacturing Process Optimization", "main_topic": "Manufacturing", "description": "제조 공정의 탄소배출 최적화"},
            {"category_code": "H2", "category_name": "실시간 설비 데이터 연동", "category_name_en": "Real-time Equipment Data Integration", "main_topic": "Manufacturing", "description": "실시간 설비 데이터 연동 및 분석"}
        ]
        
        for category_data in categories_data:
            category = ESGServiceCategory(**category_data)
            session.add(category)
        
        try:
            await session.commit()
            print(f"✅ {len(categories_data)}개 ESG 서비스 카테고리 데이터 삽입 완료")
        except Exception as e:
            await session.rollback()
            print(f"❌ ESG 카테고리 데이터 삽입 실패: {e}")


async def seed_company_service_mappings():
    """회사별 서비스 매핑 데이터 삽입"""
    async with AsyncSessionLocal() as session:
        # company.md의 매핑 데이터를 기반으로 한 이진 매트릭스
        company_mappings = {
            "엔츠": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 1, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 0, "C4": 0, "D1": 1, "D2": 1, "D3": 1, "D4": 0, "E1": 1, "E2": 1, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "그리너리": {"A1": 1, "A2": 0, "A3": 0, "A4": 1, "B1": 1, "B2": 0, "B3": 1, "B4": 0, "C1": 0, "C2": 1, "C3": 0, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 1, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "오후두시랩": {"A1": 1, "A2": 1, "A3": 0, "A4": 0, "B1": 1, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 0, "C3": 0, "C4": 0, "D1": 1, "D2": 1, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 1, "H1": 0, "H2": 0},
            "EDK": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 1, "C4": 0, "D1": 1, "D2": 1, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "리빗": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 1, "B3": 0, "B4": 1, "C1": 1, "C2": 1, "C3": 0, "C4": 1, "D1": 1, "D2": 1, "D3": 1, "D4": 1, "E1": 0, "E2": 0, "F1": 1, "F2": 1, "G1": 1, "G2": 1, "G3": 1, "H1": 0, "H2": 0},
            "쿤텍": {"A1": 0, "A2": 1, "A3": 1, "A4": 1, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 0, "C2": 0, "C3": 0, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "글래스돔": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 1, "B3": 0, "B4": 1, "C1": 1, "C2": 1, "C3": 0, "C4": 1, "D1": 0, "D2": 1, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 1, "H2": 1},
            "윈클": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 0, "C4": 0, "D1": 1, "D2": 1, "D3": 0, "D4": 0, "E1": 1, "E2": 1, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "후시파트너스": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 1, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 0, "C4": 0, "D1": 1, "D2": 1, "D3": 0, "D4": 0, "E1": 1, "E2": 1, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "페어랩스": {"A1": 1, "A2": 1, "A3": 0, "A4": 0, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 0, "C3": 0, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "서스틴베스트": {"A1": 1, "A2": 1, "A3": 1, "A4": 0, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 1, "C4": 0, "D1": 1, "D2": 1, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "퀀티파이드이에스지": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 0, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "누빅스": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 1, "B3": 0, "B4": 1, "C1": 0, "C2": 1, "C3": 0, "C4": 1, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 1},
            "하나루프": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 1, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 0, "C4": 0, "D1": 1, "D2": 1, "D3": 1, "D4": 1, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "chemtopia": {"A1": 0, "A2": 0, "A3": 0, "A4": 1, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 0, "C2": 1, "C3": 0, "C4": 1, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "로그블랙": {"A1": 1, "A2": 1, "A3": 1, "A4": 1, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 1, "C2": 1, "C3": 1, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "space bank": {"A1": 1, "A2": 1, "A3": 0, "A4": 1, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 0, "C2": 0, "C3": 0, "C4": 0, "D1": 0, "D2": 1, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 1, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0},
            "에코비즈허브": {"A1": 0, "A2": 0, "A3": 0, "A4": 0, "B1": 0, "B2": 0, "B3": 0, "B4": 0, "C1": 0, "C2": 0, "C3": 0, "C4": 0, "D1": 0, "D2": 0, "D3": 0, "D4": 0, "E1": 0, "E2": 0, "F1": 0, "F2": 0, "G1": 0, "G2": 0, "G3": 0, "H1": 0, "H2": 0}
        }
        
        # 회사와 카테고리 정보 조회
        companies_result = await session.execute(select(Company))
        companies = {comp.company_name: comp.id for comp in companies_result.scalars().all()}
        
        categories_result = await session.execute(select(ESGServiceCategory))
        categories = {cat.category_code: cat.id for cat in categories_result.scalars().all()}
        
        mapping_count = 0
        for company_name, services in company_mappings.items():
            if company_name not in companies:
                print(f"⚠️ 회사 '{company_name}' 를 찾을 수 없습니다.")
                continue
                
            company_id = companies[company_name]
            
            for category_code, provides_service in services.items():
                if category_code not in categories:
                    print(f"⚠️ 카테고리 '{category_code}' 를 찾을 수 없습니다.")
                    continue
                
                category_id = categories[category_code]
                
                mapping = CompanyServiceMapping(
                    company_id=company_id,
                    category_id=category_id,
                    provides_service=bool(provides_service),
                    confidence_level=1.0
                )
                session.add(mapping)
                mapping_count += 1
        
        try:
            await session.commit()
            print(f"✅ {mapping_count}개 회사-서비스 매핑 데이터 삽입 완료")
        except Exception as e:
            await session.rollback()
            print(f"❌ 매핑 데이터 삽입 실패: {e}")


async def main():
    print("🌱 초기 데이터 삽입 시작...")
    await seed_companies()
    await seed_esg_categories()
    await seed_company_service_mappings()
    print("✅ 초기 데이터 삽입 완료")


if __name__ == "__main__":
    asyncio.run(main())
