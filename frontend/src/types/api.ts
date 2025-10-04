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
  period?: number;
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
  period?: number; // For frontend convenience, will be converted to period_days
}

// Company Detail Types (New APIs)
export interface CompanyStats {
  company_id: number;
  company_name: string;
  current_mentions: number;
  previous_mentions: number;
  change_rate: number;
  change_type: 'up' | 'down' | 'stable';
  daily_mentions: Array<{
    date: string;
    count: number;
  }>;
  period_days: number;
  analysis_date: string;
}

export interface CompanyArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

// API Error Response
export interface APIError {
  detail: string;
  status_code: number;
}

// ===============================
// ESG Calendar Event Types
// ===============================

export interface Event {
  id: number;
  title: string;
  description?: string;
  start_date: string; // ISO date format (YYYY-MM-DD)
  end_date?: string;  // ISO date format (YYYY-MM-DD)
  category: EventCategory;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export type EventCategory = '지원사업' | '정책발표' | '컨퍼런스' | '공시마감';

export interface EventListResponse {
  events: Event[];
  total: number;
}

export interface EventCategoriesResponse {
  categories: EventCategory[];
}

// API Request Types for Events
export interface EventListParams {
  year: number;
  month: number;
  category?: EventCategory;
}

export interface EventCreateRequest {
  title: string;
  description?: string;
  start_date: string; // ISO date format
  end_date?: string;  // ISO date format
  category: EventCategory;
  source_url?: string;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  category?: EventCategory;
  source_url?: string;
}

// Event Category Color Mapping (Notion-style)
export const EVENT_CATEGORY_COLORS: Record<EventCategory, {
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = {
  '지원사업': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500'
  },
  '공시마감': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500'
  },
  '정책발표': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500'
  },
  '컨퍼런스': {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500'
  }
};

// ===============================
// Document Management Types
// ===============================

export interface DocumentSection {
  id?: number;
  chapter_id?: number;
  title: string;
  content: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentChapter {
  id?: number;
  document_id?: number;
  title: string;
  order: number;
  is_collapsed: boolean;
  sections: DocumentSection[];
  created_at?: string;
  updated_at?: string;
}

export interface Document {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  is_public: boolean;
  is_template: boolean;
  chapters: DocumentChapter[];
  created_at: string;
  updated_at: string;
}

export interface DocumentListItem {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  is_public: boolean;
  is_template: boolean;
  chapter_count: number;
  section_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateRequest {
  title: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
  chapters?: Array<{
    title: string;
    order: number;
    is_collapsed?: boolean;
    sections?: Array<{
      title: string;
      content: string;
      order: number;
    }>;
  }>;
}

export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
}

export interface DocumentBulkUpdateRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
  chapters: Array<{
    title: string;
    order: number;
    is_collapsed?: boolean;
    sections: Array<{
      title: string;
      content: string;
      order: number;
    }>;
  }>;
}

export interface ChapterCreateRequest {
  title: string;
  order: number;
  is_collapsed?: boolean;
  sections?: Array<{
    title: string;
    content: string;
    order: number;
  }>;
}

export interface SectionCreateRequest {
  title: string;
  content: string;
  order: number;
}