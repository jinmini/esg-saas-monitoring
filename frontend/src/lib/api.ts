import axios from 'axios';
import type {
  Article,
  ArticleListResponse,
  ArticleListParams,
  CompanyListResponse,
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
};

export default apiClient;
