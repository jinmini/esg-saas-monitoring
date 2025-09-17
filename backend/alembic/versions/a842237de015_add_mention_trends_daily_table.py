"""add_mention_trends_daily_table

Revision ID: a842237de015
Revises: 1967ec967fa5
Create Date: 2025-09-17 11:00:44.275612

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a842237de015'
down_revision: Union[str, Sequence[str], None] = '1967ec967fa5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 일일 언급량 집계 테이블 생성
    op.create_table(
        'mention_trends_daily',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('mention_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # 인덱스 생성
    op.create_index('idx_mention_trends_daily_company_date', 'mention_trends_daily', ['company_id', 'date'])
    op.create_index('idx_mention_trends_daily_date', 'mention_trends_daily', ['date'])
    
    # 유니크 제약조건 추가 (회사별 일자별 중복 방지)
    op.create_unique_constraint('uq_mention_trends_daily_company_date', 'mention_trends_daily', ['company_id', 'date'])


def downgrade() -> None:
    """Downgrade schema."""
    # 인덱스 제거
    op.drop_index('idx_mention_trends_daily_date', table_name='mention_trends_daily')
    op.drop_index('idx_mention_trends_daily_company_date', table_name='mention_trends_daily')
    
    # 테이블 제거
    op.drop_table('mention_trends_daily')
