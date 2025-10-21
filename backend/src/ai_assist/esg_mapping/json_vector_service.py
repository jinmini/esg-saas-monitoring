"""
ESG 매핑 서비스 - JSON Vector Store 버전
ChromaDB 대신 JSON 기반 벡터 검색 사용 (완전 무료)
"""
import logging
import time
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from .schemas import (
    ESGMappingRequest,
    ESGMappingResponse,
    ESGStandardMatch,
    ESGMappingMetadata
)
from .prompts import build_esg_mapping_prompt
from .vectorstore.json_vector_store import get_json_vector_store, SearchResult
from ..core.embeddings_factory import get_embedding_service
from ..core.gemini_client import get_gemini_client

logger = logging.getLogger(__name__)

# 카테고리 표시명 매핑
CATEGORY_DISPLAY_MAP = {
    "E": "Environment",
    "S": "Social", 
    "G": "Governance",
    "GENERAL": "General",
    "OTHER": "Other"
}


class JSONVectorESGMappingService:
    """
    ESG 매핑 서비스 (JSON Vector Store)
    
    프로세스:
    1. 사용자 텍스트를 임베딩으로 변환
    2. JSON Vector Store에서 코사인 유사도 검색
    3. LLM으로 후보들을 분석하고 신뢰도 평가
    4. 최종 매칭 결과 반환
    
    장점:
    - 완전 무료 (DB 불필요)
    - 빠른 응답 (~3ms for 181 docs)
    - 간단한 배포
    """
    
    def __init__(
        self,
        json_vector_path: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ):
        """
        Args:
            json_vector_path: esg_vectors.json 파일 경로
            gemini_api_key: Gemini API 키 (None이면 환경변수)
        """
        # 임베딩 서비스 초기화 (Factory 패턴)
        logger.info("Initializing embedding service...")
        self.embeddings = get_embedding_service()
        
        # JSON Vector Store 초기화
        logger.info("Initializing JSON Vector Store...")
        self.vector_store = get_json_vector_store(json_vector_path)
        
        # Gemini 클라이언트 초기화
        logger.info("Initializing Gemini client...")
        self.gemini = get_gemini_client(api_key=gemini_api_key)
        
        logger.info("✅ JSON Vector ESG Mapping Service initialized")
    
    async def map_esg(self, request: ESGMappingRequest) -> ESGMappingResponse:
        """
        ESG 표준 매핑 메인 함수
        
        Args:
            request: ESG 매핑 요청
        
        Returns:
            ESG 매핑 응답
        """
        start_time = time.time()
        
        logger.info(f"🔍 ESG Mapping started for text: '{request.text[:50]}...'")
        
        # 1. 벡터 검색
        vector_start = time.time()
        candidates = await self._vector_search(
            text=request.text,
            frameworks=request.frameworks,
            top_k=request.top_k,
            language=request.language
        )
        vector_time = time.time() - vector_start
        
        logger.info(f"  ✓ Vector search completed: {len(candidates)} candidates ({vector_time:.3f}s)")
        
        # 2. LLM 분석
        llm_start = time.time()
        final_matches, summary = await self._llm_analysis(
            text=request.text,
            candidates=candidates,
            min_confidence=request.min_confidence
        )
        llm_time = time.time() - llm_start
        
        logger.info(f"  ✓ LLM analysis completed: {len(final_matches)} matches ({llm_time:.3f}s)")
        
        # 3. 응답 생성
        total_time = time.time() - start_time
        
        # 현재 사용 중인 임베딩 모델 이름 가져오기
        if hasattr(self.embeddings, 'model_name'):
            current_embedding_model = self.embeddings.model_name  # Gemini: "gemini-embedding-001"
        elif hasattr(self.embeddings, '_model_name'):
            current_embedding_model = self.embeddings._model_name  # E5: "intfloat/multilingual-e5-base"
        else:
            current_embedding_model = "unknown"
        
        response = ESGMappingResponse(
            type="esg_mapping",
            suggestions=final_matches,
            summary=summary,
            metadata=ESGMappingMetadata(
                model_used=self.gemini.model_name,
                embedding_model=current_embedding_model,
                candidate_count=len(candidates),
                selected_count=len(final_matches),
                processing_time=round(total_time, 3),
                vector_search_time=round(vector_time, 3),
                llm_analysis_time=round(llm_time, 3)
            )
        )
        
        logger.info(f"✅ ESG Mapping completed: {len(final_matches)} matches in {total_time:.3f}s")
        
        return response
    
    async def _vector_search(
        self,
        text: str,
        frameworks: List[str],
        top_k: int = 10,
        language: str = "ko"
    ) -> List[Dict[str, Any]]:
        """
        벡터 검색 (코사인 유사도)
        
        Args:
            text: 검색할 텍스트
            frameworks: 프레임워크 필터 (["GRI", "SASB", ...])
            top_k: 반환할 결과 수
            language: 언어 코드
        
        Returns:
            검색 결과 리스트
        """
        # 1. 텍스트 임베딩
        query_embedding = self.embeddings.embed_query(text)
        
        # 2. 벡터 검색
        search_results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            min_similarity=0.0,
            frameworks=frameworks if frameworks else None
        )
        
        # 3. 결과 변환 (VectorSearchResult는 schemas.py와 다른 내부 딕셔너리 사용)
        candidates = []
        for result in search_results:
            # LLM에 전달할 형식 (딕셔너리)
            candidate = {
                "standard_id": result.id,
                "framework": result.framework,
                "category": result.category,
                "category_display": CATEGORY_DISPLAY_MAP.get(result.category, result.category),
                "topic": result.topic,
                "title": result.title,
                "description": result.description,
                "keywords": result.keywords,
                "similarity_score": round(result.similarity, 4)
            }
            candidates.append(candidate)
        
        return candidates
    
    async def _llm_analysis(
        self,
        text: str,
        candidates: List[Dict[str, Any]],  # 딕셔너리 리스트로 변경
        min_confidence: float = 0.5
    ) -> tuple[List[ESGStandardMatch], str]:
        """
        LLM으로 후보 분석 및 신뢰도 평가
        
        Args:
            text: 원본 텍스트
            candidates: 벡터 검색 후보
            min_confidence: 최소 신뢰도
        
        Returns:
            (매칭 결과 리스트, 요약)
        """
        # 프롬프트 생성
        prompt = build_esg_mapping_prompt(
            user_text=text,
            candidates=candidates
        )
        
        # Gemini JSON 호출
        response = await asyncio.to_thread(
            self.gemini.generate_json,
            prompt=prompt
        )
        
        # DEBUG: LLM 응답 로깅
        logger.info(f"[DEBUG] LLM Response keys: {list(response.keys())}")
        matches_key = 'matches' if 'matches' in response else 'suggestions'
        logger.info(f"[DEBUG] Using key: '{matches_key}', count: {len(response.get(matches_key, []))}")
        if response.get(matches_key):
            logger.info(f"[DEBUG] First match: {response[matches_key][0]}")
        
        # 응답 파싱
        matches = []
        summary = response.get("summary", "ESG 표준 매핑이 완료되었습니다.")
        
        # LLM이 'matches' 또는 'suggestions' 중 하나로 반환
        for match_data in response.get(matches_key, []):
            # 신뢰도 필터
            confidence = match_data.get("confidence", 0.0)
            if confidence < min_confidence:
                continue
            
            # 카테고리 정규화
            category = match_data.get("category", "").upper()
            category_display = CATEGORY_DISPLAY_MAP.get(category, category)
            
            match = ESGStandardMatch(
                standard_id=match_data.get("standard_id", ""),
                framework=match_data.get("framework", ""),
                category=category,
                category_display=category_display,
                topic=match_data.get("topic", ""),
                title=match_data.get("title", ""),
                description=match_data.get("description", ""),
                confidence=round(confidence, 2),
                similarity_score=match_data.get("similarity_score", 0.0),
                reasoning=match_data.get("reasoning", "LLM 분석 결과 매칭되었습니다."),
                keywords=match_data.get("keywords", [])
            )
            matches.append(match)
        
        return matches, summary
    
    def get_vectorstore_status(self) -> Dict[str, Any]:
        """벡터 스토어 상태 조회"""
        stats = self.vector_store.get_stats()
        
        return {
            "collection_name": "json_vector_store",
            "document_count": stats["total_documents"],
            "embedding_dimension": stats["embedding_dim"],
            "embedding_model": stats["embedding_model"],
            "memory_size_mb": round(stats["memory_size_mb"], 2),
            "file_size_mb": round(stats["file_size_mb"], 2),
        }


# ============================================
# 싱글톤 인스턴스
# ============================================

_service_instance: Optional[JSONVectorESGMappingService] = None


def get_json_vector_esg_mapping_service(
    json_vector_path: Optional[str] = None,
    gemini_api_key: Optional[str] = None
) -> JSONVectorESGMappingService:
    """
    JSONVectorESGMappingService 싱글톤 인스턴스 반환
    
    Args:
        json_vector_path: JSON 파일 경로
        gemini_api_key: Gemini API 키
    
    Returns:
        JSONVectorESGMappingService 인스턴스
    """
    global _service_instance
    
    if _service_instance is None:
        _service_instance = JSONVectorESGMappingService(
            json_vector_path=json_vector_path,
            gemini_api_key=gemini_api_key
        )
    
    return _service_instance


def reset_json_vector_esg_mapping_service():
    """테스트용: 싱글톤 리셋"""
    global _service_instance
    _service_instance = None

