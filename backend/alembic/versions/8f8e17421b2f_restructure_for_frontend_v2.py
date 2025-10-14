"""restructure_for_frontend_v2

Revision ID: 8f8e17421b2f
Revises: d828a581a091
Create Date: 2025-10-14 14:04:26.172733

프론트엔드 타입 시스템과 일치시키기 위한 구조 변경:
- Chapter 테이블 제거
- Section이 Document에 직접 연결
- Section.blocks JSONB 컬럼 추가
- Section.gri_reference, metadata JSONB 컬럼 추가
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '8f8e17421b2f'
down_revision: Union[str, Sequence[str], None] = 'd828a581a091'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Chapter 제거, Section 재구성"""
    
    # 1. 새 sections 테이블 생성 (임시)
    op.create_table(
        'sections_new',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('document_id', sa.Integer(), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False, default=0),
        sa.Column('blocks', postgresql.JSONB(), nullable=False, server_default='[]'),
        sa.Column('gri_reference', postgresql.JSONB(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False)
    )
    
    # 2. 기존 데이터 이관 (chapters.sections → sections_new)
    # Section의 content TEXT를 blocks JSONB로 변환
    op.execute("""
        INSERT INTO sections_new (document_id, title, description, "order", blocks, created_at, updated_at)
        SELECT 
            c.document_id,
            s.title,
            NULL as description,
            s."order",
            jsonb_build_array(
                jsonb_build_object(
                    'id', gen_random_uuid()::text,
                    'blockType', 'paragraph',
                    'content', jsonb_build_array(
                        jsonb_build_object(
                            'id', gen_random_uuid()::text,
                            'type', 'inline',
                            'text', COALESCE(s.content, ''),
                            'marks', '[]'::jsonb
                        )
                    )
                )
            ) as blocks,
            s.created_at,
            s.updated_at
        FROM sections s
        JOIN chapters c ON s.chapter_id = c.id
    """)
    
    # 3. 기존 테이블 삭제
    op.drop_table('sections')
    op.drop_table('chapters')
    
    # 4. 새 테이블 이름 변경
    op.rename_table('sections_new', 'sections')
    
    # 5. 인덱스 생성
    op.create_index('ix_sections_id', 'sections', ['id'], unique=False)
    op.create_index('ix_sections_document_id', 'sections', ['document_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema: 이전 구조로 복원 (복잡하므로 생략)"""
    # 롤백이 필요한 경우 수동으로 처리
    pass
