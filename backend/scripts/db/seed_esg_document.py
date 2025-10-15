"""
ESG 보고서 템플릿 Seed 데이터 생성
프론트엔드 mockData.ts와 동일한 구조
"""
import asyncio
import sys
import os

# 경로 설정
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.core.config import settings
from src.documents.service import DocumentService
from src.documents.schemas import (
    DocumentCreate, SectionCreate, BlockNode, InlineNode, 
    SectionMetadata, GRIReference, BlockAttributes
)


# 샘플 문서 데이터 (프론트엔드와 100% 일치)
def create_sample_document() -> DocumentCreate:
    return DocumentCreate(
        title="2024년 지속가능경영 보고서",
        description="ESG 보고서 템플릿 - 프론트엔드 연동 테스트용",
        is_template=True,
        is_public=True,
        sections=[
            # 섹션 1: 회사 개요
            SectionCreate(
                title="1. 회사 개요",
                description="기업의 기본 정보와 사업 영역을 소개합니다.",
                order=0,
                blocks=[
                    BlockNode(
                        id="block-001",
                        blockType="heading",
                        attributes=BlockAttributes(level=2, align="left"),
                        content=[
                            InlineNode(id="inline-001", type="inline", text="1.1 사업 영역", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-002",
                        blockType="paragraph",
                        attributes=BlockAttributes(align="left"),
                        content=[
                            InlineNode(id="inline-002", type="inline", text="우리 회사는 ", marks=[]),
                            InlineNode(id="inline-003", type="inline", text="지속가능한 에너지 솔루션", marks=["bold"]),
                            InlineNode(id="inline-004", type="inline", text="을 제공하는 글로벌 선도 기업입니다. 주요 사업 영역은 다음과 같습니다:", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-003",
                        blockType="list",
                        attributes=BlockAttributes(listType="unordered", level=1),
                        children=[
                            {"id": "list-001", "content": [InlineNode(id="inline-005", type="inline", text="태양광 발전 시스템 제조 및 설치", marks=[])]},
                            {"id": "list-002", "content": [InlineNode(id="inline-006", type="inline", text="ESS(에너지 저장 시스템) 개발", marks=[])]},
                            {"id": "list-003", "content": [InlineNode(id="inline-007", type="inline", text="스마트 그리드 솔루션 제공", marks=[])]}
                        ]
                    )
                ],
                griReference=[
                    GRIReference(code=["GRI 102-1", "GRI 102-2"], framework="GRI")
                ],
                metadata=SectionMetadata(
                    category="General",
                    status="approved",
                    owner="ESG팀"
                )
            ),
            
            # 섹션 2: 환경 (Environmental)
            SectionCreate(
                title="2. 환경 (Environmental)",
                description="환경 관련 성과와 목표를 담고 있습니다.",
                order=1,
                blocks=[
                    BlockNode(
                        id="block-006",
                        blockType="heading",
                        attributes=BlockAttributes(level=2, align="left"),
                        content=[
                            InlineNode(id="inline-008", type="inline", text="2.1 온실가스 배출 관리", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-007",
                        blockType="paragraph",
                        attributes=BlockAttributes(align="left"),
                        content=[
                            InlineNode(id="inline-009", type="inline", text="2024년 당사는 ", marks=[]),
                            InlineNode(id="inline-010", type="inline", text="Scope 1, 2 온실가스 배출량을 전년 대비 15% 감축", marks=["bold", "highlight"]),
                            InlineNode(id="inline-011", type="inline", text="하는 성과를 달성했습니다. 이는 다음과 같은 노력의 결과입니다:", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-008",
                        blockType="quote",
                        attributes=BlockAttributes(align="left"),
                        content=[
                            InlineNode(id="inline-012", type="inline", text="탄소중립은 선택이 아닌 필수입니다. 우리는 2030년까지 RE100을 달성하겠습니다.", marks=["italic"])
                        ]
                    ),
                    BlockNode(
                        id="block-009",
                        blockType="paragraph",
                        attributes=BlockAttributes(align="right"),
                        content=[
                            InlineNode(id="inline-013", type="inline", text="- 김철수 대표이사", marks=[])
                        ]
                    )
                ],
                griReference=[
                    GRIReference(code=["GRI 305-1", "GRI 305-2"], framework="GRI"),
                    GRIReference(code=["GRI 306-1"], framework="GRI")
                ],
                metadata=SectionMetadata(
                    category="E",
                    status="in_review",
                    owner="환경안전팀"
                )
            ),
            
            # 섹션 3: 사회 (Social)
            SectionCreate(
                title="3. 사회 (Social)",
                description="임직원, 지역사회와의 관계 및 사회공헌 활동",
                order=2,
                blocks=[
                    BlockNode(
                        id="block-010",
                        blockType="heading",
                        attributes=BlockAttributes(level=2, align="left"),
                        content=[
                            InlineNode(id="inline-014", type="inline", text="3.1 인재 개발 및 교육", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-011",
                        blockType="paragraph",
                        attributes=BlockAttributes(align="left"),
                        content=[
                            InlineNode(id="inline-015", type="inline", text="임직원 1인당 평균 ", marks=[]),
                            InlineNode(id="inline-016", type="inline", text="연 40시간의 교육", marks=["bold"]),
                            InlineNode(id="inline-017", type="inline", text="을 제공하며, 리더십 개발 프로그램, 기술 역량 강화 워크숍 등 다양한 교육 기회를 마련하고 있습니다.", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-012",
                        blockType="heading",
                        attributes=BlockAttributes(level=2, align="left"),
                        content=[
                            InlineNode(id="inline-018", type="inline", text="3.2 지역사회 공헌", marks=[])
                        ]
                    ),
                    BlockNode(
                        id="block-013",
                        blockType="paragraph",
                        attributes=BlockAttributes(align="left"),
                        content=[
                            InlineNode(id="inline-019", type="inline", text="연간 매출의 ", marks=[]),
                            InlineNode(id="inline-020", type="inline", text="1%를 사회공헌 활동에 투자", marks=["bold", "underline"]),
                            InlineNode(id="inline-021", type="inline", text="하며, 취약계층 에너지 지원, 청소년 환경교육 등을 진행하고 있습니다.", marks=[])
                        ]
                    )
                ],
                griReference=[
                    GRIReference(code=["GRI 401-1", "GRI 404-1"], framework="GRI")
                ],
                metadata=SectionMetadata(
                    category="S",
                    status="draft",
                    owner="인사팀"
                )
            )
        ]
    )


async def seed_document():
    """샘플 문서 생성"""
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        service = DocumentService(session)
        sample_doc = create_sample_document()
        
        try:
            document = await service.create_document(user_id=None, data=sample_doc)
            print("[OK] ESG 템플릿 문서 생성 완료!")
            print(f"   - ID: {document.id}")
            print(f"   - 제목: {document.title}")
            print(f"   - 섹션 수: {len(document.sections)}")
            
            for section in document.sections:
                blocks_count = len(section.blocks) if isinstance(section.blocks, list) else 0
                print(f"     * {section.title} (블록 수: {blocks_count})")
            
            print(f"\n[API] 테스트:")
            print(f"   GET http://localhost:8000/api/v1/documents/{document.id}")
            
        except Exception as e:
            print(f"[ERROR] 오류 발생: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    print("[START] ESG 보고서 템플릿 생성 시작...\n")
    asyncio.run(seed_document())

