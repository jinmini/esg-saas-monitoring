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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
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

export default apiClient;
