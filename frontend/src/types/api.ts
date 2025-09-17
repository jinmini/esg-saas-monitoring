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

// Trend Related Types
export interface CompanyTrend {
  rank: number;
  company_id: number;
  company_name: string;
  company_name_en?: string;
  current_mentions: number;
  previous_mentions: number;
  change_rate: number;
  change_type: 'up' | 'down' | 'stable';
  primary_categories: string[];
  service_categories: string[];
  company_type: string;
  latest_article_title: string;
  latest_article_url: string;
  latest_published_at: string;
}

export interface CompanyTrendsResponse {
  trends: CompanyTrend[];
  period_days: number;
  analysis_date: string;
  total_companies: number;
}

export interface CategoryTrend {
  rank: number;
  category_code: string;
  category_name: string;
  category_name_en?: string;
  main_topic: string;
  current_mentions: number;
  previous_mentions: number;
  change_rate: number;
  change_type: 'up' | 'down' | 'stable';
  companies_count: number;
  top_companies: string[];
}

export interface CategoryTrendsResponse {
  trends: CategoryTrend[];
  period_days: number;
  analysis_date: string;
  total_categories: number;
}

export interface TrendParams {
  period_days?: number;
}

// API Error Response
export interface APIError {
  detail: string;
  status_code: number;
}
