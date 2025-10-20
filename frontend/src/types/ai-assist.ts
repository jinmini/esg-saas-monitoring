/**
 * AI Assist API 타입 정의
 * 
 * @see public/docs/api/AI_ASSIST_API_SPEC.md
 */

// ============================================
// 1. ESG 프레임워크 매핑
// ============================================

/**
 * ESG 프레임워크 타입
 */
export type ESGFramework = 'GRI' | 'SASB' | 'TCFD' | 'ESRS';

/**
 * ESG 카테고리 (백엔드 응답값)
 */
export type ESGCategory = 'E' | 'S' | 'G' | 'GENERAL' | 'OTHER';

/**
 * ESG 카테고리 표시명
 */
export type ESGCategoryDisplay = 'Environment' | 'Social' | 'Governance' | 'General' | 'Other';

/**
 * 카테고리 코드 → 표시명 매핑
 */
export const ESG_CATEGORY_DISPLAY_MAP: Record<ESGCategory, ESGCategoryDisplay> = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
  GENERAL: 'General',
  OTHER: 'Other',
};

/**
 * 언어 코드
 */
export type LanguageCode = 'ko' | 'en';

/**
 * ESG 매핑 요청
 */
export interface ESGMappingRequest {
  /** 분석할 텍스트 (10-10000자) */
  text: string;
  
  /** 문서 ID */
  document_id: number;
  
  /** 섹션 ID (선택) */
  section_id?: number;
  
  /** 블록 ID - 프론트엔드 UUID (선택) */
  block_id?: string;
  
  /** 검색할 프레임워크 (선택, 기본: 전체) */
  frameworks?: ESGFramework[];
  
  /** 반환할 최대 결과 수 (기본: 5, 범위: 1-20) */
  top_k?: number;
  
  /** 최소 신뢰도 임계값 (기본: 0.5, 범위: 0.0-1.0) */
  min_confidence?: number;
  
  /** 응답 언어 (기본: 'ko') */
  language?: LanguageCode;
}

/**
 * ESG 표준 매칭 결과
 */
export interface ESGStandardMatch {
  /** 표준 ID (예: "GRI 305-1") */
  standard_id: string;
  
  /** 프레임워크 */
  framework: ESGFramework;
  
  /** 카테고리 (E, S, G 등) */
  category: ESGCategory;
  
  /** 카테고리 표시명 (Environment, Social, Governance) */
  category_display: ESGCategoryDisplay;
  
  /** 주제 (예: "GHG Emissions") */
  topic: string;
  
  /** 표준 제목 */
  title: string;
  
  /** 표준 설명 */
  description: string;
  
  /** 매칭 신뢰도 (0-1) */
  confidence: number;
  
  /** 벡터 유사도 점수 */
  similarity_score: number;
  
  /** 매칭 이유 (LLM 생성) */
  reasoning: string;
  
  /** 키워드 목록 */
  keywords: string[];
}

/**
 * ESG 매핑 응답 메타데이터
 */
export interface ESGMappingMetadata {
  /** 총 처리 시간 (초) */
  processing_time: number;
  
  /** 벡터 검색 시간 (초) */
  vector_search_time: number;
  
  /** LLM 분석 시간 (초) */
  llm_analysis_time: number;
  
  /** 후보 수 */
  candidate_count: number;
  
  /** 선택된 결과 수 */
  selected_count: number;
  
  /** 사용된 LLM 모델 */
  model_used: string;
  
  /** 사용된 임베딩 모델 */
  embedding_model: string;
}

/**
 * ESG 매핑 응답
 */
export interface ESGMappingResponse {
  /** 응답 타입 */
  type: 'esg_mapping';
  
  /** 매칭된 ESG 표준 목록 */
  suggestions: ESGStandardMatch[];
  
  /** 처리 메타데이터 */
  metadata: ESGMappingMetadata;
  
  /** 전체 매칭 결과 요약 (LLM 생성, 선택) */
  summary?: string;
}

// ============================================
// 2. 내용 확장 (Content Expansion)
// ============================================

/**
 * 내용 확장 모드
 */
export type ExpansionMode = 'expand' | 'rewrite' | 'summarize' | 'formalize';

/**
 * 문체 톤
 */
export type ContentTone = 'professional' | 'casual' | 'technical';

/**
 * 내용 확장 요청
 */
export interface ContentExpansionRequest {
  /** 원본 텍스트 (10-5000자) */
  text: string;
  
  /** 문서 ID */
  document_id: number;
  
  /** 블록 ID */
  block_id: string;
  
  /** 확장 모드 (기본: 'expand') */
  mode?: ExpansionMode;
  
  /** 목표 길이 (기본: 원본의 1.5배) */
  target_length?: number;
  
  /** 문체 톤 (기본: 'professional') */
  tone?: ContentTone;
  
  /** 언어 (기본: 'ko') */
  language?: LanguageCode;
}

/**
 * 텍스트 변경 타입
 */
export type ChangeType = 'addition' | 'deletion' | 'modification';

/**
 * 텍스트 변경 정보
 */
export interface ContentChange {
  /** 변경 타입 */
  type: ChangeType;
  
  /** 시작 위치 */
  start: number;
  
  /** 종료 위치 */
  end: number;
  
  /** 원본 텍스트 */
  original: string;
  
  /** 제안된 텍스트 */
  suggested: string;
}

/**
 * 내용 확장 응답 메타데이터
 */
export interface ContentExpansionMetadata {
  /** 처리 시간 (초) */
  processing_time: number;
  
  /** 원본 길이 (문자 수) */
  original_length: number;
  
  /** 제안 길이 (문자 수) */
  suggestion_length: number;
  
  /** 확장 비율 */
  expansion_ratio: number;
}

/**
 * 내용 확장 응답
 */
export interface ContentExpansionResponse {
  /** 응답 타입 */
  type: 'content_expansion';
  
  /** 원본 텍스트 */
  original: string;
  
  /** 제안된 텍스트 */
  suggestion: string;
  
  /** 변경 정보 목록 */
  changes: ContentChange[];
  
  /** 메타데이터 */
  metadata: ContentExpansionMetadata;
  
  /** 변경 설명 (AI 생성) */
  explanation: string;
}

// ============================================
// 3. Health Check
// ============================================

/**
 * 구성 요소 상태
 */
export type ComponentStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * 구성 요소 Health 정보
 */
export interface ComponentHealth {
  /** 상태 */
  status: ComponentStatus;
  
  /** 에러 메시지 (unhealthy 시) */
  error?: string;
  
  /** 추가 정보 (구성 요소별로 다름) */
  [key: string]: any;
}

/**
 * Health Check 응답
 */
export interface HealthCheckResponse {
  /** 전체 상태 */
  status: ComponentStatus;
  
  /** 타임스탬프 (ISO 8601) */
  timestamp: string;
  
  /** 구성 요소별 상태 */
  checks: {
    embedding_model: ComponentHealth;
    chroma_db: ComponentHealth;
    gemini_api: ComponentHealth;
    gpu: ComponentHealth;
  };
}

// ============================================
// 4. 공통 타입
// ============================================

/**
 * API 에러 응답
 */
export interface APIError {
  /** 에러 메시지 또는 검증 에러 목록 */
  detail: string | ValidationError[];
}

/**
 * 검증 에러
 */
export interface ValidationError {
  /** 에러 위치 */
  loc: (string | number)[];
  
  /** 에러 메시지 */
  msg: string;
  
  /** 에러 타입 */
  type: string;
}

/**
 * AI Assist 상태
 */
export type AIAssistStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * AI Assist 결과 (Store용)
 */
export interface AIAssistResult {
  /** 결과 타입 */
  type: 'esg_mapping' | 'content_expansion';
  
  /** ESG 매핑 결과 */
  esgMapping?: ESGMappingResponse;
  
  /** 내용 확장 결과 */
  contentExpansion?: ContentExpansionResponse;
  
  /** 타임스탬프 */
  timestamp: Date;
  
  /** Request ID */
  requestId?: string;
}

// ============================================
// 5. 헬퍼 타입
// ============================================

/**
 * API 응답 헤더
 */
export interface APIResponseHeaders {
  'x-request-id'?: string;
  'x-response-time'?: string;
  'x-ratelimit-limit'?: string;
  'x-ratelimit-remaining'?: string;
  'x-ratelimit-reset'?: string;
}

/**
 * ESG 매핑 옵션 (프론트엔드용 간소화)
 */
export interface ESGMappingOptions {
  frameworks?: ESGFramework[];
  maxResults?: number;
  minConfidence?: number;
}

/**
 * 내용 확장 옵션 (프론트엔드용 간소화)
 */
export interface ContentExpansionOptions {
  mode?: ExpansionMode;
  tone?: ContentTone;
  targetLength?: number;
}

