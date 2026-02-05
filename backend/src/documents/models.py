from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from src.shared.models import Base, TimestampMixin
from src.auth.models import User

class Document(Base, TimestampMixin):
    """ESG 보고서 문서 테이블"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False, index=True)
    is_template = Column(Boolean, default=False, nullable=False, index=True)
    
    user = relationship("User")
    sections = relationship("Section", back_populates="document", cascade="all, delete-orphan", order_by="Section.order")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan", order_by="desc(DocumentVersion.created_at)")
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title})>"


class Section(Base, TimestampMixin):
    """문서 섹션 테이블 (Document 직접 하위)"""
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, nullable=False, default=0)
    
    # JSONB 필드들 (프론트엔드 타입과 일치) - PostgreSQL 최적화
    blocks = Column(JSONB, nullable=False, default=[]) 
    gri_reference = Column(JSONB, nullable=True)
    # metadata는 SQLAlchemy 예약어이므로 section_metadata로 저장, Pydantic에서 alias 처리
    section_metadata = Column("metadata", JSONB, nullable=True)
    
    document = relationship("Document", back_populates="sections")
    
    def __repr__(self):
        return f"<Section(id={self.id}, title={self.title})>"


class DocumentVersion(Base, TimestampMixin):
    """문서 버전 스냅샷 테이블"""
    __tablename__ = "document_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # 버전 메타데이터
    version_number = Column(Integer, nullable=False)  # 1, 2, 3, ... (문서별 자동 증가)
    comment = Column(Text, nullable=True)  # 사용자가 입력한 변경 요약
    is_auto_saved = Column(Boolean, default=False, nullable=False, index=True)  # 자동/수동 저장 구분
    
    # 스냅샷 데이터 (JSONB for PostgreSQL 최적화)
    snapshot_data = Column(JSONB, nullable=False)  # ✅ 전체 DocumentNode JSON
    
    # 변경 통계 (Optional, 성능 최적화용)
    sections_count = Column(Integer, default=0)
    blocks_count = Column(Integer, default=0)
    chars_count = Column(Integer, default=0)
    
    # 관계 설정
    document = relationship("Document", back_populates="versions")
    author = relationship("User")
    
    # 복합 인덱스: 문서별 버전 번호 조회 최적화
    __table_args__ = (
        UniqueConstraint('document_id', 'version_number', name='uq_document_version_number'),
        Index('idx_document_versions_document_created', 'document_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<DocumentVersion(id={self.id}, doc_id={self.document_id}, v{self.version_number})>"
