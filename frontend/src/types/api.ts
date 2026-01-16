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
  image_url?: string | null; 
}

export interface Company {
  id: number;
  company_name: string;
  company_name_en?: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
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
  count: number;
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
// Document Management Types (API v2)
// ===============================

/**
 * API Document Types (Backend 응답 형식)
 * - 구조: Document → Section → blocks[]
 * - Section.blocks는 BlockNode[] (JSONB)
 */

export interface APIBlockNode {
  id: string;
  blockType: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'table' | 'chart' | 'esgMetric';
  attributes?: Record<string, any>;
  content?: APIInlineNode[];
  data?: any;
  children?: any[];
}

export interface APIInlineNode {
  id: string;
  type: 'inline';
  text: string;
  marks?: string[];
  link?: {
    url: string;
    title?: string;
    target?: '_blank' | '_self';
  };
  annotation?: {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
    resolved?: boolean;
  };
}

export interface APIGRIReference {
  code: string[];
  framework: 'GRI' | 'SASB' | 'TCFD' | 'ISO26000' | 'ESRS';
}

export interface APISectionMetadata {
  owner?: string;
  category?: 'E' | 'S' | 'G' | 'General';
  tags?: string[];
  status?: 'draft' | 'in_review' | 'approved' | 'archived' | 'rejected';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'file' | 'image' | 'pdf';
    uploadedAt: string;
    uploadedBy: string;
  }>;
}

export interface APIDocumentSection {
  id: number;
  document_id: number;
  title: string;
  description?: string;
  order: number;
  blocks: APIBlockNode[];
  griReference?: APIGRIReference[];
  metadata?: APISectionMetadata;
  created_at: string;
  updated_at: string;
}

export interface APIDocument {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  is_public: boolean;
  is_template: boolean;
  sections: APIDocumentSection[];
  created_at: string;
  updated_at: string;
}

export interface APIDocumentListItem {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  is_public: boolean;
  is_template: boolean;
  section_count: number;
  created_at: string;
  updated_at: string;
}

export interface APIDocumentListResponse {
  documents: APIDocumentListItem[];
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
}

export interface APIDocumentListParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_template?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface APIDocumentCreateRequest {
  title: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
  sections?: Array<{
    title: string;
    description?: string;
    order: number;
    blocks?: APIBlockNode[];
    griReference?: APIGRIReference[];
    metadata?: APISectionMetadata;
  }>;
}

export interface APIDocumentUpdateRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
}

export interface APIDocumentBulkUpdateRequest {
  title?: string;
  description?: string;
  sections: Array<{
    title: string;
    description?: string;
    order: number;
    blocks: APIBlockNode[];
    griReference?: APIGRIReference[];
    metadata?: APISectionMetadata;
  }>;
}

export interface APISectionCreateRequest {
  title: string;
  description?: string;
  order: number;
  blocks?: APIBlockNode[];
  griReference?: APIGRIReference[];
  metadata?: APISectionMetadata;
}

export interface APISectionUpdateRequest {
  title?: string;
  description?: string;
  blocks?: APIBlockNode[];
  griReference?: APIGRIReference[];
  metadata?: APISectionMetadata;
}

// ===============================
// Legacy v1 Types (호환성 유지)
// ===============================

/** @deprecated Use APIDocument instead */
export interface DocumentSection {
  id?: number;
  chapter_id?: number;
  title: string;
  content: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

/** @deprecated Use APIDocument instead */
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

/** @deprecated Use APIDocument instead */
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

/** @deprecated Use APIDocumentListItem instead */
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

/** @deprecated Use APIDocumentCreateRequest instead */
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

/** @deprecated Use APIDocumentUpdateRequest instead */
export interface DocumentUpdateRequest {
  title?: string;
  description?: string;
  is_public?: boolean;
  is_template?: boolean;
}

/** @deprecated Use APIDocumentBulkUpdateRequest instead */
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

/** @deprecated Use APISectionCreateRequest instead */
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

/** @deprecated Use APISectionCreateRequest instead */
export interface SectionCreateRequest {
  title: string;
  content: string;
  order: number;
}

// ===============================
// Document Version Management Types (Phase 1 - Version System)
// ===============================

/**
 * Version 메타데이터 (목록 조회용)
 */
export interface VersionMetadata {
  id: number;
  version_number: number;
  comment: string | null;
  is_auto_saved: boolean;
  author_id: number | null;
  author_name: string | null;
  sections_count: number;
  blocks_count: number;
  chars_count: number;
  created_at: string; // ISO 8601
}

/**
 * Version 생성 요청 (수동 저장 / 자동 저장)
 */
export interface VersionCreate {
  comment?: string | null;
  is_auto_saved?: boolean;
}

/**
 * Version 상세 응답 (snapshot_data 포함)
 */
export interface VersionResponse {
  id: number;
  document_id: number;
  version_number: number;
  comment: string | null;
  is_auto_saved: boolean;
  author_id: number | null;
  author_name: string | null;
  snapshot_data: APIDocument; // 전체 DocumentNode JSON
  sections_count: number;
  blocks_count: number;
  chars_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Version 목록 응답 (페이지네이션)
 */
export interface VersionListResponse {
  total: number;
  has_next: boolean;
  has_prev: boolean;
  versions: VersionMetadata[];
}

/**
 * Version 복원 응답
 */
export interface VersionRestoreResponse {
  success: boolean;
  message: string;
  restored_version_number: number;
  backup_version_number: number;
  document: APIDocument;
}

/**
 * Version Diff 요청 (Phase 1.4)
 */
export interface VersionDiffRequest {
  source_version_id: number;
  target_version_id?: number | null; // null이면 현재 문서와 비교
}

/**
 * Section Diff 상세 정보 (Phase 1.4 - DiffViewer 재사용)
 */
export interface SectionDiff {
  section_id: string;
  section_title: string;
  changes: {
    blocks_added: number;
    blocks_removed: number;
    blocks_modified: number;
  };
}

/**
 * Version Diff 응답 (Phase 1.4)
 */
export interface VersionDiffResponse {
  source_version: number;
  target_version: number | null;
  sections_added: string[];
  sections_removed: string[];
  sections_modified: SectionDiff[];
  blocks_added: number;
  blocks_removed: number;
  blocks_modified: number;
  chars_changed: number;
}

/**
 * Version 목록 조회 파라미터
 * - skip/limit: 백엔드 FastAPI 파라미터와 일치
 */
export interface VersionListParams {
  skip?: number;
  limit?: number;
  include_auto_saved?: boolean;
}