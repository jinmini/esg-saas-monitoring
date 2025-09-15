from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
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
