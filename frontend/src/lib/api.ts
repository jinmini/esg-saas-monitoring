import axios from 'axios';
import type {
  Article,
  ArticleListResponse,
  ArticleListParams,
  CompanyListResponse,
  CompanyTrendsResponse,
  CategoryTrendsResponse,
  TrendParams,
  CompanyStats,
  CompanyArticlesResponse,
  Document,
  DocumentListItem,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentBulkUpdateRequest,
  ChapterCreateRequest,
  SectionCreateRequest,
  DocumentChapter,
  DocumentSection,
  // Version API Types
  VersionCreate,
  VersionResponse,
  VersionListParams,
  VersionListResponse,
  VersionRestoreResponse,
  VersionDiffRequest,
  VersionDiffResponse,
  // Document List API Types
  APIDocumentListResponse,
  APIDocumentListParams,
} from '@/types/api';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 콜드스타트 대응 (Render Free Plan: 15~30초 소요)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log('[API Request Data]', config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    console.error('[API Error Details]', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      data: error.config?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    return Promise.reject(error);
  }
);

// API Functions
export const articlesApi = {
  // Get articles feed (latest articles)
  getFeed: async (params?: Pick<ArticleListParams, 'page' | 'size' | 'period'>): Promise<ArticleListResponse> => {
    // Convert period to date_from/date_to if period is provided
    let apiParams: any = { ...params };
    if (params?.period) {
      const { periodToDateRange } = await import('@/lib/utils');
      const dateRange = periodToDateRange(params.period);
      apiParams = {
        ...params,
        date_from: dateRange.date_from,
        date_to: dateRange.date_to,
      };
      delete apiParams.period; // Remove period as it's not an API parameter
    }
    
    const response = await apiClient.get<ArticleListResponse>('/articles/feed', { params: apiParams });
    return response.data;
  },

  // Get articles list with filters
  getList: async (params?: ArticleListParams): Promise<ArticleListResponse> => {
    const response = await apiClient.get<ArticleListResponse>('/articles/', { params });
    return response.data;
  },

  // Get single article by ID
  getById: async (id: number): Promise<Article> => {
    const response = await apiClient.get<Article>(`/articles/${id}`);
    return response.data;
  },

  // Get companies list
  getCompanies: async (): Promise<CompanyListResponse> => {
    const response = await apiClient.get<CompanyListResponse>('/articles/companies/list');
    return response.data;
  },

  // Get company articles (with smart filtering)
  getCompanyArticles: async (companyId: number, params?: Pick<ArticleListParams, 'page' | 'size' | 'period'>): Promise<CompanyArticlesResponse> => {
    // Convert period to date_from/date_to if period is provided
    let apiParams: any = { ...params };
    if (params?.period) {
      const { periodToDateRange } = await import('@/lib/utils');
      const dateRange = periodToDateRange(params.period);
      apiParams = {
        ...params,
        date_from: dateRange.date_from,
        date_to: dateRange.date_to,
      };
      delete apiParams.period; // Remove period as it's not an API parameter
    }
    
    const response = await apiClient.get<CompanyArticlesResponse>(`/articles/company/${companyId}`, { params: apiParams });
    return response.data;
  },

  // Get company statistics
  getCompanyStats: async (companyId: number): Promise<CompanyStats> => {
    const response = await apiClient.get<CompanyStats>(`/articles/company/${companyId}/stats`);
    return response.data;
  },
};

// Trends API Functions
export const trendsApi = {
  // Get company trends (for Trending Now widget)
  getCompanyTrends: async (params?: TrendParams): Promise<CompanyTrendsResponse> => {
    // Convert period to period_days if period is provided
    let apiParams: any = { ...params };
    if (params?.period) {
      const { periodToPeriodDays } = await import('@/lib/utils');
      apiParams = {
        ...params,
        period_days: periodToPeriodDays(params.period),
      };
      delete apiParams.period; // Remove period as it's not an API parameter
    }
    
    const response = await apiClient.get<CompanyTrendsResponse>('/articles/trends', { params: apiParams });
    return response.data;
  },

  // Get category trends
  getCategoryTrends: async (params?: TrendParams): Promise<CategoryTrendsResponse> => {
    // Convert period to period_days if period is provided
    let apiParams: any = { ...params };
    if (params?.period) {
      const { periodToPeriodDays } = await import('@/lib/utils');
      apiParams = {
        ...params,
        period_days: periodToPeriodDays(params.period),
      };
      delete apiParams.period; // Remove period as it's not an API parameter
    }
    
    const response = await apiClient.get<CategoryTrendsResponse>('/articles/trends/categories', { params: apiParams });
    return response.data;
  },
};

// ===============================
// Events API Functions (ESG Calendar)
// ===============================
// NOTE: Event 타입이 삭제되어 임시로 주석 처리됨
// 필요시 Event 타입을 다시 생성하고 활성화할 것
//
// export const eventsApi = {
//   getEventsByMonth: async (params: EventListParams): Promise<EventListResponse> => { ... },
//   getById: async (id: number): Promise<Event> => { ... },
//   create: async (event: EventCreateRequest): Promise<Event> => { ... },
//   update: async (id: number, event: EventUpdateRequest): Promise<Event> => { ... },
//   delete: async (id: number): Promise<void> => { ... },
//   getCategories: async (): Promise<EventCategoriesResponse> => { ... },
//   getEventsByDateRange: async (startDate: string, endDate: string, category?: string): Promise<Event[]> => { ... },
// };

// Documents API Functions (ESG Report Management - API v2)
export const documentsApi = {
  // Get document list with pagination
  getList: async (params?: APIDocumentListParams): Promise<APIDocumentListResponse> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Documents List:', params);
    }
    const response = await apiClient.get<APIDocumentListResponse>('/documents/', { params });
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Documents List Response:', response.data);
    }
    return response.data;
  },

  // Get single document with full structure
  getById: async (id: number): Promise<import('@/types/api').APIDocument> => {
    const response = await apiClient.get<import('@/types/api').APIDocument>(`/documents/${id}`);
    return response.data;
  },

  // Create new document
  create: async (
    document: import('@/types/api').APIDocumentCreateRequest,
    user_id?: number
  ): Promise<import('@/types/api').APIDocument> => {
    const params = user_id ? { user_id } : {};
    const response = await apiClient.post<import('@/types/api').APIDocument>('/documents/', document, { params });
    return response.data;
  },

  // Update document metadata
  update: async (
    id: number,
    document: import('@/types/api').APIDocumentUpdateRequest
  ): Promise<import('@/types/api').APIDocument> => {
    const response = await apiClient.put<import('@/types/api').APIDocument>(`/documents/${id}`, document);
    return response.data;
  },

  // Delete document
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  // Bulk update (save entire document structure) - 주요 저장 API
  bulkUpdate: async (
    id: number,
    document: import('@/types/api').APIDocumentBulkUpdateRequest
  ): Promise<{
    success: boolean;
    message: string;
    document: import('@/types/api').APIDocument;
  }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      document: import('@/types/api').APIDocument;
    }>(`/documents/${id}/bulk-update`, document);
    return response.data;
  },

  // Section operations (v2)
  createSection: async (
    documentId: number,
    section: import('@/types/api').APISectionCreateRequest
  ): Promise<import('@/types/api').APIDocumentSection> => {
    const response = await apiClient.post<import('@/types/api').APIDocumentSection>(
      `/documents/${documentId}/sections`,
      section
    );
    return response.data;
  },

  updateSection: async (
    sectionId: number,
    section: import('@/types/api').APISectionUpdateRequest
  ): Promise<import('@/types/api').APIDocumentSection> => {
    const response = await apiClient.put<import('@/types/api').APIDocumentSection>(
      `/documents/sections/${sectionId}`,
      section
    );
    return response.data;
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    await apiClient.delete(`/documents/sections/${sectionId}`);
  },

  // Create document from template
  createFromTemplate: async (
    templateId: number,
    title: string,
    userId?: number
  ): Promise<import('@/types/api').APIDocument> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Create from Template:', { templateId, title, userId });
    }
    const params = userId ? { user_id: userId } : {};
    const response = await apiClient.post<import('@/types/api').APIDocument>(
      `/documents/${templateId}/copy`,
      { title },
      { params }
    );
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Created Document:', response.data);
    }
    return response.data;
  },

  // ==========================================
  // Legacy v1 API (호환성 유지)
  // ==========================================

  /** @deprecated Use bulkUpdate instead */
  createChapter: async (documentId: number, chapter: ChapterCreateRequest): Promise<DocumentChapter> => {
    const response = await apiClient.post<DocumentChapter>(`/documents/${documentId}/chapters`, chapter);
    return response.data;
  },

  /** @deprecated Use bulkUpdate instead */
  updateChapter: async (chapterId: number, chapter: Partial<ChapterCreateRequest>): Promise<DocumentChapter> => {
    const response = await apiClient.put<DocumentChapter>(`/documents/chapters/${chapterId}`, chapter);
    return response.data;
  },

  /** @deprecated Use bulkUpdate instead */
  deleteChapter: async (chapterId: number): Promise<void> => {
    await apiClient.delete(`/documents/chapters/${chapterId}`);
  },
};

// ===============================
// Version API Functions (Phase 1 - Version & Snapshot System)
// ===============================

export const versionsApi = {
  /**
   * 버전 생성 (수동 저장 또는 자동 저장)
   * @param documentId - 대상 문서 ID
   * @param data - 버전 생성 요청 데이터
   * @returns 생성된 버전 상세 정보
   */
  create: async (
    documentId: number,
    data: VersionCreate
  ): Promise<VersionResponse> => {
    const response = await apiClient.post<VersionResponse>(
      `/documents/${documentId}/versions`,
      data
    );
    return response.data;
  },

  /**
   * 버전 목록 조회 (페이지네이션)
   * @param documentId - 대상 문서 ID
   * @param params - 페이지네이션 및 필터 파라미터 (skip/limit)
   * @returns 버전 목록 (메타데이터만, snapshot_data 제외)
   */
  list: async (
    documentId: number,
    params?: VersionListParams
  ): Promise<VersionListResponse> => {
    const response = await apiClient.get<VersionListResponse>(
      `/documents/${documentId}/versions`,
      { params }
    );
    return response.data;
  },

  /**
   * 특정 버전 상세 조회 (snapshot_data 포함)
   * @param versionId - 버전 ID
   * @returns 버전 상세 정보 (전체 DocumentNode 포함)
   */
  getById: async (versionId: number): Promise<VersionResponse> => {
    const response = await apiClient.get<VersionResponse>(
      `/versions/${versionId}`
    );
    return response.data;
  },

  /**
   * 버전 복원 (선택한 버전으로 문서 복원 + 현재 상태 백업)
   * @param documentId - 대상 문서 ID
   * @param versionId - 복원할 버전 ID
   * @returns 복원 결과 (복원된 버전 번호 + 백업 버전 번호 + 복원된 문서)
   */
  restore: async (
    documentId: number,
    versionId: number
  ): Promise<VersionRestoreResponse> => {
    const response = await apiClient.post<VersionRestoreResponse>(
      `/documents/${documentId}/versions/${versionId}/restore`
    );
    return response.data;
  },

  /**
   * 버전 삭제 (최신 버전이 아닌 경우에만 삭제 가능)
   * @param versionId - 삭제할 버전 ID
   * @returns 삭제 성공 여부
   */
  delete: async (versionId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/versions/${versionId}`);
    return { success: response.status === 204 || response.status === 200 };
  },

  /**
   * 버전 비교 (Phase 1.4 - Diff View)
   * @param documentId - 대상 문서 ID
   * @param data - 비교할 버전 ID들
   * @returns Diff 분석 결과 (추가/제거/수정된 섹션 및 블록)
   */
  compare: async (
    documentId: number,
    data: VersionDiffRequest
  ): Promise<VersionDiffResponse> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Version Diff:', { documentId, data });
    }
    
    const response = await apiClient.post<VersionDiffResponse>(
      `/documents/${documentId}/versions/diff`,
      data
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Version Diff Result:', response.data);
    }
    
    return response.data;
  },
};

export default apiClient;
