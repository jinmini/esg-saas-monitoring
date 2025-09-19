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
  getFeed: async (params?: Pick<ArticleListParams, 'page' | 'size'>): Promise<ArticleListResponse> => {
    const response = await apiClient.get<ArticleListResponse>('/articles/feed', { params });
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
  getCompanyArticles: async (companyId: number, params?: Pick<ArticleListParams, 'page' | 'size'>): Promise<CompanyArticlesResponse> => {
    const response = await apiClient.get<CompanyArticlesResponse>(`/articles/company/${companyId}`, { params });
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
    const response = await apiClient.get<CompanyTrendsResponse>('/articles/trends', { params });
    return response.data;
  },

  // Get category trends
  getCategoryTrends: async (params?: TrendParams): Promise<CategoryTrendsResponse> => {
    const response = await apiClient.get<CategoryTrendsResponse>('/articles/trends/categories', { params });
    return response.data;
  },
};

export default apiClient;
