# AI Assist Layer

ESG 보고서 작성을 위한 AI 기능을 제공하는 모듈입니다.

## 📁 구조

```
ai_assits/
├── __init__.py
├── config.py                    # 설정
├── router.py                    # FastAPI 라우터
├── exceptions.py                # 예외 정의
├── models.py                    # DB 모델
│
├── core/                        # 핵심 컴포넌트
│   ├── embeddings.py           # ✅ E5 임베딩 (multilingual-e5-base)
│   ├── gemini_client.py        # ✅ Gemini API 클라이언트
│   ├── rate_limiter.py         # Rate limiting
│   ├── prompt_base.py          # 프롬프트 베이스
│   └── monitoring.py           # 모니터링
│
├── esg_mapping/                 # ESG 매핑 (RAG)
│   ├── service.py              # ✅ 매핑 서비스 로직
│   ├── schemas.py              # ✅ API 스키마
│   ├── prompts.py              # ✅ LLM 프롬프트
│   │
│   ├── data/                   # ESG 표준 데이터
│   │   ├── gri_2021.jsonl      # ✅ GRI 2021 (182 standards)
│   │   ├── sasb_2023.jsonl     # SASB 2023
│   │   ├── tcfd_2024.jsonl     # TCFD 2024
│   │   └── esrs_2024.jsonl     # ESRS 2024
│   │
│   ├── loaders/
│   │   └── jsonl_loader.py     # ✅ JSONL 스트림 로더
│   │
│   ├── vectorstore/
│   │   ├── chroma_manager.py   # ✅ ChromaDB 매니저
│   │   ├── embed_pipeline.py   # ✅ 임베딩 파이프라인
│   │   └── refresh_task.py     # ✅ 자동 갱신 시스템
│   │
│   └── utils/
│       ├── file_watcher.py     # 파일 변경 감지
│       └── validator.py        # JSONL 검증
│
├── summarize/                   # 텍스트 요약
│   ├── service.py
│   ├── prompts.py
│   └── schemas.py
│
└── rewrite/                     # 텍스트 재작성
    ├── service.py
    ├── prompts.py
    └── schemas.py
```

## 🚀 주요 기능

### 1. ESG 매핑 (RAG)

사용자가 작성한 텍스트를 분석하여 관련된 ESG 표준(GRI, SASB, TCFD, ESRS)을 자동으로 매핑합니다.

**프로세스:**
1. 사용자 텍스트를 E5 임베딩으로 벡터화
2. ChromaDB에서 유사한 ESG 표준 검색 (코사인 유사도)
3. Gemini LLM으로 후보들을 분석하고 신뢰도 평가
4. 최종 매칭 결과 반환

**API 엔드포인트:**
```
POST /api/v1/ai-assist/map-esg
```

### 2. 벡터스토어 자동 갱신

JSONL 파일 변경을 감지하여 자동으로 재임베딩합니다.

**주기적 체크:**
- 기본 1시간 간격으로 파일 해시 비교
- 변경된 파일만 선택적 재임베딩
- 파일 해시 캐싱으로 효율성 향상

**API 엔드포인트:**
```
POST /api/v1/ai-assist/refresh/start      # 자동 갱신 시작
POST /api/v1/ai-assist/refresh/stop       # 자동 갱신 중지
POST /api/v1/ai-assist/refresh/check-now  # 즉시 체크
GET  /api/v1/ai-assist/refresh/status     # 상태 조회
```

### 3. 텍스트 요약 (예정)

ESG 보고서 섹션을 간결하게 요약합니다.

### 4. 텍스트 재작성 (예정)

전문적인 톤으로 텍스트를 개선합니다.

## 🔧 기술 스택

| 컴포넌트 | 기술 | 버전 |
|---------|------|------|
| **LLM** | Google Gemini | 2.5 Flash |
| **임베딩** | HuggingFace E5 | multilingual-e5-base |
| **벡터 DB** | ChromaDB | 0.4.22 |
| **모델 로더** | Sentence Transformers | 2.3.1 |

## 📊 데이터 플로우

### ESG 매핑 플로우

```
사용자 텍스트
    │
    ▼
임베딩 변환 (E5)
    │
    ▼
벡터 검색 (ChromaDB)
    │
    ├─ 후보 1 (유사도: 0.85)
    ├─ 후보 2 (유사도: 0.78)
    └─ 후보 3 (유사도: 0.72)
    │
    ▼
LLM 분석 (Gemini)
    │
    ├─ GRI 305-1 (신뢰도: 0.92)
    ├─ GRI 305-2 (신뢰도: 0.68)
    └─ 이유 설명 생성
    │
    ▼
응답 반환
```

### 임베딩 파이프라인 플로우

```
JSONL 파일
    │
    ▼
스트림 로드 (JSONLLoader)
    │
    ▼
텍스트 생성 (to_text)
    │
    ▼
배치 임베딩 (E5Embeddings)
    │
    ▼
ChromaDB 저장 (upsert)
    │
    ▼
영구 저장 완료
```

## 🎯 성능 지표

### 임베딩 속도

- **CPU**: ~50 docs/sec (batch_size=32)
- **GPU (CUDA)**: ~200 docs/sec (batch_size=32)

### ESG 매핑 지연시간

- 벡터 검색: ~50ms
- LLM 분석: ~1-2초
- **전체**: ~1.5-2.5초

### 메모리 사용량

- E5 모델: ~1GB RAM
- ChromaDB: ~100MB (182 documents)
- **Total**: ~1.5GB

## 🔐 보안 고려사항

1. **API 키 관리**: 환경변수로 안전하게 관리
2. **Rate Limiting**: Gemini API 무료 티어 제한 준수 (15 RPM)
3. **입력 검증**: 텍스트 길이 제한 (10,000자)
4. **에러 핸들링**: LLM 실패 시 벡터 유사도로 폴백

## 📈 확장 계획

- [ ] **Phase 2**: SASB, TCFD, ESRS 데이터 추가
- [ ] **Phase 3**: pgvector 마이그레이션 (PostgreSQL 통합)
- [ ] **Phase 4**: Fine-tuning된 임베딩 모델
- [ ] **Phase 5**: Multi-modal 지원 (이미지, 표)

## 🐛 알려진 이슈

1. **임베딩 로드 시간**: 초기 모델 다운로드 ~1분 소요
2. **ChromaDB 버전**: 0.4.x는 일부 메타데이터 길이 제한 있음
3. **Gemini JSON 파싱**: 가끔 마크다운 포맷 포함 (자동 처리됨)

## 📞 문의

- 기술 문의: 개발팀
- 버그 리포트: GitHub Issues

