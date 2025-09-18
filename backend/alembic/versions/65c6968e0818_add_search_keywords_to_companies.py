"""add_search_keywords_to_companies

Revision ID: 65c6968e0818
Revises: 163711b78a10
Create Date: 2025-09-18 14:12:01.598743

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65c6968e0818'
down_revision: Union[str, Sequence[str], None] = '163711b78a10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add search-related columns to companies table
    op.add_column('companies', sa.Column('positive_keywords', sa.JSON(), nullable=True))
    op.add_column('companies', sa.Column('negative_keywords', sa.JSON(), nullable=True))
    op.add_column('companies', sa.Column('ceo_name', sa.String(100), nullable=True))
    op.add_column('companies', sa.Column('main_services', sa.String(500), nullable=True))
    op.add_column('companies', sa.Column('search_strategy', sa.String(50), nullable=True, default='enhanced'))
    op.add_column('companies', sa.Column('crawling_notes', sa.Text(), nullable=True))
    
    # Create indexes for better performance
    op.create_index('ix_companies_search_strategy', 'companies', ['search_strategy'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes first
    op.drop_index('ix_companies_search_strategy', table_name='companies')
    
    # Drop columns in reverse order
    op.drop_column('companies', 'crawling_notes')
    op.drop_column('companies', 'search_strategy')
    op.drop_column('companies', 'main_services')
    op.drop_column('companies', 'ceo_name')
    op.drop_column('companies', 'negative_keywords')
    op.drop_column('companies', 'positive_keywords')
