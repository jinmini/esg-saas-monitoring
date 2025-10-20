/**
 * AI Assist API 클라이언트
 * 
 * Axios 기반 통합 클라이언트로, 에러 처리 및 헤더 추적 기능 포함
 * 
 * @see public/docs/api/AI_ASSIST_API_SPEC.md
 */

import axios from 'axios';
import {
  ESGMappingRequest,
  ESGMappingResponse,
  ContentExpansionRequest,
  ContentExpansionResponse,
  HealthCheckResponse,
  APIError,
  APIResponseHeaders,
} from '@/types/ai-assist';

// ============================================
// API 클라이언트 설정
// ============================================

/**
 * 기본 API 설정
 */
const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1/ai-assist',
  timeout: 60000, // 60초 (AI 처리 시간 고려)
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Axios 인스턴스 생성
 */
const apiClient = axios.create(API_CONFIG);

// ============================================
// Request/Response 인터셉터
// ============================================

/**
 * Request Interceptor: Request ID 생성 및 로깅
 */
apiClient.interceptors.request.use(
  (config) => {
    // Request ID 생성 (프론트엔드)
    const requestId = `fe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    if (config.headers) {
      config.headers['X-Request-ID'] = requestId;
    }
    
    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI Assist API] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[AI Assist API] Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: 헤더 추출 및 에러 처리
 */
apiClient.interceptors.response.use(
  (response) => {
    // 응답 헤더 추출 (Request ID 추적)
    const requestId = response.headers['x-request-id'];
    const responseTime = response.headers['x-response-time'];
    
    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI Assist API] Response`, {
        status: response.status,
        requestId,
        responseTime,
        data: response.data,
      });
    }
    
    // 응답 데이터에 메타 정보 추가
    if (response.data && typeof response.data === 'object') {
      (response.data as any)._meta = {
        requestId,
        responseTime,
      };
    }
    
    return response;
  },
  (error: any) => {
    // 에러 응답 처리
    const requestId = error.response?.headers?.['x-request-id'];
    
    console.error('[AI Assist API] Response Error:', {
      status: error.response?.status,
      requestId,
      message: error.message,
      detail: error.response?.data?.detail,
    });
    
    // 에러 객체에 Request ID 추가
    if (error.response) {
      (error.response.data as any)._meta = {
        requestId,
        status: error.response.status,
      };
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// API 응답 래퍼 타입
// ============================================

/**
 * API 응답 래퍼 (메타 정보 포함)
 */
export interface APIResponse<T> {
  data: T;
  requestId?: string;
  responseTime?: string;
}

/**
 * 응답 헤더에서 메타 정보 추출
 */
function extractMetadata<T>(response: any): APIResponse<T> {
  return {
    data: response.data,
    requestId: response.headers['x-request-id'],
    responseTime: response.headers['x-response-time'],
  };
}

// ============================================
// AI Assist API 메서드
// ============================================

/**
 * AI Assist API 클라이언트
 */
export const aiAssistAPI = {
  /**
   * ESG 프레임워크 매핑
   * 
   * @param request ESG 매핑 요청
   * @returns ESG 매핑 응답 (Request ID 포함)
   */
  async mapESG(request: ESGMappingRequest): Promise<APIResponse<ESGMappingResponse>> {
    try {
      const response = await apiClient.post<ESGMappingResponse>(
        '/map-esg',
        request
      );
      return extractMetadata(response);
    } catch (error) {
      throw this.handleError(error, 'ESG 매핑 실패');
    }
  },

  /**
   * 내용 확장/윤문
   * 
   * @param request 내용 확장 요청
   * @returns 내용 확장 응답 (Request ID 포함)
   */
  async expandContent(request: ContentExpansionRequest): Promise<APIResponse<ContentExpansionResponse>> {
    try {
      const response = await apiClient.post<ContentExpansionResponse>(
        '/expand',
        request
      );
      return extractMetadata(response);
    } catch (error) {
      throw this.handleError(error, '내용 확장 실패');
    }
  },

  /**
   * Health Check
   * 
   * @returns 서비스 상태
   */
  async healthCheck(): Promise<APIResponse<HealthCheckResponse>> {
    try {
      const response = await apiClient.get<HealthCheckResponse>(
        '/health'
      );
      return extractMetadata(response);
    } catch (error) {
      throw this.handleError(error, 'Health Check 실패');
    }
  },

  /**
   * Prometheus 메트릭 가져오기
   * 
   * @returns 메트릭 텍스트 (Prometheus 형식)
   */
  async getMetrics(): Promise<string> {
    try {
      const response = await apiClient.get<string>(
        '/metrics',
        {
          headers: {
            Accept: 'text/plain',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, '메트릭 가져오기 실패');
    }
  },

  /**
   * 에러 핸들러
   * 
   * @param error Axios 에러
   * @param defaultMessage 기본 에러 메시지
   * @returns 처리된 에러 객체
   */
  handleError(error: any, defaultMessage: string): Error {
    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      const { status, data } = error.response;
      const requestId = (data as any)?._meta?.requestId;
      
      let message = defaultMessage;
      
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // Pydantic 검증 에러
        const validationErrors = data.detail.map((err: any) => {
          const field = err.loc.join('.');
          return `${field}: ${err.msg}`;
        }).join(', ');
        message = `검증 실패: ${validationErrors}`;
      }
      
      const enrichedError = new Error(message);
      (enrichedError as any).status = status;
      (enrichedError as any).requestId = requestId;
      (enrichedError as any).originalError = error;
      
      return enrichedError;
    } else if (error.request) {
      // 네트워크 에러 (요청 전송 실패)
      const networkError = new Error('네트워크 연결 실패. 인터넷 연결을 확인해주세요.');
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      return networkError;
    } else {
      // 요청 설정 에러
      return error;
    }
  },
};

// ============================================
// 헬퍼 함수
// ============================================

/**
 * API 응답에서 Request ID 추출
 */
export function extractRequestId(response: APIResponse<any>): string | undefined {
  return response.requestId;
}

/**
 * 에러 메시지 추출 (사용자 친화적)
 */
export function getErrorMessage(error: any): string {
  if (error.message) {
    return error.message;
  }
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return '입력 값을 확인해주세요.';
    }
  }
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 네트워크 에러 확인
 */
export function isNetworkError(error: any): boolean {
  return error?.isNetworkError === true || error?.code === 'ECONNABORTED';
}

/**
 * 타임아웃 에러 확인
 */
export function isTimeoutError(error: any): boolean {
  return error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
}

/**
 * 에러 상태 코드 추출
 */
export function getErrorStatus(error: any): number | undefined {
  return error?.status || error?.response?.status;
}

// ============================================
// Export
// ============================================

export default aiAssistAPI;

