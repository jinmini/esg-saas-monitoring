# 🤖 AI Assist API 명세

## 개요

ESG 보고서 작성을 위한 AI 기능 API

**Base URL:** `/api/v1/ai-assist`

---

## 📊 1. ESG 프레임워크 매핑

### Endpoint
```
POST /api/v1/ai-assist/map-esg
```

### 용도
블록 또는 문서의 텍스트를 분석하여 관련 ESG 표준(GRI, SASB, TCFD, ESRS)을 매핑합니다.

### Request

#### Headers
```
Content-Type: application/json
Authorization: Bearer <token>  # 향후 추가
```

#### Body
```typescript
interface ESGMappingRequest {
  // 필수
  text: string;              // 분석할 텍스트 (10-10000자)
  document_id: number;       // 문서 ID
  
  // 선택
  section_id?: number;       // 섹션 ID
  block_id?: string;         // 블록 ID (프론트엔드 UUID)
  frameworks?: string[];     // 검색할 프레임워크 ['GRI', 'SASB', 'TCFD', 'ESRS']
  top_k?: number;            // 반환할 최대 결과 수 (기본: 5, 범위: 1-20)
  min_confidence?: number;   // 최소 신뢰도 (기본: 0.5, 범위: 0.0-1.0)
  language?: string;         // 응답 언어 (기본: 'ko', 옵션: 'en')
}
```

#### 예시
```json
{
  "text": "우리 회사는 2024년 Scope 1 직접 온실가스 배출량이 1,200 tCO2e입니다.",
  "document_id": 123,
  "block_id": "block-uuid-123",
  "frameworks": ["GRI"],
  "top_k": 3,
  "min_confidence": 0.7,
  "language": "ko"
}
```

### Response

#### Success (200 OK)
```typescript
interface ESGMappingResponse {
  type: 'esg_mapping';
  
  // 매칭 결과
  suggestions: ESGStandardMatch[];
  
  // 메타데이터
  metadata: {
    processing_time: number;      // 처리 시간 (초)
    vector_search_time: number;   // 벡터 검색 시간 (초)
    llm_analysis_time: number;    // LLM 분석 시간 (초)
    candidate_count: number;      // 후보 수
    selected_count: number;       // 선택된 결과 수
  };
  
  // 요약
  summary?: string;  // LLM 생성 요약
}

interface ESGStandardMatch {
  // 표준 정보
  standard_id: string;      // 예: "GRI 305-1"
  framework: string;        // "GRI" | "SASB" | "TCFD" | "ESRS"
  category: string;         // "Environment" | "Social" | "Governance"
  topic: string;            // 예: "GHG Emissions"
  title: string;            // 표준 제목
  description: string;      // 표준 설명
  
  // 매칭 정보
  confidence: number;       // 신뢰도 (0-1)
  similarity_score: number; // 벡터 유사도
  reasoning: string;        // 매칭 이유 (LLM 생성)
  
  // 추가 정보
  keywords: string[];       // 키워드 목록
}
```

#### 예시
```json
{
  "type": "esg_mapping",
  "suggestions": [
    {
      "standard_id": "GRI 305-1",
      "framework": "GRI",
      "category": "Environment",
      "topic": "GHG Emissions",
      "title": "Direct (Scope 1) GHG emissions",
      "description": "온실가스 직접 배출량 보고 표준",
      "confidence": 0.92,
      "similarity_score": 0.87,
      "reasoning": "텍스트에서 Scope 1 배출량과 tCO2e 단위를 명시하여 GRI 305-1 표준과 직접적으로 일치합니다.",
      "keywords": ["GHG", "Scope 1", "emissions", "tCO2e"]
    }
  ],
  "metadata": {
    "processing_time": 2.34,
    "vector_search_time": 0.12,
    "llm_analysis_time": 2.18,
    "candidate_count": 10,
    "selected_count": 1
  },
  "summary": "이 텍스트는 환경(E) 영역의 Scope 1 온실가스 배출량 보고와 관련이 있으며, GRI 305-1 표준이 가장 적합합니다."
}
```

#### Error (400 Bad Request)
```json
{
  "detail": "텍스트 길이는 10자 이상이어야 합니다."
}
```

#### Error (422 Unprocessable Entity)
```json
{
  "detail": [
    {
      "loc": ["body", "frameworks"],
      "msg": "Invalid frameworks: {'INVALID'}. Allowed: {'GRI', 'SASB', 'TCFD', 'ESRS'}",
      "type": "value_error"
    }
  ]
}
```

#### Error (500 Internal Server Error)
```json
{
  "detail": "ESG 매핑 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

---

## ✨ 2. 내용 확장 (Content Expansion) - 신규

### Endpoint
```
POST /api/v1/ai-assist/expand
```

### 용도
블록의 텍스트를 AI가 확장/개선/윤문하여 제안합니다.

### Request

#### Body
```typescript
interface ContentExpansionRequest {
  // 필수
  text: string;              // 원본 텍스트 (10-5000자)
  document_id: number;       // 문서 ID
  block_id: string;          // 블록 ID
  
  // 선택
  mode?: 'expand' | 'rewrite' | 'summarize' | 'formalize';  // 기본: 'expand'
  target_length?: number;    // 목표 길이 (기본: 원본의 1.5배)
  tone?: 'professional' | 'casual' | 'technical';  // 기본: 'professional'
  language?: string;         // 기본: 'ko'
}
```

#### 예시
```json
{
  "text": "우리 회사는 탄소 배출을 줄이고 있습니다.",
  "document_id": 123,
  "block_id": "block-uuid-456",
  "mode": "expand",
  "tone": "professional"
}
```

### Response

#### Success (200 OK)
```typescript
interface ContentExpansionResponse {
  type: 'content_expansion';
  
  // 결과
  original: string;          // 원본 텍스트
  suggestion: string;        // 제안된 텍스트
  
  // 변경 정보
  changes: {
    type: 'addition' | 'deletion' | 'modification';
    start: number;
    end: number;
    original: string;
    suggested: string;
  }[];
  
  // 메타데이터
  metadata: {
    processing_time: number;
    original_length: number;
    suggestion_length: number;
    expansion_ratio: number;  // 확장 비율
  };
  
  // 설명
  explanation: string;  // AI가 생성한 변경 설명
}
```

#### 예시
```json
{
  "type": "content_expansion",
  "original": "우리 회사는 탄소 배출을 줄이고 있습니다.",
  "suggestion": "우리 회사는 2024년을 기점으로 탄소 배출 감축 목표를 설정하고, Scope 1, 2 배출원을 체계적으로 관리하여 전년 대비 15% 감축을 달성했습니다. 향후 2030년까지 탄소 중립을 목표로 재생 에너지 전환과 에너지 효율 개선 프로젝트를 지속 추진할 계획입니다.",
  "changes": [
    {
      "type": "modification",
      "start": 0,
      "end": 23,
      "original": "우리 회사는 탄소 배출을 줄이고 있습니다.",
      "suggested": "우리 회사는 2024년을 기점으로 탄소 배출 감축 목표를 설정하고, Scope 1, 2 배출원을 체계적으로 관리하여 전년 대비 15% 감축을 달성했습니다. 향후 2030년까지 탄소 중립을 목표로 재생 에너지 전환과 에너지 효율 개선 프로젝트를 지속 추진할 계획입니다."
    }
  ],
  "metadata": {
    "processing_time": 1.85,
    "original_length": 23,
    "suggestion_length": 142,
    "expansion_ratio": 6.17
  },
  "explanation": "원본 텍스트를 구체적인 수치와 목표로 확장했습니다. Scope 1, 2 배출원 관리, 15% 감축 달성, 2030년 탄소 중립 목표 등 ESG 보고서에 필요한 구체적 정보를 추가했습니다."
}
```

---

## ❤️ 3. Health Check

### Endpoint
```
GET /api/v1/ai-assist/health
```

### Response

#### Success (200 OK)
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T04:30:00Z",
  "checks": {
    "embedding_model": {"status": "healthy"},
    "chroma_db": {"status": "healthy", "document_count": 181},
    "gemini_api": {"status": "healthy"},
    "gpu": {"status": "healthy", "device_name": "NVIDIA GeForce RTX 3050"}
  }
}
```

#### Unhealthy (503 Service Unavailable)
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-17T04:30:00Z",
  "checks": {
    "embedding_model": {"status": "unhealthy", "error": "..."},
    "chroma_db": {"status": "healthy"},
    "gemini_api": {"status": "degraded"},
    "gpu": {"status": "healthy"}
  }
}
```

---

## 📊 4. Prometheus Metrics

### Endpoint
```
GET /api/v1/ai-assist/metrics
```

### Response
```
Content-Type: text/plain; version=0.0.4

# HELP ai_assist_esg_mapping_requests_total Total ESG mapping requests
# TYPE ai_assist_esg_mapping_requests_total counter
ai_assist_esg_mapping_requests_total{framework="GRI",status="success"} 45.0

# HELP ai_assist_esg_mapping_duration_seconds ESG mapping duration
# TYPE ai_assist_esg_mapping_duration_seconds histogram
ai_assist_esg_mapping_duration_seconds_bucket{le="30.0"} 42.0
ai_assist_esg_mapping_duration_seconds_sum 1248.5
ai_assist_esg_mapping_duration_seconds_count 45.0

# ... 더 많은 메트릭
```

---

## 🔒 인증 & 권한

### 현재 (Phase 4.3)
- ❌ 인증 없음 (개발 환경)

### 향후 (Phase 5)
```typescript
// Headers
Authorization: Bearer <JWT_TOKEN>

// Response (401 Unauthorized)
{
  "detail": "인증이 필요합니다."
}

// Response (403 Forbidden)
{
  "detail": "이 리소스에 접근할 권한이 없습니다."
}
```

---

## ⚡ Rate Limiting

### 현재 (Phase 4.3)
- ❌ Rate Limiting 없음

### 향후 (Phase 5)
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1697500800

// Response (429 Too Many Requests)
{
  "detail": "요청 한도를 초과했습니다. 60초 후 다시 시도해주세요."
}
```

---

## 🔄 Request ID 추적

### Headers
모든 응답에 포함:
```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Response-Time: 26.43ms
```

### 사용법
에러 발생 시 `X-Request-ID`를 포함하여 문의하면 정확한 로그 추적 가능.

---

## 📝 TypeScript 타입 정의

### 프론트엔드용 타입
```typescript
// types/ai-assist.ts

// ============================================
// 1. ESG 매핑
// ============================================

export interface ESGMappingRequest {
  text: string;
  document_id: number;
  section_id?: number;
  block_id?: string;
  frameworks?: ('GRI' | 'SASB' | 'TCFD' | 'ESRS')[];
  top_k?: number;
  min_confidence?: number;
  language?: 'ko' | 'en';
}

export interface ESGStandardMatch {
  standard_id: string;
  framework: 'GRI' | 'SASB' | 'TCFD' | 'ESRS';
  category: 'Environment' | 'Social' | 'Governance' | 'Economic';
  topic: string;
  title: string;
  description: string;
  confidence: number;
  similarity_score: number;
  reasoning: string;
  keywords: string[];
}

export interface ESGMappingResponse {
  type: 'esg_mapping';
  suggestions: ESGStandardMatch[];
  metadata: {
    processing_time: number;
    vector_search_time: number;
    llm_analysis_time: number;
    candidate_count: number;
    selected_count: number;
  };
  summary?: string;
}

// ============================================
// 2. 내용 확장
// ============================================

export interface ContentExpansionRequest {
  text: string;
  document_id: number;
  block_id: string;
  mode?: 'expand' | 'rewrite' | 'summarize' | 'formalize';
  target_length?: number;
  tone?: 'professional' | 'casual' | 'technical';
  language?: 'ko' | 'en';
}

export interface ContentChange {
  type: 'addition' | 'deletion' | 'modification';
  start: number;
  end: number;
  original: string;
  suggested: string;
}

export interface ContentExpansionResponse {
  type: 'content_expansion';
  original: string;
  suggestion: string;
  changes: ContentChange[];
  metadata: {
    processing_time: number;
    original_length: number;
    suggestion_length: number;
    expansion_ratio: number;
  };
  explanation: string;
}

// ============================================
// 3. Health Check
// ============================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    embedding_model: ComponentHealth;
    chroma_db: ComponentHealth;
    gemini_api: ComponentHealth;
    gpu: ComponentHealth;
  };
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  error?: string;
  [key: string]: any;
}

// ============================================
// 4. API 클라이언트
// ============================================

export interface APIError {
  detail: string | any[];
}
```

---

## 🧪 테스트 예시

### cURL
```bash
# ESG 매핑
curl -X POST http://localhost:8000/api/v1/ai-assist/map-esg \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Scope 1 배출량 1,200 tCO2e",
    "document_id": 123,
    "frameworks": ["GRI"]
  }'

# Health Check
curl http://localhost:8000/api/v1/ai-assist/health
```

### Axios (TypeScript)
```typescript
import axios from 'axios';
import type { ESGMappingRequest, ESGMappingResponse } from '@/types/ai-assist';

const apiClient = axios.create({
  baseURL: '/api/v1/ai-assist',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ESG 매핑
const mapESG = async (request: ESGMappingRequest): Promise<ESGMappingResponse> => {
  const { data } = await apiClient.post<ESGMappingResponse>('/map-esg', request);
  return data;
};

// 사용 예시
const result = await mapESG({
  text: 'Scope 1 배출량 1,200 tCO2e',
  document_id: 123,
  frameworks: ['GRI'],
});

console.log(result.suggestions);
```

---

## 📚 다음 단계

1. ✅ API 명세 확정 (현재 문서)
2. ⏳ `/expand` 엔드포인트 백엔드 구현
3. ⏳ 프론트엔드 타입 정의 파일 생성
4. ⏳ API 클라이언트 구현 (`lib/aiAssistClient.ts`)
5. ⏳ AssistPanel 컴포넌트 구현
6. ⏳ Rate Limiting 구현
7. ⏳ 통합 테스트

---

**문서 버전:** 1.0.0  
**최종 업데이트:** 2025-10-17

