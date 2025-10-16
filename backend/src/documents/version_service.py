"""
Version Management Service
문서 버전 관리 비즈니스 로직
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status

from src.shared.models import Document, Section, DocumentVersion
from .version_schemas import VersionCreate, VersionMetadata, VersionResponse


class VersionService:
    """버전 관리 서비스"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_version(
        self,
        document_id: int,
        author_id: Optional[int],
        data: VersionCreate
    ) -> DocumentVersion:
        """
        문서 버전 스냅샷 생성
        
        Args:
            document_id: 문서 ID
            author_id: 작성자 ID (JWT에서 추출)
            data: 버전 생성 요청 데이터
        
        Returns:
            생성된 DocumentVersion 객체
        """
        # 1. 현재 문서 조회
        stmt = (
            select(Document)
            .where(Document.id == document_id)
        )
        result = await self.db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
        
        # 2. 문서의 sections 로드
        await self.db.refresh(document, ['sections'])
        
        # 3. 다음 버전 번호 계산
        stmt = select(func.max(DocumentVersion.version_number)).where(
            DocumentVersion.document_id == document_id
        )
        result = await self.db.execute(stmt)
        max_version = result.scalar() or 0
        next_version = max_version + 1
        
        # 4. 스냅샷 데이터 생성 (DocumentNode → JSON)
        snapshot_data = {
            "id": str(document.id),
            "title": document.title,
            "description": document.description,
            "sections": [
                {
                    "id": str(section.id),
                    "title": section.title,
                    "description": section.description,
                    "order": section.order,
                    "blocks": section.blocks,
                    "griReference": section.gri_reference,
                    "metadata": section.section_metadata,
                }
                for section in document.sections
            ],
            "metadata": {
                "createdAt": document.created_at.isoformat(),
                "updatedAt": document.updated_at.isoformat(),
                "isPublic": document.is_public,
                "isTemplate": document.is_template,
            }
        }
        
        # 5. 통계 계산 (안전한 키 접근)
        sections_count = len(document.sections)
        blocks_count = sum(len(s.blocks) for s in document.sections)
        
        # chars_count: 텍스트 블록만 카운트 (안전하게)
        chars_count = 0
        for section in document.sections:
            for block in section.blocks:
                if isinstance(block, dict):
                    # content 배열의 text 필드 합산
                    content = block.get("content", [])
                    if isinstance(content, list):
                        for inline in content:
                            if isinstance(inline, dict):
                                chars_count += len(inline.get("text", ""))
        
        # 6. 버전 생성
        version = DocumentVersion(
            document_id=document_id,
            author_id=author_id,
            version_number=next_version,
            comment=data.comment,
            is_auto_saved=data.is_auto_saved,
            snapshot_data=snapshot_data,
            sections_count=sections_count,
            blocks_count=blocks_count,
            chars_count=chars_count,
        )
        
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        
        return version
    
    async def list_versions(
        self,
        document_id: int,
        skip: int = 0,
        limit: int = 50,
        include_auto_saved: bool = True
    ) -> Tuple[List[DocumentVersion], int, bool, bool]:
        """
        버전 목록 조회
        
        Returns:
            (versions, total, has_next, has_prev)
        """
        stmt = (
            select(DocumentVersion)
            .where(DocumentVersion.document_id == document_id)
            .order_by(DocumentVersion.created_at.desc())
        )
        
        if not include_auto_saved:
            stmt = stmt.where(DocumentVersion.is_auto_saved == False)
        
        # 총 개수 계산
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.db.execute(count_stmt)
        total = total_result.scalar() or 0
        
        # 페이지네이션
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        versions = result.scalars().all()
        
        # has_next, has_prev 계산
        has_next = (skip + limit) < total
        has_prev = skip > 0
        
        return versions, total, has_next, has_prev
    
    async def get_version(self, version_id: int) -> Optional[DocumentVersion]:
        """특정 버전 조회"""
        stmt = select(DocumentVersion).where(DocumentVersion.id == version_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def restore_version(
        self,
        document_id: int,
        version_id: int,
        author_id: Optional[int]
    ) -> Dict[str, Any]:
        """
        문서를 특정 버전으로 복원
        
        Args:
            document_id: 문서 ID
            version_id: 복원할 버전 ID
            author_id: 작성자 ID
        
        Returns:
            {
                "version_number": 복원된 버전 번호,
                "backup_version_number": 복원 전 백업 버전 번호,
                "document": 복원된 문서 객체
            }
        """
        # 1. 버전 조회
        version = await self.get_version(version_id)
        if not version or version.document_id != document_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Version {version_id} not found"
            )
        
        # 2. 현재 문서 상태를 새 버전으로 저장 (복원 전 자동 백업)
        backup_version = await self.create_version(
            document_id,
            author_id,
            VersionCreate(
                comment=f"Auto-backup before restore to v{version.version_number}",
                is_auto_saved=True
            )
        )
        
        # 3. 현재 문서 조회
        stmt = select(Document).where(Document.id == document_id)
        result = await self.db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found"
            )
        
        await self.db.refresh(document, ['sections'])
        
        # 4. 스냅샷 데이터 추출
        snapshot = version.snapshot_data
        
        # 5. 기존 섹션 삭제 (ORM cascade 활용)
        document.sections.clear()
        await self.db.flush()  # ✅ 명시적 flush로 삭제 반영
        
        # 6. 스냅샷에서 섹션 복원
        for section_data in snapshot.get("sections", []):
            section = Section(
                document_id=document_id,
                title=section_data.get("title", ""),
                description=section_data.get("description"),
                order=section_data.get("order", 0),
                blocks=section_data.get("blocks", []),
                gri_reference=section_data.get("griReference"),
                section_metadata=section_data.get("metadata"),
            )
            document.sections.append(section)
        
        # 7. 문서 메타데이터 업데이트
        document.title = snapshot.get("title", document.title)
        document.description = snapshot.get("description", document.description)
        
        # 8. 커밋 및 refresh
        await self.db.commit()
        await self.db.refresh(document, ['sections'])
        
        return {
            "version_number": version.version_number,
            "backup_version_number": backup_version.version_number,
            "document": document
        }
    
    async def delete_version(
        self,
        version_id: int,
        user_id: Optional[int]
    ) -> bool:
        """
        버전 삭제 (최신 버전 제외)
        
        Args:
            version_id: 삭제할 버전 ID
            user_id: 요청한 사용자 ID
        
        Returns:
            성공 여부
        """
        version = await self.get_version(version_id)
        if not version:
            return False
        
        # 최신 버전인지 확인
        stmt = (
            select(func.max(DocumentVersion.version_number))
            .where(DocumentVersion.document_id == version.document_id)
        )
        result = await self.db.execute(stmt)
        max_version = result.scalar()
        
        if version.version_number == max_version:
            return False  # 최신 버전은 삭제 불가
        
        # 권한 체크 (author_id or admin)
        if user_id and version.author_id and version.author_id != user_id:
            # TODO: 관리자 권한 체크 (RBAC 적용 시)
            return False
        
        await self.db.delete(version)
        await self.db.commit()
        return True
    
    async def compare_versions(
        self,
        document_id: int,
        source_version_id: int,
        target_version_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        두 버전 간 차이점 비교
        
        Args:
            document_id: 문서 ID
            source_version_id: 비교 기준 버전 ID
            target_version_id: 비교 대상 버전 ID (None이면 현재 문서)
        
        Returns:
            차이점 정보 (VersionDiffResponse 형식)
        """
        from sqlalchemy import select
        from src.shared.models import Document
        
        # 1. Source 버전 가져오기
        source_version = await self.get_version(source_version_id)
        if not source_version or source_version.document_id != document_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source version {source_version_id} not found"
            )
        
        source_snapshot = source_version.snapshot_data
        
        # 2. Target 버전/문서 가져오기
        if target_version_id:
            target_version = await self.get_version(target_version_id)
            if not target_version or target_version.document_id != document_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Target version {target_version_id} not found"
                )
            target_snapshot = target_version.snapshot_data
            target_version_number = target_version.version_number
        else:
            # 현재 문서 상태를 가져옴
            from sqlalchemy.orm import selectinload
            
            stmt = select(Document).options(
                selectinload(Document.sections)
            ).where(Document.id == document_id)
            result = await self.db.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Document {document_id} not found"
                )
            
            # 현재 문서를 snapshot 형식으로 변환
            target_snapshot = self._document_to_snapshot(document)
            target_version_number = None
        
        # 3. Diff 계산
        diff_result = self._calculate_diff(source_snapshot, target_snapshot)
        
        return {
            "source_version": source_version.version_number,
            "target_version": target_version_number,
            **diff_result
        }
    
    def _calculate_diff(self, source: Dict, target: Dict) -> Dict[str, Any]:
        """
        두 스냅샷 간 차이 계산
        
        Args:
            source: 비교 기준 스냅샷
            target: 비교 대상 스냅샷
        
        Returns:
            차이점 통계 및 상세 정보
        """
        # Section 식별: id 우선, fallback으로 title 사용
        def make_section_key(section: Dict) -> str:
            return str(section.get("id") or section.get("title"))
        
        source_sections = {make_section_key(s): s for s in source.get("sections", [])}
        target_sections = {make_section_key(s): s for s in target.get("sections", [])}
        
        sections_added = []
        sections_removed = []
        sections_modified = []
        
        total_blocks_added = 0
        total_blocks_removed = 0
        total_blocks_modified = 0
        total_chars_changed = 0
        
        # 섹션별 비교
        all_section_titles = set(source_sections.keys()) | set(target_sections.keys())
        
        for title in all_section_titles:
            source_section = source_sections.get(title)
            target_section = target_sections.get(title)
            
            if not source_section:
                # 새로 추가된 섹션
                section_title = target_section.get("title", title) if target_section else title
                sections_added.append(section_title)
                if target_section:
                    total_blocks_added += len(target_section.get("blocks", []))
            elif not target_section:
                # 삭제된 섹션
                section_title = source_section.get("title", title)
                sections_removed.append(section_title)
                total_blocks_removed += len(source_section.get("blocks", []))
            else:
                # 변경된 섹션 검사
                source_blocks = source_section.get("blocks", [])
                target_blocks = target_section.get("blocks", [])
                
                section_diff = self._compare_blocks(source_blocks, target_blocks)
                
                if section_diff["has_changes"]:
                    sections_modified.append({
                        "section_id": target_section.get("id", title),
                        "section_title": title,
                        "changes": {
                            "blocks_added": section_diff["blocks_added"],
                            "blocks_removed": section_diff["blocks_removed"],
                            "blocks_modified": section_diff["blocks_modified"],
                        }
                    })
                    total_blocks_added += section_diff["blocks_added"]
                    total_blocks_removed += section_diff["blocks_removed"]
                    total_blocks_modified += section_diff["blocks_modified"]
                    total_chars_changed += section_diff["chars_changed"]
        
        return {
            "sections_added": sections_added,
            "sections_removed": sections_removed,
            "sections_modified": sections_modified,
            "blocks_added": total_blocks_added,
            "blocks_removed": total_blocks_removed,
            "blocks_modified": total_blocks_modified,
            "chars_changed": total_chars_changed,
        }
    
    def _compare_blocks(self, source_blocks: list, target_blocks: list) -> Dict[str, Any]:
        """
        블록 레벨 비교
        
        Args:
            source_blocks: 원본 블록 리스트
            target_blocks: 대상 블록 리스트
        
        Returns:
            블록 변경 통계
        """
        # 성능 최적화: 동일한 경우 조기 종료
        if len(source_blocks) == len(target_blocks) and source_blocks == target_blocks:
            return {
                "has_changes": False,
                "blocks_added": 0,
                "blocks_removed": 0,
                "blocks_modified": 0,
                "chars_changed": 0,
            }
        
        source_block_ids = {b.get("id"): b for b in source_blocks}
        target_block_ids = {b.get("id"): b for b in target_blocks}
        
        blocks_added = 0
        blocks_removed = 0
        blocks_modified = 0
        chars_changed = 0
        
        all_block_ids = set(source_block_ids.keys()) | set(target_block_ids.keys())
        
        for block_id in all_block_ids:
            source_block = source_block_ids.get(block_id)
            target_block = target_block_ids.get(block_id)
            
            if not source_block:
                blocks_added += 1
                # 추가된 블록의 텍스트 길이
                if target_block:
                    chars_changed += self._count_block_chars(target_block)
            elif not target_block:
                blocks_removed += 1
                # 삭제된 블록의 텍스트 길이
                chars_changed += self._count_block_chars(source_block)
            else:
                # 블록 내용 비교 (중요 필드만)
                if not self._blocks_equal(source_block, target_block):
                    blocks_modified += 1
                    # 변경된 텍스트 길이 근사치
                    source_chars = self._count_block_chars(source_block)
                    target_chars = self._count_block_chars(target_block)
                    chars_changed += abs(target_chars - source_chars)
        
        has_changes = (blocks_added + blocks_removed + blocks_modified) > 0
        
        return {
            "has_changes": has_changes,
            "blocks_added": blocks_added,
            "blocks_removed": blocks_removed,
            "blocks_modified": blocks_modified,
            "chars_changed": chars_changed,
        }
    
    def _blocks_equal(self, a: Dict, b: Dict) -> bool:
        """
        두 블록이 동일한지 중요 필드만 비교
        
        Args:
            a: 블록 A
            b: 블록 B
        
        Returns:
            동일 여부
        """
        # blockType 비교
        if a.get("blockType") != b.get("blockType"):
            return False
        
        # content 비교 (핵심 내용)
        if a.get("content") != b.get("content"):
            return False
        
        # 블록 타입별 추가 속성 비교
        block_type = a.get("blockType")
        if block_type == "heading":
            if a.get("level") != b.get("level"):
                return False
        elif block_type in ("list", "orderedList"):
            if a.get("items") != b.get("items"):
                return False
        
        return True
    
    def _count_block_chars(self, block: Dict) -> int:
        """
        블록의 텍스트 문자 수 계산
        
        Args:
            block: 블록 객체
        
        Returns:
            문자 수
        """
        content = block.get("content", [])
        total_chars = 0
        
        for item in content:
            if isinstance(item, dict):
                text = item.get("text", "")
                total_chars += len(text)
        
        return total_chars
    
    def _document_to_snapshot(self, document) -> Dict[str, Any]:
        """
        Document 객체를 snapshot 형식으로 변환
        
        Args:
            document: Document ORM 객체
        
        Returns:
            Snapshot 딕셔너리
        """
        return {
            "title": document.title,
            "sections": [
                {
                    "id": section.id,
                    "title": section.title,
                    "order": section.order,
                    "blocks": section.blocks,
                    "griReference": section.gri_reference,
                    "metadata": section.section_metadata,
                }
                for section in document.sections
            ]
        }

