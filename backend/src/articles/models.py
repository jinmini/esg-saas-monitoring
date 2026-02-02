from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.shared.models import Base, TimestampMixin

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
    image_url = Column(String(2048), nullable=True)
    
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
