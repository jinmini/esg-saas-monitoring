from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Date, Float, UniqueConstraint, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class TimestampMixin:
    """타임스탬프 공통 mixin"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class User(Base, TimestampMixin):
    """사용자 정보 테이블"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    user_name = Column(String(100), nullable=True)
    auth_provider = Column(String(50), nullable=False)  # 'google', 'kakao'
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, provider={self.auth_provider})>"


class Company(Base, TimestampMixin):
    """모니터링 대상 기업 정보 테이블"""
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), unique=True, nullable=False, index=True)
    domain_url = Column(String(255), nullable=True)
    
    # 미래 확장을 위한 추가 필드들 (nullable로 설정)
    company_name_en = Column(String(200), nullable=True)
    website_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # 관계 설정
    articles = relationship("Article", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company(id={self.id}, name={self.company_name})>"


class Article(Base, TimestampMixin):
    """수집된 기사 정보 테이블"""
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    title = Column(Text, nullable=False)
    source_name = Column(String(100), nullable=True)
    article_url = Column(Text, unique=True, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    crawled_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # 미래 확장을 위한 추가 필드들 (nullable로 설정)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)  # AI 생성 요약
    author = Column(String(200), nullable=True)
    language = Column(String(10), default='ko', nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # 관계 설정
    company = relationship("Company", back_populates="articles")
    
    def __repr__(self):
        return f"<Article(id={self.id}, title={self.title[:50]}...)>"


class MentionTrendDaily(Base, TimestampMixin):
    """일일 언급량 집계 테이블 (성능 최적화용)"""
    __tablename__ = "mention_trends_daily"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    mention_count = Column(Integer, nullable=False, default=0)
    
    # 관계 설정
    company = relationship("Company")
    
    # 복합 유니크 제약조건 (회사별 일자별 중복 방지)
    __table_args__ = (
        UniqueConstraint('company_id', 'date', name='uq_mention_trends_daily_company_date'),
        Index('idx_mention_trends_daily_company_date', 'company_id', 'date'),
    )
    
    def __repr__(self):
        return f"<MentionTrendDaily(company_id={self.company_id}, date={self.date}, count={self.mention_count})>"


class ESGServiceCategory(Base, TimestampMixin):
    """ESG 서비스 카테고리 정의 테이블"""
    __tablename__ = "esg_service_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    category_code = Column(String(10), unique=True, nullable=False, index=True)  # A1, A2, B1, etc.
    category_name = Column(String(200), nullable=False)
    category_name_en = Column(String(200), nullable=True)
    main_topic = Column(String(100), nullable=False, index=True)  # Data Collection, Carbon Accounting, etc.
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # 관계 설정
    company_mappings = relationship("CompanyServiceMapping", back_populates="category", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ESGServiceCategory(code={self.category_code}, name={self.category_name})>"


class CompanyServiceMapping(Base, TimestampMixin):
    """회사별 서비스 제공 여부 매핑 테이블 (이진 매트릭스)"""
    __tablename__ = "company_service_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("esg_service_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    provides_service = Column(Boolean, default=False, nullable=False, index=True)  # 0 or 1
    confidence_level = Column(Float, default=1.0, nullable=False)  # 0.0-1.0 (향후 AI 분석용)
    
    # 관계 설정
    company = relationship("Company")
    category = relationship("ESGServiceCategory", back_populates="company_mappings")
    
    # 복합 유니크 제약조건 (회사별 카테고리별 중복 방지)
    __table_args__ = (
        UniqueConstraint('company_id', 'category_id', name='uq_company_service_mapping'),
    )
    
    def __repr__(self):
        return f"<CompanyServiceMapping(company_id={self.company_id}, category_id={self.category_id}, provides={self.provides_service})>"
