-- ESG 경쟁 분석 플랫폼 데이터베이스 스키마

-- 1. 기업 정보 테이블
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_name_en VARCHAR(200),
    company_type ENUM('korean_esg_startup', 'global_esg_leader', 'competitor') NOT NULL,
    founded_year INTEGER,
    employee_count INTEGER,
    headquarters_country VARCHAR(50),
    headquarters_city VARCHAR(100),
    website_url VARCHAR(500),
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ESG 서비스 분류 체계 (Taxonomy)
CREATE TABLE esg_service_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    main_category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100) NOT NULL,
    description TEXT,
    category_level INTEGER NOT NULL, -- 1: Main, 2: Sub
    parent_category_id INTEGER REFERENCES esg_service_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 기업-서비스 매트릭스 (핵심 이진 데이터)
CREATE TABLE company_service_matrix (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    service_category_id INTEGER NOT NULL REFERENCES esg_service_categories(id),
    provides_service BOOLEAN DEFAULT false, -- 0/1 이진 데이터
    service_strength_score DECIMAL(3,2) CHECK (service_strength_score >= 0 AND service_strength_score <= 1),
    evidence_source TEXT,
    last_verified_date DATE,
    confidence_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, service_category_id)
);

-- 4. 뉴스 및 이벤트 정보
CREATE TABLE news_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT, -- AI 생성 요약
    source_url VARCHAR(1000),
    source_name VARCHAR(200),
    author VARCHAR(200),
    published_date TIMESTAMP,
    crawled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type ENUM('partnership', 'funding', 'product_launch', 'regulation', 'award', 'other'),
    sentiment_score DECIMAL(3,2), -- -1.00 ~ 1.00
    importance_score DECIMAL(3,2), -- 0.00 ~ 1.00
    language VARCHAR(10) DEFAULT 'ko',
    tags TEXT[], -- PostgreSQL 배열 타입
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 기업-뉴스 연관관계
CREATE TABLE company_news_relations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    news_id INTEGER NOT NULL REFERENCES news_events(id),
    mention_type ENUM('primary', 'secondary', 'competitor_mentioned'),
    relevance_score DECIMAL(3,2), -- 0.00 ~ 1.00
    extracted_keywords TEXT[],
    ai_analysis_summary TEXT,
    impact_category ENUM('positive', 'neutral', 'negative'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, news_id)
);

-- 6. 경쟁 관계 정의
CREATE TABLE competitive_relations (
    id SERIAL PRIMARY KEY,
    company_a_id INTEGER NOT NULL REFERENCES companies(id),
    company_b_id INTEGER NOT NULL REFERENCES companies(id),
    relationship_type ENUM('direct_competitor', 'indirect_competitor', 'partner', 'supplier'),
    competition_intensity DECIMAL(3,2) CHECK (competition_intensity >= 0 AND competition_intensity <= 1),
    market_overlap_score DECIMAL(3,2), -- 서비스 중복도
    shared_service_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (company_a_id != company_b_id)
);

-- 7. 시장 트렌드 및 메트릭 (시계열 데이터)
CREATE TABLE market_trends (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    metric_type ENUM('mention_frequency', 'partnership_count', 'funding_amount', 
                     'market_share_estimate', 'service_expansion', 'customer_count'),
    metric_value DECIMAL(15,2),
    metric_unit VARCHAR(50),
    measurement_date DATE NOT NULL,
    data_source VARCHAR(200),
    confidence_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_date (company_id, measurement_date),
    INDEX idx_metric_type_date (metric_type, measurement_date)
);

-- 8. AI 분석 결과 저장
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    analysis_type ENUM('competitive_analysis', 'trend_prediction', 'opportunity_detection', 'risk_assessment'),
    target_company_id INTEGER REFERENCES companies(id),
    insight_title VARCHAR(200) NOT NULL,
    insight_content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    supporting_evidence TEXT[],
    related_news_ids INTEGER[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- 인사이트 유효기간
    is_active BOOLEAN DEFAULT true
);

-- 9. 사용자 알림 설정
CREATE TABLE user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- 향후 사용자 시스템 연동 시
    notification_type ENUM('company_update', 'competitive_alert', 'trend_change', 'new_opportunity'),
    target_company_ids INTEGER[],
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 크롤링 작업 로그
CREATE TABLE crawling_logs (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(200) NOT NULL,
    source_url VARCHAR(1000),
    crawl_status ENUM('success', 'failed', 'partial'),
    items_collected INTEGER DEFAULT 0,
    error_message TEXT,
    crawl_duration_seconds INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_news_published_date ON news_events(published_date);
CREATE INDEX idx_news_event_type ON news_events(event_type);
CREATE INDEX idx_company_news_relevance ON company_news_relations(relevance_score);
CREATE INDEX idx_market_trends_company_metric ON market_trends(company_id, metric_type);

-- 전문 검색을 위한 인덱스 (PostgreSQL Full-Text Search)
CREATE INDEX idx_news_content_search ON news_events USING gin(to_tsvector('korean', title || ' ' || content));
CREATE INDEX idx_companies_name_search ON companies USING gin(to_tsvector('korean', company_name));

-- 초기 데이터 삽입 예시
INSERT INTO esg_service_categories (category_code, main_category, sub_category, description, category_level) VALUES
('A1', 'ESG Data Management', 'Data Collection & Integration', '다양한 소스에서 ESG 데이터 수집 및 통합', 2),
('A2', 'ESG Data Management', 'Data Quality Management', 'ESG 데이터 품질 관리 및 검증', 2),
('B1', 'Carbon Accounting', 'GHG Emissions Calculation', 'Scope 1,2,3 온실가스 배출량 계산', 2),
('B2', 'Carbon Accounting', 'Product Carbon Footprint', '제품별 탄소발자국 산정', 2),
('C1', 'ESG Reporting', 'Automated Report Generation', '자동화된 ESG 보고서 생성', 2),
('C2', 'ESG Reporting', 'Regulatory Framework Compliance', 'CSRD, TCFD 등 규제 프레임워크 대응', 2);

-- 샘플 기업 데이터
INSERT INTO companies (company_name, company_name_en, company_type, founded_year, website_url, description) VALUES
('엔츠', 'AENTS', 'korean_esg_startup', 2021, 'https://aents.co', '탄소회계 플랫폼 엔스코프 운영'),
('그리너리', 'Greenery', 'korean_esg_startup', 2020, 'https://www.greenery.im', 'LCA 시스템 및 탄소크레딧 플랫폼 팝플 운영'),
('오후두시랩', 'AfternoonLab', 'korean_esg_startup', 2021, 'https://afternoonlab.co.kr', 'AI 기반 탄소관리 솔루션 그린플로 제공');