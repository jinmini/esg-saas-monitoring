"""add_esg_service_categories_and_mappings

Revision ID: 163711b78a10
Revises: a842237de015
Create Date: 2025-09-17 16:17:16.357719

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '163711b78a10'
down_revision: Union[str, Sequence[str], None] = 'a842237de015'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ESG 서비스 카테고리 테이블 생성
    op.create_table(
        'esg_service_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_code', sa.String(10), nullable=False),
        sa.Column('category_name', sa.String(200), nullable=False),
        sa.Column('category_name_en', sa.String(200), nullable=True),
        sa.Column('main_topic', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('category_code', name='uq_esg_service_categories_code')
    )
    
    # 회사별 서비스 매핑 테이블 생성
    op.create_table(
        'company_service_mappings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('provides_service', sa.Boolean(), nullable=False, default=False),
        sa.Column('confidence_level', sa.Float(), nullable=False, default=1.0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['esg_service_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id', 'category_id', name='uq_company_service_mapping')
    )
    
    # 인덱스 생성
    op.create_index('idx_esg_service_categories_code', 'esg_service_categories', ['category_code'])
    op.create_index('idx_esg_service_categories_topic', 'esg_service_categories', ['main_topic'])
    op.create_index('idx_company_service_mappings_company', 'company_service_mappings', ['company_id'])
    op.create_index('idx_company_service_mappings_category', 'company_service_mappings', ['category_id'])
    op.create_index('idx_company_service_mappings_provides', 'company_service_mappings', ['provides_service'])


def downgrade() -> None:
    """Downgrade schema."""
    # 인덱스 제거
    op.drop_index('idx_company_service_mappings_provides', table_name='company_service_mappings')
    op.drop_index('idx_company_service_mappings_category', table_name='company_service_mappings')
    op.drop_index('idx_company_service_mappings_company', table_name='company_service_mappings')
    op.drop_index('idx_esg_service_categories_topic', table_name='esg_service_categories')
    op.drop_index('idx_esg_service_categories_code', table_name='esg_service_categories')
    
    # 테이블 제거
    op.drop_table('company_service_mappings')
    op.drop_table('esg_service_categories')
