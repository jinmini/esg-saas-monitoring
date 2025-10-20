/**
 * AI Assist Zustand Store
 * 
 * AI Assist 기능의 전역 상태 관리
 * - ESG 프레임워크 매핑 결과
 * - 내용 확장 결과
 * - 로딩 상태 및 에러
 * - Request ID 추적
 * 
 * @see public/docs/api/AI_ASSIST_API_SPEC.md
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  ESGMappingRequest,
  ESGMappingResponse,
  ESGMappingOptions,
  ContentExpansionRequest,
  ContentExpansionResponse,
  ContentExpansionOptions,
  AIAssistStatus,
  AIAssistResult,
  HealthCheckResponse,
} from '@/types/ai-assist';
import aiAssistAPI, { APIResponse, getErrorMessage } from '@/lib/aiAssistClient';

// ============================================
// Store 상태 타입
// ============================================

/**
 * AI Assist 상태
 */
interface AIAssistState {
  // ========== 상태 ==========
  
  /** 현재 상태 (idle, loading, success, error) */
  status: AIAssistStatus;
  
  /** 에러 메시지 */
  error: string | null;
  
  /** 현재 Request ID */
  currentRequestId: string | null;
  
  // ========== ESG 매핑 ==========
  
  /** 최근 ESG 매핑 결과 */
  esgMappingResult: ESGMappingResponse | null;
  
  /** 선택된 블록 ID (UI 동기화용) */
  selectedBlockId: string | null;
  
  /** 지속 저장된 블록 ID (사이드바 고정용) */
  persistedBlockId: string | null;
  
  // ========== 내용 확장 ==========
  
  /** 최근 내용 확장 결과 */
  contentExpansionResult: ContentExpansionResponse | null;
  
  // ========== 히스토리 ==========
  
  /** AI Assist 결과 히스토리 (최근 10개) */
  history: AIAssistResult[];
  
  // ========== 서비스 상태 ==========
  
  /** Health Check 결과 */
  healthStatus: HealthCheckResponse | null;
  
  /** 마지막 Health Check 시간 */
  lastHealthCheckTime: Date | null;
}

/**
 * AI Assist 액션
 */
interface AIAssistActions {
  // ========== ESG 매핑 ==========
  
  /**
   * ESG 프레임워크 매핑 실행
   * 
   * @param text 분석할 텍스트
   * @param documentId 문서 ID
   * @param blockId 블록 ID
   * @param options 추가 옵션
   */
  mapESG: (
    text: string,
    documentId: number,
    blockId: string,
    options?: ESGMappingOptions
  ) => Promise<ESGMappingResponse | null>;
  
  // ========== 내용 확장 ==========
  
  /**
   * 내용 확장/윤문 실행
   * 
   * @param text 원본 텍스트
   * @param documentId 문서 ID
   * @param blockId 블록 ID
   * @param options 추가 옵션
   */
  expandContent: (
    text: string,
    documentId: number,
    blockId: string,
    options?: ContentExpansionOptions
  ) => Promise<ContentExpansionResponse | null>;
  
  // ========== 블록 선택 ==========
  
  /**
   * 블록 선택 (UI 동기화)
   */
  setSelectedBlockId: (blockId: string | null) => void;
  
  /**
   * 블록 고정 (사이드바 유지)
   */
  setPersistedBlockId: (blockId: string | null) => void;
  
  // ========== 상태 관리 ==========
  
  /**
   * 에러 초기화
   */
  clearError: () => void;
  
  /**
   * 결과 초기화
   */
  clearResult: () => void;
  
  /**
   * 전체 초기화
   */
  reset: () => void;
  
  // ========== 히스토리 ==========
  
  /**
   * 히스토리에 결과 추가
   */
  addToHistory: (result: AIAssistResult) => void;
  
  /**
   * 히스토리 클리어
   */
  clearHistory: () => void;
  
  // ========== Health Check ==========
  
  /**
   * Health Check 실행
   */
  checkHealth: () => Promise<HealthCheckResponse | null>;
}

// ============================================
// 초기 상태
// ============================================

const initialState: AIAssistState = {
  status: 'idle',
  error: null,
  currentRequestId: null,
  esgMappingResult: null,
  selectedBlockId: null,
  persistedBlockId: null,
  contentExpansionResult: null,
  history: [],
  healthStatus: null,
  lastHealthCheckTime: null,
};

// ============================================
// Zustand Store
// ============================================

/**
 * AI Assist Store
 */
export const useAIAssistStore = create<AIAssistState & AIAssistActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========== ESG 매핑 ==========
        mapESG: async (text, documentId, blockId, options) => {
          set((state) => ({ ...state, status: 'loading', error: null }));

          try {
            const request: ESGMappingRequest = {
              text,
              document_id: documentId,
              block_id: blockId,
              frameworks: options?.frameworks,
              top_k: options?.maxResults || 5,
              min_confidence: options?.minConfidence || 0.5,
              language: 'ko',
            };

            const response: APIResponse<ESGMappingResponse> = await aiAssistAPI.mapESG(request);

            set((state) => ({
              ...state,
              status: 'success',
              esgMappingResult: response.data,
              currentRequestId: response.requestId ?? null,
              selectedBlockId: blockId,
            }));

            // 히스토리에 추가
            get().addToHistory({
              type: 'esg_mapping',
              esgMapping: response.data,
              timestamp: new Date(),
              requestId: response.requestId,
            });

            return response.data;
          } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            set((state) => ({
              ...state,
              status: 'error',
              error: errorMessage,
              currentRequestId: error.requestId ?? null,
            }));

            console.error('[AI Assist Store] ESG 매핑 실패:', error);
            return null;
          }
        },

        // ========== 내용 확장 ==========
        expandContent: async (text, documentId, blockId, options) => {
          set((state) => ({ ...state, status: 'loading', error: null }));

          try {
            const request: ContentExpansionRequest = {
              text,
              document_id: documentId,
              block_id: blockId,
              mode: options?.mode || 'expand',
              tone: options?.tone || 'professional',
              target_length: options?.targetLength,
              language: 'ko',
            };

            const response: APIResponse<ContentExpansionResponse> = await aiAssistAPI.expandContent(request);

            set((state) => ({
              ...state,
              status: 'success',
              contentExpansionResult: response.data,
              currentRequestId: response.requestId ?? null,
              selectedBlockId: blockId,
            }));

            // 히스토리에 추가
            get().addToHistory({
              type: 'content_expansion',
              contentExpansion: response.data,
              timestamp: new Date(),
              requestId: response.requestId,
            });

            return response.data;
          } catch (error: any) {
            const errorMessage = getErrorMessage(error);
            set((state) => ({
              ...state,
              status: 'error',
              error: errorMessage,
              currentRequestId: error.requestId ?? null,
            }));

            console.error('[AI Assist Store] 내용 확장 실패:', error);
            return null;
          }
        },

        // ========== 블록 선택 ==========
        setSelectedBlockId: (blockId) => {
          set((state) => ({ ...state, selectedBlockId: blockId }));
        },

        setPersistedBlockId: (blockId) => {
          set((state) => ({ ...state, persistedBlockId: blockId }));
        },

        // ========== 상태 관리 ==========
        clearError: () => {
          set((state) => ({ ...state, error: null }));
        },

        clearResult: () => {
          set((state) => ({
            ...state,
            esgMappingResult: null,
            contentExpansionResult: null,
            currentRequestId: null,
            status: 'idle',
          }));
        },

        reset: () => {
          set(initialState);
        },

        // ========== 히스토리 ==========
        addToHistory: (result) => {
          set((state) => {
            const newHistory = [result, ...state.history].slice(0, 10); // 최근 10개만 유지
            return { ...state, history: newHistory };
          });
        },

        clearHistory: () => {
          set((state) => ({ ...state, history: [] }));
        },

        // ========== Health Check ==========
        checkHealth: async () => {
          try {
            const response: APIResponse<HealthCheckResponse> = await aiAssistAPI.healthCheck();
            set((state) => ({
              ...state,
              healthStatus: response.data,
              lastHealthCheckTime: new Date(),
            }));
            return response.data;
          } catch (error: any) {
            console.error('[AI Assist Store] Health Check 실패:', error);
            set((state) => ({
              ...state,
              healthStatus: null,
              lastHealthCheckTime: new Date(),
            }));
            return null;
          }
        },
      }),
      {
        name: 'ai-assist-store',
        // 히스토리와 Health 상태는 세션에만 저장
        partialize: (state) => ({
          history: state.history,
          persistedBlockId: state.persistedBlockId,
        }),
      }
    ),
    { name: 'AIAssistStore' }
  )
);

// ============================================
// 셀렉터 (성능 최적화)
// ============================================

/**
 * ESG 매핑 결과가 있는지 확인
 */
export const useHasESGMapping = () =>
  useAIAssistStore((state) => state.esgMappingResult !== null);

/**
 * 내용 확장 결과가 있는지 확인
 */
export const useHasContentExpansion = () =>
  useAIAssistStore((state) => state.contentExpansionResult !== null);

/**
 * 로딩 중인지 확인
 */
export const useIsAIAssistLoading = () =>
  useAIAssistStore((state) => state.status === 'loading');

/**
 * 에러 상태 확인
 */
export const useAIAssistError = () =>
  useAIAssistStore((state) => state.error);

/**
 * 현재 선택된 블록 ID
 */
export const useSelectedBlockId = () =>
  useAIAssistStore((state) => state.selectedBlockId);

/**
 * ESG 매핑 결과 가져오기
 */
export const useESGMappingResult = () =>
  useAIAssistStore((state) => state.esgMappingResult);

/**
 * 내용 확장 결과 가져오기
 */
export const useContentExpansionResult = () =>
  useAIAssistStore((state) => state.contentExpansionResult);

/**
 * 히스토리 가져오기
 */
export const useAIAssistHistory = () =>
  useAIAssistStore((state) => state.history);

/**
 * Health 상태 확인
 */
export const useHealthStatus = () =>
  useAIAssistStore((state) => ({
    status: state.healthStatus,
    lastCheck: state.lastHealthCheckTime,
  }));

// ============================================
// Export
// ============================================

export default useAIAssistStore;

