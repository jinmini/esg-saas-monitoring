# ESG 보고서 윤문 기능 PRD (RAG 기반)

**버전:** 1.0  
**작성일:** 2025-09-30  
**대상 스프린트:** Sprint 7  
**예상 기간:** 1주 (7일)  
**일일 작업 시간:** 8시간 (주말 포함)

---

## 📋 목차

1. [개요](#1-개요)
2. [기능 요구사항](#2-기능-요구사항)
3. [기술 스펙](#3-기술-스펙)
4. [개발 계획](#4-개발-계획)
5. [품질 보증](#5-품질-보증)
6. [부록](#6-부록)

---

## 1. 개요

### 1.1 프로젝트 배경

현재 ESG SIP(SaaS Intelligence Platform)는 18개 기업의 뉴스를 수집하고 트렌드를 분석하는 기능을 제공합니다. 이번 Sprint 7에서는 **ESG 지속가능경영보고서 윤문(Polishing) 기능**을 추가하여, ESG 담당자가 보고서 작성 시 AI의 도움을 받아 전문성과 품질을 높일 수 있도록 합니다.

### 1.2 핵심 가치 제안

- **시간 절약**: 수작업 윤문 3시간 → AI 자동 윤문 2분
- **품질 향상**: GRI Standards 기준 준수도 80% → 90%
- **도메인 특화**: RAG 기반으로 ESG 전문 지식 통합
- **실무 활용**: Account Manager와 Product Manager가 즉시 사용 가능

### 1.3 성공 지표 (Sprint 7 종료 시)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 윤문 정확도 | 80% 이상 | 10개 샘플 테스트 케이스 통과율 |
| 응답 속도 | 3초 이내 | API 평균 응답 시간 |
| RAG 검색 정확도 | 상위 3개 문서 관련성 70% | 수동 검증 |
| UI/UX 완성도 | Before/After 비교 가능 | 기능 동작 확인 |

### 1.4 Out of Scope (이번 스프린트 제외)

- ❌ PDF/DOCX 파일 업로드 기능
- ❌ 다국어 번역 (한↔영)
- ❌ 협업 기능 (댓글, 버전 관리)
- ❌ PDF 다운로드 기능
- ❌ 템플릿 기반 보고서 자동 생성

---

## 2. 기능 요구사항

### 2.1 RAG 인프라 구축

#### **Task 1: 지식 베이스 수집 및 전처리**

**목표:** ESG 관련 공개 문서를 수집하고 RAG에 적합한 형태로 가공

**상세 작업:**

1. **문서 수집 (6-8개)**
   - GRI Standards 2021 (PDF, 공식 사이트)
   - 환경부 K-ESG 가이드라인 (PDF)
   - TCFD 권고안 (영문 → 한글 요약본 사용)
   - 우수 ESG 보고서 5개:
     - 삼성전자 지속가능경영보고서 2023
     - SK하이닉스 ESG 리포트 2023
     - 네이버 ESG 리포트 2023
     - LG화학 지속가능경영보고서 2023
     - 현대자동차 지속가능성 보고서 2023

2. **PDF → 텍스트 변환**
   ```python
   # 라이브러리: PyPDF2 또는 pdfplumber
   # 출력: 각 문서당 .txt 파일
   ```

3. **텍스트 전처리**
   - 불필요한 헤더/푸터 제거
   - 페이지 번호 제거
   - 표/그래프 설명 정리
   - 한글 인코딩 확인 (UTF-8)

4. **메타데이터 추가**
   ```json
   {
     "source": "GRI Standards 2021",
     "type": "standard",
     "section": "GRI 305 (Emissions)",
     "language": "ko"
   }
   ```

**완료 기준:**
- [ ] 6-8개 문서 수집 완료
- [ ] 텍스트 변환 스크립트 작성 (`scripts/convert_pdfs.py`)
- [ ] 전처리된 텍스트 파일 저장 (`data/knowledge_base/`)
- [ ] 메타데이터 JSON 파일 생성

**예상 시간:** 8시간 (Day 1)

---

#### **Task 2: 임베딩 및 벡터 DB 구축**

**목표:** 텍스트를 벡터로 변환하고 FAISS 벡터 스토어 생성

**상세 작업:**

1. **텍스트 청킹 (Chunking)**
   ```python
   # LangChain RecursiveCharacterTextSplitter 사용
   chunk_size = 1000  # 토큰 단위
   chunk_overlap = 200  # 컨텍스트 유지
   ```

2. **임베딩 모델 다운로드**
   ```python
   # HuggingFace: jhgan/ko-sroberta-multitask
   # 모델 크기: ~400MB
   # 로컬 캐싱: ~/.cache/huggingface/
   ```

3. **벡터 임베딩 생성**
   - 각 청크를 768차원 벡터로 변환
   - 배치 처리 (메모리 효율)

4. **FAISS 인덱스 생성**
   ```python
   # FAISS IndexFlatL2 사용
   # 인덱스 저장: data/vectorstore/faiss_index
   # 메타데이터 저장: data/vectorstore/metadata.pkl
   ```

5. **검색 테스트**
   - 샘플 쿼리 10개로 검색 품질 확인
   - Top-K (k=3) 관련성 수동 검증

**완료 기준:**
- [ ] 청킹 스크립트 작성 (`backend/src/reports/rag/chunking.py`)
- [ ] 임베딩 생성 스크립트 (`backend/src/reports/rag/embeddings.py`)
- [ ] FAISS 인덱스 파일 생성 (~500MB)
- [ ] 검색 테스트 통과 (10개 쿼리 중 7개 이상 적합)

**예상 시간:** 10시간 (Day 2 전체)

---

#### **Task 3: RAG 파이프라인 통합**

**목표:** 벡터 검색 + LLM 호출을 연결하는 RAG 체인 구현

**상세 작업:**

1. **Retriever 구현**
   ```python
   # backend/src/reports/rag/retriever.py
   class FAISSRetriever:
       def __init__(self, index_path: str):
           # FAISS 인덱스 로드
           
       async def search(self, query: str, k: int = 3) -> List[Document]:
           # 유사도 검색
           # 메타데이터와 함께 반환
   ```

2. **LLM 통합 (Gemini 1.5 Flash)**
   ```python
   # backend/src/reports/rag/llm.py
   from langchain_google_genai import ChatGoogleGenerativeAI
   
   llm = ChatGoogleGenerativeAI(
       model="gemini-1.5-flash",
       temperature=0.1,
       google_api_key=settings.GEMINI_API_KEY
   )
   ```

3. **RAG 체인 구성**
   ```python
   # backend/src/reports/rag/chain.py
   from langchain.chains import RetrievalQA
   
   qa_chain = RetrievalQA.from_chain_type(
       llm=llm,
       chain_type="stuff",
       retriever=retriever.as_retriever(search_kwargs={"k": 3})
   )
   ```

4. **프롬프트 템플릿 설계**
   ```python
   # backend/src/reports/prompts.py
   POLISH_PROMPT = """
   당신은 GRI Standards 전문가입니다.
   
   참고 자료:
   {context}
   
   다음 텍스트를 ESG 보고서 기준에 맞게 개선하세요:
   {text}
   
   개선 사항:
   1. 정량 지표 추가 (구체적 수치)
   2. GRI 표준 용어 사용
   3. 이해관계자 관점 포함
   4. 전년 대비 비교 데이터 제안
   
   JSON 형식으로 답변:
   {{
       "polished_text": "개선된 텍스트",
       "changes_made": ["변경사항 1", "변경사항 2"],
       "gri_standards": ["GRI 305-1", "GRI 305-2"],
       "suggestions": ["추가 개선 제안"]
   }}
   """
   ```

**완료 기준:**
- [ ] Retriever 클래스 구현 및 테스트
- [ ] LLM 통합 및 API 키 설정
- [ ] RAG 체인 동작 확인
- [ ] 프롬프트 템플릿 3개 작성 (환경/사회/거버넌스)

**예상 시간:** 10시간 (Day 3 전체)

---

### 2.2 백엔드 API 개발

#### **Task 4: `reports` 도메인 생성**

**목표:** 보고서 관련 도메인 구조 생성

**디렉토리 구조:**
```
backend/src/reports/
├── __init__.py
├── models.py              # SQLAlchemy 모델
├── schemas.py             # Pydantic 스키마
├── service.py             # 비즈니스 로직
├── router.py              # API 엔드포인트
├── dependencies.py        # DI 의존성
├── exceptions.py          # 커스텀 예외
├── prompts.py             # 프롬프트 템플릿
├── rag/
│   ├── __init__.py
│   ├── embeddings.py      # 임베딩 생성
│   ├── vectorstore.py     # FAISS 관리
│   ├── retriever.py       # 검색 로직
│   ├── chain.py           # RAG 체인
│   └── config.py          # RAG 설정
└── utils.py               # 유틸리티
```

**모델 설계 (models.py):**
```python
class Report(Base):
    __tablename__ = "reports"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    section_type: Mapped[str] = mapped_column(String(50))  # E/S/G
    original_text: Mapped[str] = mapped_column(Text)
    polished_text: Mapped[str] = mapped_column(Text, nullable=True)
    quality_score: Mapped[float] = mapped_column(Float, nullable=True)
    changes_summary: Mapped[dict] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
```

**스키마 설계 (schemas.py):**
```python
class PolishRequest(BaseModel):
    text: str = Field(..., min_length=50, max_length=10000)
    section_type: Literal["environmental", "social", "governance"]
    
class PolishResponse(BaseModel):
    polished_text: str
    changes_made: List[str]
    gri_standards: List[str]
    suggestions: List[str]
    quality_score: float
```

**완료 기준:**
- [ ] 디렉토리 구조 생성
- [ ] models.py 작성 및 마이그레이션
- [ ] schemas.py 작성 (5개 이상 스키마)
- [ ] 기본 예외 클래스 정의

**예상 시간:** 4시간 (Day 4 오전)

---

#### **Task 5: 윤문 API 엔드포인트**

**목표:** `/api/reports/polish` POST 엔드포인트 구현

**API 스펙:**

**요청:**
```http
POST /api/reports/polish
Content-Type: application/json
Authorization: Bearer 

{
  "text": "우리 회사는 탄소를 줄이려고 노력하고 있습니다.",
  "section_type": "environmental"
}
```

**응답:**
```json
{
  "polished_text": "당사는 2024년 기준 Scope 1+2 온실가스 배출량을 전년 대비 15% 감축하였으며, 2030년까지 탄소중립을 달성하기 위해 재생에너지 전환율을 현재 30%에서 80%로 확대할 계획입니다.",
  "changes_made": [
    "모호한 표현 '탄소를 줄임' → 구체적 수치 '15% 감축'",
    "목표 연도 추가 '2030년'",
    "정량 지표 추가 'Scope 1+2 배출량'"
  ],
  "gri_standards": ["GRI 305-1", "GRI 305-2"],
  "suggestions": [
    "Scope 3 배출량 데이터 추가 권장",
    "재생에너지 전환 로드맵 상세화 필요"
  ],
  "quality_score": 85.5
}
```

**서비스 로직 (service.py):**
```python
class ReportService:
    def __init__(self, rag_chain, db: AsyncSession):
        self.rag_chain = rag_chain
        self.db = db
    
    async def polish_text(
        self, 
        text: str, 
        section_type: str,
        user_id: int
    ) -> PolishResponse:
        # 1. RAG 검색
        relevant_docs = await self.rag_chain.retrieve(text)
        
        # 2. 프롬프트 구성
        prompt = self._build_prompt(text, section_type, relevant_docs)
        
        # 3. LLM 호출
        result = await self.rag_chain.invoke(prompt)
        
        # 4. 결과 파싱
        parsed = self._parse_llm_response(result)
        
        # 5. DB 저장
        report = Report(
            user_id=user_id,
            section_type=section_type,
            original_text=text,
            polished_text=parsed['polished_text'],
            quality_score=parsed['quality_score'],
            changes_summary=parsed
        )
        self.db.add(report)
        await self.db.commit()
        
        return PolishResponse(**parsed)
```

**완료 기준:**
- [ ] POST /api/reports/polish 구현
- [ ] 에러 핸들링 (400, 401, 500)
- [ ] 로깅 추가 (요청/응답 기록)
- [ ] Postman 테스트 통과

**예상 시간:** 6시간 (Day 4 오후)

---

#### **Task 6: 품질 평가 API**

**목표:** `/api/reports/score` POST 엔드포인트 구현

**API 스펙:**

**요청:**
```http
POST /api/reports/score
Content-Type: application/json

{
  "text": "당사는 2024년 Scope 1+2 배출량 15% 감축...",
  "section_type": "environmental"
}
```

**응답:**
```json
{
  "total_score": 85.5,
  "dimension_scores": {
    "completeness": 18,      // 완전성 (0-20점)
    "accuracy": 17,          // 정확성 (0-20점)
    "balance": 16,           // 균형성 (0-20점)
    "clarity": 17,           // 명확성 (0-20점)
    "comparability": 17.5    // 비교가능성 (0-20점)
  },
  "strengths": [
    "정량 지표가 명확함",
    "목표 연도가 구체적"
  ],
  "improvements": [
    "전년 대비 비교 데이터 부족",
    "이해관계자 영향 언급 없음"
  ],
  "gri_compliance": 75.0  // GRI 준수도 (%)
}
```

**평가 로직:**
```python
async def calculate_quality_score(self, text: str, section_type: str) -> dict:
    prompt = f"""
    다음 ESG 보고서 텍스트의 품질을 평가하세요.
    
    텍스트: {text}
    섹션: {section_type}
    
    평가 기준 (각 0-20점):
    1. 완전성: 필수 정보 포함 여부
    2. 정확성: 정량 데이터의 정확성
    3. 균형성: 긍정/부정 모두 언급
    4. 명확성: 이해하기 쉬운 문장
    5. 비교가능성: 전년 대비 데이터
    
    JSON 형식으로 답변하세요.
    """
    
    result = await self.rag_chain.invoke(prompt)
    return self._parse_score_response(result)
```

**완료 기준:**
- [ ] POST /api/reports/score 구현
- [ ] 5개 차원 평가 로직
- [ ] 개선 제안 자동 생성
- [ ] 10개 샘플 테스트 통과

**예상 시간:** 4시간 (Day 5 오전)

---

#### **Task 7: 프롬프트 템플릿 관리**

**목표:** 섹션별 최적화된 프롬프트 템플릿 작성 및 관리

**프롬프트 파일 구조 (prompts.py):**
```python
SECTION_PROMPTS = {
    "environmental": """
    당신은 TCFD 전문가입니다.
    
    참고 자료:
    {context}
    
    다음 환경(E) 섹션을 개선하세요:
    {text}
    
    필수 포함 사항:
    1. Scope 1, 2, 3 배출량 구분
    2. 탄소중립 목표 연도 (예: 2050년)
    3. 재생에너지 전환율 (%)
    4. 전년 대비 증감률
    5. GRI 305 (배출) 지표 매핑
    
    출력 형식: JSON
    """,
    
    "social": """
    당신은 GRI 400 시리즈 (사회) 전문가입니다.
    
    참고 자료:
    {context}
    
    다음 사회(S) 섹션을 개선하세요:
    {text}
    
    필수 포함 사항:
    1. 임직원 다양성 지표 (여성 비율, %)
    2. 장애인 고용률 (법정 의무 대비)
    3. 교육 시간 (1인당 평균)
    4. 산업재해율
    5. GRI 401, 404, 405 지표 매핑
    
    출력 형식: JSON
    """,
    
    "governance": """
    당신은 기업 거버넌스 전문가입니다.
    
    참고 자료:
    {context}
    
    다음 거버넌스(G) 섹션을 개선하세요:
    {text}
    
    필수 포함 사항:
    1. 이사회 구성 (독립이사 비율)
    2. ESG 위원회 활동 (연간 회의 횟수)
    3. 내부 고발 제도 운영
    4. 윤리 교육 이수율
    5. GRI 205, 206 지표 매핑
    
    출력 형식: JSON
    """
}

QUALITY_SCORING_PROMPT = """
다음 텍스트의 품질을 평가하세요.

참고 자료 (우수 사례):
{context}

평가 대상:
{text}

섹션: {section_type}

평가 기준 (각 0-20점):
1. 완전성 (Completeness): 필수 정보 포함 여부
   - GRI 필수 지표 포함
   - 목표와 실적 모두 언급
   
2. 정확성 (Accuracy): 정량 데이터의 정확성
   - 수치의 구체성
   - 단위 명시
   
3. 균형성 (Balance): 긍정/부정 모두 언급
   - 성과와 한계 동시 서술
   - 개선 계획 포함
   
4. 명확성 (Clarity): 이해하기 쉬운 문장
   - 전문 용어 설명
   - 문장 길이 적절
   
5. 비교가능성 (Comparability): 전년 대비 데이터
   - 시계열 데이터
   - 동종 업계 벤치마크

JSON 형식으로 답변:
{
    "total_score": 85.5,
    "dimension_scores": {...},
    "strengths": [...],
    "improvements": [...],
    "gri_compliance": 75.0
}
"""
```

**프롬프트 테스트 케이스 (10개):**
```python
TEST_CASES = [
    {
        "id": "env_001",
        "text": "우리 회사는 탄소를 줄이고 있습니다.",
        "section": "environmental",
        "expected_improvements": [
            "정량 지표 추가",
            "목표 연도 명시",
            "Scope 구분"
        ]
    },
    # ... 9개 더
]
```

**완료 기준:**
- [ ] 3개 섹션별 프롬프트 작성
- [ ] 품질 평가 프롬프트 작성
- [ ] 10개 테스트 케이스로 검증
- [ ] Few-shot 예시 3개 추가

**예상 시간:** 4시간 (Day 5 오후)

---

### 2.3 프론트엔드 UI 개발

#### **Task 8: 보고서 에디터 페이지**

**목표:** `/app/reports/polish` 페이지 생성

**페이지 구조:**
```
/app/reports/
├── layout.tsx           # 보고서 레이아웃
├── polish/
│   ├── page.tsx         # 메인 페이지
│   └── loading.tsx      # 로딩 상태
```

**UI 구성:**
```tsx
// app/reports/polish/page.tsx
export default function ReportPolishPage() {
  return (
    
      ESG 보고서 윤문
      
      {/* 섹션 선택 */}
      
      
      {/* 텍스트 입력 에디터 */}
      
      
      {/* 윤문 버튼 */}
      
      
      {/* Before/After 비교 */}
      
      
      {/* 품질 점수 */}
      
    
  );
}
```

**섹션 선택 컴포넌트:**
```tsx
// components/reports/SectionSelector.tsx
const sections = [
  { value: 'environmental', label: '환경 (E)', icon: '🌍' },
  { value: 'social', label: '사회 (S)', icon: '👥' },
  { value: 'governance', label: '거버넌스 (G)', icon: '⚖️' }
];

export function SectionSelector() {
  const [selected, setSelected] = useState('environmental');
  
  return (
    
      {sections.map(section => (
        <button
          key={section.value}
          onClick={() => setSelected(section.value)}
          className={cn(
            "px-6 py-3 rounded-lg",
            selected === section.value && "bg-primary text-white"
          )}
        >
          {section.icon} {section.label}
        
      ))}
    
  );
}
```

**텍스트 에디터:**
```tsx
// components/reports/TextEditor.tsx
export function TextEditor() {
  const [text, setText] = useState('');
  
  return (
    
      
        원본 텍스트 입력
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-48 p-4 border rounded-lg"
        placeholder="ESG 보고서 텍스트를 입력하세요..."
      />
      
        {text.length} / 10,000 자
      
    
  );
}
```

**완료 기준:**
- [ ] 페이지 라우팅 설정
- [ ] 섹션 선택 UI
- [ ] 텍스트 입력 에디터
- [ ] 반응형 디자인 (모바일 대응)

**예상 시간:** 6시간 (Day 6 오전~오후)

---

#### **Task 9: Before/After 비교 컴포넌트**

**목표:** 원본과 개선된 텍스트를 비교하는 UI

**컴포넌트 구현:**
```tsx
// components/reports/ComparisonView.tsx
import { diffWords } from 'diff';

interface ComparisonViewProps {
  original: string;
  polished: string;
  changes: string[];
}

export function ComparisonView({ original, polished, changes }: ComparisonViewProps) {
  const diff = diffWords(original, polished);
  
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      {/* 원본 */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📄 원본</h3>
        <div className="prose">{original}</div>
      </div>
      
      {/* 개선됨 */}
      <div className="border rounded-lg p-6 bg-green-50">
        <h3 className="text-lg font-semibold mb-4">✨ 개선됨</h3>
        <div className="prose">
          {diff.map((part, i) => (
            <span
              key={i}
              className={cn(
                part.added && "bg-green-200 font-medium",
                part.removed && "bg-red-200 line-through"
              )}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
      
      {/* 변경 사항 요약 */}
      <div className="col-span-2 