from sqlalchemy import Column, Integer, String, Text, Date
from src.shared.models import Base, TimestampMixin

class Event(Base, TimestampMixin):
    """ESG 액션 캘린더 이벤트 테이블"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)  # 종료일이 없는 경우 NULL 가능
    category = Column(String(50), nullable=False, index=True)  # '지원사업', '정책발표', '컨퍼런스', '공시마감' 등
    source_url = Column(String(2048), nullable=True)  # 원문 링크
    
    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title}, start_date={self.start_date}, category={self.category})>"
