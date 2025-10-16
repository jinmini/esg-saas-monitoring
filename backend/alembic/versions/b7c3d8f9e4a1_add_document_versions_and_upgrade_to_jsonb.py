"""add document versions and upgrade to jsonb

Revision ID: b7c3d8f9e4a1
Revises: 8f8e17421b2f
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b7c3d8f9e4a1'
down_revision = '8f8e17421b2f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. sections 테이블의 JSON → JSONB 변환
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN blocks TYPE JSONB USING blocks::JSONB
    ''')
    
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN gri_reference TYPE JSONB USING gri_reference::JSONB
    ''')
    
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN metadata TYPE JSONB USING metadata::JSONB
    ''')
    
    # 2. created_at 컬럼에 index 추가 (TimestampMixin 개선)
    op.create_index('ix_documents_created_at', 'documents', ['created_at'])
    op.create_index('ix_sections_created_at', 'sections', ['created_at'])
    
    # 3. document_versions 테이블 생성
    op.create_table(
        'document_versions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('is_auto_saved', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('snapshot_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('sections_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('blocks_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('chars_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('document_id', 'version_number', name='uq_document_version_number')
    )
    
    # 4. document_versions 인덱스 생성
    op.create_index('ix_document_versions_id', 'document_versions', ['id'])
    op.create_index('ix_document_versions_document_id', 'document_versions', ['document_id'])
    op.create_index('ix_document_versions_author_id', 'document_versions', ['author_id'])
    op.create_index('ix_document_versions_is_auto_saved', 'document_versions', ['is_auto_saved'])
    op.create_index('ix_document_versions_created_at', 'document_versions', ['created_at'])
    op.create_index('idx_document_versions_document_created', 'document_versions', ['document_id', 'created_at'])


def downgrade() -> None:
    # 1. document_versions 테이블 삭제
    op.drop_index('idx_document_versions_document_created', table_name='document_versions')
    op.drop_index('ix_document_versions_created_at', table_name='document_versions')
    op.drop_index('ix_document_versions_is_auto_saved', table_name='document_versions')
    op.drop_index('ix_document_versions_author_id', table_name='document_versions')
    op.drop_index('ix_document_versions_document_id', table_name='document_versions')
    op.drop_index('ix_document_versions_id', table_name='document_versions')
    op.drop_table('document_versions')
    
    # 2. created_at index 제거
    op.drop_index('ix_sections_created_at', table_name='sections')
    op.drop_index('ix_documents_created_at', table_name='documents')
    
    # 3. JSONB → JSON 복원
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN metadata TYPE JSON USING metadata::JSON
    ''')
    
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN gri_reference TYPE JSON USING gri_reference::JSON
    ''')
    
    op.execute('''
        ALTER TABLE sections 
        ALTER COLUMN blocks TYPE JSON USING blocks::JSON
    ''')

