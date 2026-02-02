from sqlalchemy import Column, Integer, String
from src.shared.models import Base, TimestampMixin

class User(Base, TimestampMixin):
    """사용자 정보 테이블"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    user_name = Column(String(100), nullable=True)
    auth_provider = Column(String(50), nullable=False)  # 'google', 'kakao'
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, provider={self.auth_provider})>"
