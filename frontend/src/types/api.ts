// API Response Types based on PRD specifications

export interface Article {
  id: number;
  company_id: number;
  company_name: string;
  company_name_en?: string;
  title: string;
  source_name?: string;
  article_url: string;
  published_at?: string;
  crawled_at: string;
  summary?: string;
  language: string;
  is_verified: boolean;
}

export interface Company {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  companies_count: number;
  latest_crawl?: string;
}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
}

// API Request Types
export interface ArticleListParams {
  page?: number;
  size?: number;
  sort_by?: 'crawled_at' | 'published_at' | 'title';
  sort_order?: 'asc' | 'desc';
  company_id?: number;
  q?: string; // search query
}

// API Error Response
export interface APIError {
  detail: string;
  status_code: number;
}
