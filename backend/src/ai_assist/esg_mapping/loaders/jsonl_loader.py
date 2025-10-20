"""
JSONL 파일 스트림 로더
ESG 표준 데이터(GRI, SASB, TCFD, ESRS)를 효율적으로 로드
"""
import json
import logging
from pathlib import Path
from typing import Iterator, Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ESGStandardDocument:
    """ESG 표준 문서 데이터 클래스"""
    id: str
    framework: str  # GRI, SASB, TCFD, ESRS
    category: str  # E, S, G, Universal, etc.
    topic: str
    title: str
    title_ko: Optional[str]
    description: str
    description_ko: Optional[str]
    keywords: List[str]
    metadata: Dict[str, Any]
    
    # 추가 필드
    standard_type: Optional[str] = None
    document_version: Optional[str] = None
    required_disclosures: Optional[List[Dict[str, Any]]] = None
    
    def to_text(self, lang: str = "en") -> str:
        """
        검색용 텍스트 생성
        임베딩할 전체 컨텍스트를 단일 문자열로 결합
        
        Args:
            lang: 'en' 또는 'ko'
        """
        title = self.title_ko if lang == "ko" and self.title_ko else self.title
        desc = self.description_ko if lang == "ko" and self.description_ko else self.description
        
        # 키워드 결합
        keywords_str = ", ".join(self.keywords)
        
        # 전체 컨텍스트 생성
        text_parts = [
            f"Framework: {self.framework}",
            f"ID: {self.id}",
            f"Category: {self.category}",
            f"Topic: {self.topic}",
            f"Title: {title}",
            f"Description: {desc}",
            f"Keywords: {keywords_str}"
        ]
        
        return "\n".join(text_parts)
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환 (Chroma metadata용)"""
        return {
            "id": self.id,
            "framework": self.framework,
            "category": self.category,
            "topic": self.topic,
            "title": self.title,
            "title_ko": self.title_ko or "",
            "description": self.description[:500],  # Chroma metadata 길이 제한
            "keywords": ",".join(self.keywords[:10]),  # 최대 10개 키워드
        }


class JSONLLoader:
    """JSONL 파일 스트림 로더"""
    
    def __init__(self, file_path: Path):
        """
        Args:
            file_path: JSONL 파일 경로
        """
        self.file_path = Path(file_path)
        
        if not self.file_path.exists():
            raise FileNotFoundError(f"JSONL file not found: {file_path}")
        
        if not self.file_path.suffix == ".jsonl":
            raise ValueError(f"File must have .jsonl extension: {file_path}")
    
    def load_stream(self) -> Iterator[ESGStandardDocument]:
        """
        JSONL 파일을 스트리밍 방식으로 로드
        메모리 효율적으로 대용량 파일 처리
        
        Yields:
            ESGStandardDocument 인스턴스
        """
        logger.info(f"Loading JSONL from: {self.file_path.name}")
        
        line_count = 0
        error_count = 0
        
        # 첫 줄 메타데이터에서 추출할 기본값
        file_metadata = {}
        
        with open(self.file_path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, start=1):
                line = line.strip()
                
                # 빈 줄 또는 주석 스킵
                if not line or line.startswith("#"):
                    continue
                
                # 첫 줄은 메타데이터일 수 있음 (document_type 또는 framework만 있는 경우)
                if line_num == 1:
                    try:
                        first_line_data = json.loads(line)
                        # 메타데이터 라인 판별: id 필드가 없고 document_type/language 필드가 있음
                        if "document_type" in first_line_data or (
                            "language" in first_line_data and "id" not in first_line_data
                        ):
                            # 파일 레벨 메타데이터 저장 (framework, version, language 등)
                            file_metadata = {
                                "framework": first_line_data.get("framework", "UNKNOWN"),
                                "version": first_line_data.get("version", ""),
                                "language": first_line_data.get("language", "en"),
                            }
                            logger.debug(f"File metadata: {file_metadata}")
                            continue
                    except json.JSONDecodeError:
                        pass  # JSON 파싱 실패 시 일반 데이터로 처리
                
                try:
                    data = json.loads(line)
                    
                    # 필수 필드 검증 (framework는 선택 - 파일 메타데이터에서 가져올 수 있음)
                    if not all(k in data for k in ["id", "title", "description"]):
                        logger.warning(f"Line {line_num}: Missing required fields (id, title, description)")
                        error_count += 1
                        continue
                    
                    # framework: 라인 데이터 → 파일 메타데이터 → "UNKNOWN" 순서로 fallback
                    framework = data.get("framework") or file_metadata.get("framework", "UNKNOWN")
                    
                    # ESGStandardDocument 생성
                    doc = ESGStandardDocument(
                        id=data["id"],
                        framework=framework,
                        category=data.get("category", ""),
                        topic=data.get("topic", ""),
                        title=data["title"],
                        title_ko=data.get("title_ko"),
                        description=data["description"],
                        description_ko=data.get("description_ko"),
                        keywords=data.get("keywords") or [],  # None 대비 안전 처리
                        metadata=data.get("metadata", {}),
                        standard_type=data.get("standard_type"),
                        document_version=data.get("document_version") or file_metadata.get("version"),
                        required_disclosures=data.get("required_disclosures"),
                    )
                    
                    line_count += 1
                    yield doc
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Line {line_num}: JSON decode error: {e}")
                    error_count += 1
                    continue
                except Exception as e:
                    logger.error(f"Line {line_num}: Unexpected error: {e}")
                    error_count += 1
                    continue
        
        logger.info(f"✅ Loaded {line_count} documents from {self.file_path.name}")
        if error_count > 0:
            logger.warning(f"⚠️  Skipped {error_count} invalid lines")
    
    def load_all(self) -> List[ESGStandardDocument]:
        """
        전체 문서를 메모리에 로드
        작은 파일에만 사용 권장
        
        Returns:
            ESGStandardDocument 리스트
        """
        return list(self.load_stream())


class MultiFileJSONLLoader:
    """여러 JSONL 파일을 한 번에 로드"""
    
    def __init__(self, data_dir: Path):
        """
        Args:
            data_dir: JSONL 파일들이 있는 디렉토리
        """
        self.data_dir = Path(data_dir)
        
        if not self.data_dir.exists():
            raise FileNotFoundError(f"Data directory not found: {data_dir}")
    
    def discover_files(self) -> List[Path]:
        """디렉토리에서 모든 .jsonl 파일 검색"""
        files = list(self.data_dir.glob("*.jsonl"))
        logger.info(f"Discovered {len(files)} JSONL files in {self.data_dir}")
        return sorted(files)
    
    def load_all_frameworks(self) -> Iterator[ESGStandardDocument]:
        """
        모든 프레임워크 파일을 순차적으로 로드
        
        Yields:
            ESGStandardDocument 인스턴스
        """
        files = self.discover_files()
        
        for file_path in files:
            loader = JSONLLoader(file_path)
            yield from loader.load_stream()
    
    def load_framework(self, framework: str) -> Iterator[ESGStandardDocument]:
        """
        특정 프레임워크만 로드
        
        Args:
            framework: 'gri', 'sasb', 'tcfd', 'esrs'
            
        Yields:
            ESGStandardDocument 인스턴스
        """
        pattern = f"{framework.lower()}_*.jsonl"
        files = list(self.data_dir.glob(pattern))
        
        if not files:
            logger.warning(f"No files found for framework: {framework}")
            return
        
        for file_path in files:
            loader = JSONLLoader(file_path)
            yield from loader.load_stream()

