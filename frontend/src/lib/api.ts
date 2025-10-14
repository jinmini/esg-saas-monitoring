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
  Event,
  EventListResponse,
  EventListParams,
  EventCategoriesResponse,
  EventCreateRequest,
  EventUpdateRequest,
  Document,
  DocumentListItem,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentBulkUpdateRequest,
  ChapterCreateRequest,
  SectionCreateRequest,
  DocumentChapter,
  DocumentSection,
} from '@/types/api';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Events API Functions (ESG Calendar)
export const eventsApi = {
  // Get events by month (main calendar API)
  getEventsByMonth: async (params: EventListParams): Promise<EventListResponse> => {
    const response = await apiClient.get<EventListResponse>('/events/', { params });
    return response.data;
  },

  // Get single event by ID
  getById: async (id: number): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  // Create new event (admin only)
  create: async (event: EventCreateRequest): Promise<Event> => {
    const response = await apiClient.post<Event>('/events/', event);
    return response.data;
  },

  // Update event (admin only)
  update: async (id: number, event: EventUpdateRequest): Promise<Event> => {
    const response = await apiClient.put<Event>(`/events/${id}`, event);
    return response.data;
  },

  // Delete event (admin only)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },

  // Get available categories
  getCategories: async (): Promise<EventCategoriesResponse> => {
    const response = await apiClient.get<EventCategoriesResponse>('/events/meta/categories');
    return response.data;
  },

  // Get events by date range (for calendar rendering optimization)
  getEventsByDateRange: async (startDate: string, endDate: string, category?: string): Promise<Event[]> => {
    // This will be a utility function that makes multiple month calls if needed
    // For now, we'll implement a simple approach using the monthly API
    const start = new Date(startDate);
    const end = new Date(endDate);
    const events: Event[] = [];
    
    // Get events for each month in the range
    const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (currentDate <= end) {
      try {
        const params: EventListParams = {
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          category: category as any
        };
        
        const monthEvents = await eventsApi.getEventsByMonth(params);
        
        // Filter events to the exact date range
        const filteredEvents = monthEvents.events.filter(event => {
          const eventDate = new Date(event.start_date);
          return eventDate >= start && eventDate <= end;
        });
        
        events.push(...filteredEvents);
      } catch (error) {
        console.error(`Failed to fetch events for ${currentDate.getFullYear()}-${currentDate.getMonth() + 1}:`, error);
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return events;
  },
};

// Documents API Functions (ESG Report Management - API v2)
export const documentsApi = {
  // Get document list
  getList: async (params?: {
    user_id?: number;
    is_template?: boolean;
    is_public?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<import('@/types/api').APIDocumentListItem[]> => {
    const response = await apiClient.get<import('@/types/api').APIDocumentListItem[]>('/documents/', { params });
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
    const response = await apiClient.post(`/documents/${id}/bulk-update`, document);
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

export default apiClient;
