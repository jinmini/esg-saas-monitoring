"""
ESG 보고서 템플릿 시드 데이터 생성 스크립트
"""
import asyncio
import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import AsyncSessionLocal
from src.documents.models import Document, Chapter, Section
from datetime import datetime


async def create_esg_template():
    """E/S/G 템플릿 생성"""
    async with AsyncSessionLocal() as db:
        # 기존 템플릿 확인
        print("Checking existing templates...")
        
        # 템플릿 생성
        template = Document(
            user_id=None,  # 공용 템플릿
            title="ESG 통합 보고서 템플릿",
            description="환경(E), 사회(S), 거버넌스(G) 3대 축 기반 ESG 보고서 표준 템플릿",
            is_public=True,
            is_template=True
        )
        
        print("Creating template...")
        
        # Chapter 1: 환경 (Environmental)
        chapter_env = Chapter(
            title="환경 (Environmental)",
            order=1,
            is_collapsed=False
        )
        
        chapter_env.sections = [
            Section(
                title="기후변화 대응",
                content="<h2>기후변화 대응</h2><p><strong>온실가스 배출 현황</strong></p><p>• 직접 배출(Scope 1): [데이터 입력]</p><p>• 간접 배출(Scope 2): [데이터 입력]</p><p>• 기타 간접 배출(Scope 3): [데이터 입력]</p><p><strong>탄소중립 목표 및 전략</strong></p><p>[기업의 탄소중립 목표와 이행 전략을 입력하세요...]</p>",
                order=1
            ),
            Section(
                title="에너지 관리",
                content="<h2>에너지 관리</h2><p><strong>에너지 사용량</strong></p><p>• 총 에너지 사용량: [데이터 입력] MWh</p><p>• 재생에너지 비율: [데이터 입력]%</p><p><strong>에너지 효율화 활동</strong></p><ul><li>LED 조명 교체</li><li>고효율 설비 도입</li><li>에너지 관리 시스템 구축</li></ul>",
                order=2
            ),
            Section(
                title="자원 순환",
                content="<h2>자원 순환</h2><p><strong>폐기물 관리</strong></p><p>• 총 폐기물 발생량: [데이터 입력] 톤</p><p>• 재활용률: [데이터 입력]%</p><p><strong>순환경제 활동</strong></p><p>[제품 수명 연장, 재활용 프로그램 등을 입력하세요...]</p>",
                order=3
            ),
            Section(
                title="수자원 관리",
                content="<h2>수자원 관리</h2><p><strong>용수 사용량</strong></p><p>• 취수량: [데이터 입력] m³</p><p>• 재사용률: [데이터 입력]%</p><p><strong>수질 오염 방지 활동</strong></p><p>[수질 모니터링 및 관리 활동을 입력하세요...]</p>",
                order=4
            )
        ]
        
        # Chapter 2: 사회 (Social)
        chapter_social = Chapter(
            title="사회 (Social)",
            order=2,
            is_collapsed=False
        )
        
        chapter_social.sections = [
            Section(
                title="인권 및 노동",
                content="<h2>인권 및 노동</h2><p><strong>인권 정책</strong></p><p>[기업의 인권 정책 및 준수 현황을 입력하세요...]</p><p><strong>근로 환경</strong></p><ul><li>주 52시간 근무제 준수</li><li>연차 사용률: [데이터 입력]%</li><li>육아휴직 사용 현황</li></ul>",
                order=1
            ),
            Section(
                title="다양성 및 포용",
                content="<h2>다양성 및 포용</h2><p><strong>직원 다양성 현황</strong></p><p>• 여성 임직원 비율: [데이터 입력]%</p><p>• 여성 관리자 비율: [데이터 입력]%</p><p>• 장애인 고용률: [데이터 입력]%</p><p><strong>포용적 문화 조성 활동</strong></p><p>[다양성 교육, 포용 프로그램 등을 입력하세요...]</p>",
                order=2
            ),
            Section(
                title="지역사회 공헌",
                content="<h2>지역사회 공헌</h2><p><strong>사회공헌 활동</strong></p><p>• 사회공헌 지출액: [데이터 입력] 원</p><p>• 임직원 봉사활동 시간: [데이터 입력] 시간</p><p><strong>주요 활동 사례</strong></p><ul><li>취약계층 지원 프로그램</li><li>지역사회 협력 사업</li><li>재능기부 활동</li></ul>",
                order=3
            ),
            Section(
                title="산업안전보건",
                content="<h2>산업안전보건</h2><p><strong>안전 관리 체계</strong></p><p>[안전보건경영시스템 운영 현황을 입력하세요...]</p><p><strong>재해 현황</strong></p><p>• 재해율: [데이터 입력]</p><p>• 중대재해 발생 건수: [데이터 입력]건</p>",
                order=4
            )
        ]
        
        # Chapter 3: 거버넌스 (Governance)
        chapter_gov = Chapter(
            title="거버넌스 (Governance)",
            order=3,
            is_collapsed=False
        )
        
        chapter_gov.sections = [
            Section(
                title="이사회 구조",
                content="<h2>이사회 구조</h2><p><strong>이사회 구성</strong></p><p>• 이사 수: [데이터 입력]명 (사내이사 [X]명, 사외이사 [X]명)</p><p>• 사외이사 비율: [데이터 입력]%</p><p>• 여성 이사 비율: [데이터 입력]%</p><p><strong>이사회 운영</strong></p><p>• 이사회 개최 횟수: [데이터 입력]회</p><p>• 이사회 출석률: [데이터 입력]%</p>",
                order=1
            ),
            Section(
                title="윤리 경영",
                content="<h2>윤리 경영</h2><p><strong>윤리강령</strong></p><p>[기업의 윤리강령 주요 내용을 입력하세요...]</p><p><strong>준법경영 체계</strong></p><ul><li>내부신고 제도 운영</li><li>윤리교육 실시</li><li>이해관계자 신고 채널</li></ul><p><strong>부패방지 활동</strong></p><p>[부패방지 정책 및 활동을 입력하세요...]</p>",
                order=2
            ),
            Section(
                title="리스크 관리",
                content="<h2>리스크 관리</h2><p><strong>리스크 관리 체계</strong></p><p>[리스크 식별, 평가, 대응 프로세스를 입력하세요...]</p><p><strong>내부통제 시스템</strong></p><p>[내부통제 활동 및 모니터링 체계를 입력하세요...]</p><p><strong>ESG 리스크 관리</strong></p><p>[ESG 리스크 대응 전략을 입력하세요...]</p>",
                order=3
            ),
            Section(
                title="정보보안",
                content="<h2>정보보안</h2><p><strong>정보보호 체계</strong></p><p>• 정보보호 인증: [ISO 27001 등 인증 현황]</p><p>• 개인정보 보호 정책</p><p><strong>사이버 보안 활동</strong></p><ul><li>보안 모니터링</li><li>정기 보안 점검</li><li>임직원 보안 교육</li></ul>",
                order=4
            )
        ]
        
        template.chapters = [chapter_env, chapter_social, chapter_gov]
        
        # DB에 저장
        db.add(template)
        await db.commit()
        await db.refresh(template)
        
        print(f"ESG template created successfully! (ID: {template.id})")
        print(f"   - Chapters: {len(template.chapters)}")
        print(f"   - Total sections: {sum(len(ch.sections) for ch in template.chapters)}")
        
        return template


async def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("ESG Template Seed Data Creation")
    print("=" * 60)
    
    try:
        template = await create_esg_template()
        print("\n" + "=" * 60)
        print("Seed data creation complete!")
        print("=" * 60)
        print(f"\nTemplate ID: {template.id}")
        print(f"URL: http://localhost:8000/api/v1/documents/{template.id}")
        print("\nCheck in Swagger UI:")
        print("http://localhost:8000/docs#/Documents/get_document_api_v1_documents__document_id__get")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

