"""add_events_table

Revision ID: 191edbe4b4f9
Revises: 65c6968e0818
Create Date: 2025-09-26 23:24:31.526466

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '191edbe4b4f9'
down_revision: Union[str, Sequence[str], None] = '65c6968e0818'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # events 테이블 생성
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),  # 종료일이 없는 경우 NULL 가능
        sa.Column('category', sa.String(50), nullable=False),  # '지원사업', '정책발표', '컨퍼런스', '공시마감' 등
        sa.Column('source_url', sa.String(2048), nullable=True),  # 원문 링크
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 인덱스 생성 (조회 성능 향상)
    op.create_index('idx_events_start_date', 'events', ['start_date'])
    op.create_index('idx_events_category', 'events', ['category'])
    op.create_index('idx_events_id', 'events', ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    # 인덱스 제거
    op.drop_index('idx_events_id', table_name='events')
    op.drop_index('idx_events_category', table_name='events')
    op.drop_index('idx_events_start_date', table_name='events')
    
    # 테이블 제거
    op.drop_table('events')
