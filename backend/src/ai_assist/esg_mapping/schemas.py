"""
ESG 매핑 API 스키마
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class ESGMappingRequest(BaseModel):
    """ESG 매핑 요청"""
    
    text: str = Field(..., min_length=10, max_length=10000, description="매핑할 텍스트")
    document_id: int = Field(..., description="문서 ID")
    section_id: Optional[int] = Field(None, description="섹션 ID")
    block_id: Optional[str] = Field(None, description="블록 ID (frontend UUID)")
    
    # 검색 옵션
    frameworks: Optional[List[str]] = Field(
        default=None,
        description="검색할 프레임워크 (예: ['GRI', 'SASB']). None이면 전체 검색"
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="반환할 최대 매핑 수"
    )
    min_confidence: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="최소 신뢰도 임계값"
    )
    
    # 언어 설정
    language: str = Field(
        default="ko",
        description="응답 언어 (ko 또는 en)"
    )
    
    @field_validator("frameworks")
    @classmethod
    def validate_frameworks(cls, v):
        """프레임워크 검증 (Pydantic v2)"""
        if v is not None:
            allowed = {"GRI", "SASB", "TCFD", "ESRS"}
            invalid = set(v) - allowed
            if invalid:
                raise ValueError(f"Invalid frameworks: {invalid}. Allowed: {allowed}")
        return v
    
    @field_validator("language")
    @classmethod
    def validate_language(cls, v):
        """언어 검증 (Pydantic v2)"""
        if v not in ["ko", "en"]:
            raise ValueError("Language must be 'ko' or 'en'")
        return v


class ESGStandardMatch(BaseModel):
    """ESG 표준 매칭 결과"""
    
    standard_id: str = Field(..., description="표준 ID (예: GRI 305-1)")
    framework: str = Field(..., description="프레임워크 (GRI, SASB, TCFD, ESRS)")
    category: str = Field(..., description="카테고리 (E, S, G 등)")
    category_display: str = Field(..., description="카테고리 표시명 (Environment, Social, Governance)")
    topic: str = Field(..., description="주제")
    title: str = Field(..., description="표준 제목")
    description: str = Field(..., description="표준 설명")
    
    # 매칭 정보
    confidence: float = Field(..., ge=0.0, le=1.0, description="매칭 신뢰도 (0-1)")
    similarity_score: float = Field(..., description="벡터 유사도 점수")
    reasoning: str = Field(..., description="매칭 이유 (LLM 생성)")
    
    # 추가 정보
    keywords: List[str] = Field(default_factory=list, description="키워드 목록")


class ESGMappingMetadata(BaseModel):
    """ESG 매핑 메타데이터 (표준화)"""
    
    processing_time: float = Field(..., description="총 처리 시간 (초)")
    vector_search_time: float = Field(..., description="벡터 검색 시간 (초)")
    llm_analysis_time: float = Field(..., description="LLM 분석 시간 (초)")
    candidate_count: int = Field(..., description="벡터 검색 후보 수")
    selected_count: int = Field(..., description="LLM 선택 결과 수")
    model_used: str = Field(..., description="사용된 LLM 모델")
    embedding_model: str = Field(..., description="사용된 임베딩 모델")


class ESGMappingResponse(BaseModel):
    """ESG 매핑 응답"""
    
    type: str = Field(default="esg_mapping", description="응답 타입")
    
    # 매칭 결과
    suggestions: List[ESGStandardMatch] = Field(
        ...,
        description="매칭된 ESG 표준 목록"
    )
    
    # 표준화된 메타데이터
    metadata: ESGMappingMetadata = Field(
        ...,
        description="처리 메타데이터"
    )
    
    # 요약 정보
    summary: Optional[str] = Field(
        None,
        description="전체 매칭 결과 요약 (LLM 생성)"
    )


class ESGMappingSummary(BaseModel):
    """ESG 매핑 요약 정보"""
    
    total_matches: int = Field(..., description="총 매칭 수")
    frameworks_found: List[str] = Field(..., description="발견된 프레임워크 목록")
    avg_confidence: float = Field(..., description="평균 신뢰도")
    top_category: str = Field(..., description="가장 많이 매칭된 카테고리")


# 내부 사용 스키마
class VectorSearchResult(BaseModel):
    """벡터 검색 결과 (내부)"""
    
    id: str
    document: str
    metadata: Dict[str, Any]
    distance: float
    similarity: float  # 1 - distance (정규화된 유사도)


class LLMAnalysisRequest(BaseModel):
    """LLM 분석 요청 (내부)"""
    
    user_text: str
    candidates: List[VectorSearchResult]
    language: str = "ko"


class LLMAnalysisResponse(BaseModel):
    """LLM 분석 응답 (내부)"""
    
    matches: List[Dict[str, Any]]
    summary: Optional[str] = None

