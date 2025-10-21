"""
ESG 매핑 서비스
RAG 기반 ESG 표준 매칭 로직
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
    ESGMappingMetadata,
    VectorSearchResult
)
from .prompts import build_esg_mapping_prompt

# ChromaDB는 선택적 의존성 (USE_JSON_VECTOR_STORE=false일 때만)
try:
    from .vectorstore.chroma_manager import ChromaManager, E5EmbeddingFunction
    from .vectorstore.embed_pipeline import ESGEmbeddingPipeline
    _chroma_available = True
except ImportError:
    _chroma_available = False
    ChromaManager = None
    E5EmbeddingFunction = None
    ESGEmbeddingPipeline = None

from ..core.embeddings import get_embeddings
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


class ESGMappingService:
    """
    ESG 매핑 서비스
    
    프로세스:
    1. 사용자 텍스트를 임베딩으로 변환
    2. Chroma에서 유사한 ESG 표준 검색
    3. LLM으로 후보들을 분석하고 신뢰도 평가
    4. 최종 매칭 결과 반환
    """
    
    def __init__(
        self,
        chroma_persist_dir: Path = Path("./data/chroma"),
        collection_name: str = "esg_standards",
        gemini_api_key: Optional[str] = None
    ):
        """
        Args:
            chroma_persist_dir: ChromaDB 저장 경로
            collection_name: 컬렉션 이름
            gemini_api_key: Gemini API 키 (None이면 환경변수)
        """
        self.chroma_persist_dir = chroma_persist_dir
        self.collection_name = collection_name
        
        # 임베딩 모델 초기화
        logger.info("Initializing embedding model...")
        self.embeddings = get_embeddings()
        
        # ChromaDB 초기화
        logger.info("Initializing ChromaDB...")
        embedding_function = E5EmbeddingFunction(self.embeddings)
        self.chroma = ChromaManager(
            persist_directory=str(chroma_persist_dir),
            collection_name=collection_name,
            embedding_function=embedding_function
        )
        
        # Gemini 클라이언트 초기화
        logger.info("Initializing Gemini client...")
        self.gemini = get_gemini_client(api_key=gemini_api_key)
        
        logger.info("✅ ESG Mapping Service initialized")
    
    async def map_esg(self, request: ESGMappingRequest) -> ESGMappingResponse:
        """
        ESG 매핑 메인 로직
        
        Args:
            request: ESG 매핑 요청
            
        Returns:
            ESG 매핑 응답
        """
        start_time = time.time()
        vector_search_start = start_time
        
        logger.info(f"ESG Mapping started for text: {request.text[:100]}...")
        
        try:
            # 1단계: 벡터 검색으로 후보 찾기
            candidates = await self._vector_search(
                text=request.text,
                frameworks=request.frameworks,
                top_k=min(request.top_k * 2, 20)  # 후보는 더 많이 검색
            )
            
            vector_search_time = time.time() - vector_search_start
            
            if not candidates:
                logger.warning("No candidates found in vector search")
                metadata = ESGMappingMetadata(
                    processing_time=round(time.time() - start_time, 3),
                    vector_search_time=round(vector_search_time, 3),
                    llm_analysis_time=0.0,
                    candidate_count=0,
                    selected_count=0,
                    model_used=self.gemini.model_name,
                    embedding_model="intfloat/multilingual-e5-large"
                )
                return ESGMappingResponse(
                    suggestions=[],
                    metadata=metadata
                )
            
            # 2단계: LLM으로 후보 분석 및 신뢰도 평가
            llm_analysis_start = time.time()
            llm_result = await self._llm_analysis(
                user_text=request.text,
                candidates=candidates,
                language=request.language
            )
            llm_analysis_time = time.time() - llm_analysis_start
            
            # 3단계: 결과 필터링 및 포맷팅
            suggestions = self._format_suggestions(
                llm_matches=llm_result.get("matches", []),
                candidates=candidates,
                min_confidence=request.min_confidence,
                top_k=request.top_k
            )
            
            # 표준화된 메타데이터 생성
            processing_time = time.time() - start_time
            metadata = ESGMappingMetadata(
                processing_time=round(processing_time, 3),
                vector_search_time=round(vector_search_time, 3),
                llm_analysis_time=round(llm_analysis_time, 3),
                candidate_count=len(candidates),
                selected_count=len(suggestions),
                model_used=self.gemini.model_name,
                embedding_model="intfloat/multilingual-e5-large"
            )
            
            logger.info(f"✅ ESG Mapping complete: {len(suggestions)} matches in {processing_time:.2f}s")
            
            return ESGMappingResponse(
                suggestions=suggestions,
                metadata=metadata,
                summary=llm_result.get("summary")
            )
            
        except Exception as e:
            logger.error(f"ESG Mapping failed: {e}", exc_info=True)
            raise
    
    async def _vector_search(
        self,
        text: str,
        frameworks: Optional[List[str]],
        top_k: int
    ) -> List[VectorSearchResult]:
        """
        벡터 검색으로 유사한 ESG 표준 찾기
        
        Args:
            text: 검색 쿼리 텍스트
            frameworks: 필터링할 프레임워크
            top_k: 반환할 결과 수
            
        Returns:
            VectorSearchResult 리스트
        """
        logger.info(f"Vector search: top_k={top_k}, frameworks={frameworks}")
        
        # 쿼리 임베딩 (비동기 처리)
        query_embedding = await asyncio.to_thread(self.embeddings.embed_query, text)
        
        # 프레임워크 필터
        where_filter = None
        if frameworks:
            # Chroma where 필터: {"framework": {"$in": ["GRI", "SASB"]}}
            where_filter = {"framework": {"$in": frameworks}}
        
        # Chroma 검색 (비동기 처리)
        results = await asyncio.to_thread(
            self.chroma.search,
            query_embedding=query_embedding,
            n_results=top_k,
            where=where_filter
        )
        
        # 결과 파싱
        candidates = []
        if results["ids"] and results["ids"][0]:
            for i in range(len(results["ids"][0])):
                distance = results["distances"][0][i]
                # 거리를 유사도로 변환
                # Chroma 기본 metric이 cosine인 경우: distance = 1 - cosine_similarity
                # 따라서 similarity = 1 - distance (정확한 변환)
                # 만약 L2 distance라면 1 / (1 + distance) 사용
                similarity = 1.0 - distance  # Cosine distance 가정
                
                candidate = VectorSearchResult(
                    id=results["ids"][0][i],
                    document=results["documents"][0][i],
                    metadata=results["metadatas"][0][i],
                    distance=distance,
                    similarity=similarity
                )
                candidates.append(candidate)
        
        logger.info(f"Found {len(candidates)} candidates")
        return candidates
    
    async def _llm_analysis(
        self,
        user_text: str,
        candidates: List[VectorSearchResult],
        language: str
    ) -> Dict[str, Any]:
        """
        LLM으로 후보 표준들을 분석하고 신뢰도 평가
        
        Args:
            user_text: 사용자 텍스트
            candidates: 벡터 검색 후보들
            language: 응답 언어
            
        Returns:
            LLM 분석 결과 (matches, summary)
        """
        logger.info(f"LLM analysis: {len(candidates)} candidates")
        
        # 프롬프트 생성
        candidates_data = [
            {
                "metadata": c.metadata,
                "similarity": c.similarity,
                "document": c.document
            }
            for c in candidates
        ]
        
        prompt = build_esg_mapping_prompt(
            user_text=user_text,
            candidates=candidates_data,
            language=language
        )
        
        # Gemini 호출 (비동기 처리)
        try:
            response = await asyncio.to_thread(self.gemini.generate_json, prompt)
            logger.info(f"LLM returned {len(response.get('matches', []))} matches")
            return response
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            # Fallback: 벡터 유사도만 사용
            return self._fallback_analysis(candidates, language)
    
    def _fallback_analysis(
        self,
        candidates: List[VectorSearchResult],
        language: str
    ) -> Dict[str, Any]:
        """
        LLM 실패 시 폴백: 벡터 유사도만 사용
        
        Args:
            candidates: 벡터 검색 후보들
            language: 응답 언어
            
        Returns:
            폴백 분석 결과
        """
        logger.warning("Using fallback analysis (vector similarity only)")
        
        matches = []
        # Top-1/2/3 가중치 차등 적용 (UX 개선)
        weights = [0.8, 0.7, 0.6, 0.5, 0.4]
        for i, candidate in enumerate(candidates[:5]):  # 상위 5개만
            weight = weights[i] if i < len(weights) else 0.4
            normalized_similarity = max(0.0, min(1.0, candidate.similarity))  # 범위 보정
            matches.append({
                "standard_id": candidate.metadata.get("id", "UNKNOWN"),
                "confidence": normalized_similarity * weight,  # 가중치 차등 적용
                "reasoning": "벡터 유사도 기반 매칭 (LLM 분석 실패)" if language == "ko" else "Vector similarity match (LLM analysis failed)"
            })
        
        summary = "벡터 유사도만으로 매칭되었습니다. LLM 분석을 사용할 수 없습니다." if language == "ko" else "Matched using vector similarity only. LLM analysis unavailable."
        
        return {
            "matches": matches,
            "summary": summary
        }
    
    def _format_suggestions(
        self,
        llm_matches: List[Dict[str, Any]],
        candidates: List[VectorSearchResult],
        min_confidence: float,
        top_k: int
    ) -> List[ESGStandardMatch]:
        """
        LLM 결과를 최종 포맷으로 변환
        
        Args:
            llm_matches: LLM이 반환한 매치 리스트
            candidates: 원본 벡터 검색 후보들
            min_confidence: 최소 신뢰도
            top_k: 최대 반환 수
            
        Returns:
            ESGStandardMatch 리스트
        """
        suggestions = []
        
        # 후보를 ID로 인덱싱
        candidates_by_id = {c.metadata.get("id"): c for c in candidates}
        
        for match in llm_matches:
            standard_id = match.get("standard_id")
            confidence = match.get("confidence", 0.0)
            reasoning = match.get("reasoning", "")
            
            # 응답 후처리 안전망: confidence 범위 보정 (0.0 ~ 1.0)
            confidence = max(0.0, min(1.0, float(confidence)))
            
            # reasoning 길이 제한 (500자)
            if len(reasoning) > 500:
                reasoning = reasoning[:497] + "..."
            
            # 신뢰도 필터
            if confidence < min_confidence:
                continue
            
            # 원본 후보 찾기
            candidate = candidates_by_id.get(standard_id)
            if not candidate:
                logger.warning(f"LLM returned unknown standard_id: {standard_id}")
                continue
            
            meta = candidate.metadata
            
            # 카테고리 표시명 생성
            category = meta.get("category", "").upper()
            category_display = CATEGORY_DISPLAY_MAP.get(category, category)
            
            # ESGStandardMatch 생성
            suggestion = ESGStandardMatch(
                standard_id=standard_id,
                framework=meta.get("framework", "UNKNOWN"),
                category=meta.get("category", ""),
                category_display=category_display,
                topic=meta.get("topic", ""),
                title=meta.get("title", ""),
                description=meta.get("description", "")[:500],  # 길이 제한
                confidence=confidence,
                similarity_score=candidate.similarity,
                reasoning=reasoning,
                keywords=meta.get("keywords", "").split(",") if meta.get("keywords") else []
            )
            
            suggestions.append(suggestion)
        
        # 신뢰도 높은 순으로 정렬
        suggestions.sort(key=lambda x: x.confidence, reverse=True)
        
        # Top-K만 반환
        return suggestions[:top_k]
    
    def get_vectorstore_status(self) -> Dict[str, Any]:
        """벡터스토어 상태 조회"""
        return {
            "collection_name": self.collection_name,
            "document_count": self.chroma.count(),
            "chroma_metadata": self.chroma.get_collection_metadata(),
            "embedding_dimension": self.embeddings.get_dimension()
        }
    
    def initialize_vectorstore(
        self,
        data_dir: Path,
        reset: bool = False
    ) -> Dict[str, Any]:
        """
        벡터스토어 초기화 (임베딩 파이프라인 실행)
        
        Args:
            data_dir: JSONL 데이터 디렉토리
            reset: True면 기존 데이터 삭제
            
        Returns:
            초기화 결과 통계
        """
        logger.info(f"Initializing vectorstore from: {data_dir}")
        
        pipeline = ESGEmbeddingPipeline(
            data_dir=data_dir,
            chroma_persist_dir=self.chroma_persist_dir,
            collection_name=self.collection_name
        )
        
        results = pipeline.process_all_frameworks(reset=reset)
        
        # 통계 변환
        stats = {
            framework: result.to_dict()
            for framework, result in results.items()
        }
        
        return {
            "frameworks": stats,
            "total_documents": self.chroma.count(),
            "status": "success"
        }


# 서비스 싱글톤
_esg_mapping_service: Optional[ESGMappingService] = None


def get_esg_mapping_service() -> ESGMappingService:
    """ESG 매핑 서비스 싱글톤 반환 (ChromaDB 사용)"""
    global _esg_mapping_service
    
    # ChromaDB 사용 가능 여부 확인
    if not _chroma_available:
        raise ImportError(
            "ChromaDB가 설치되지 않았습니다. "
            "개발 환경: pip install -r requirements/dev.txt, "
            "배포 환경: USE_JSON_VECTOR_STORE=true로 설정하고 get_json_vector_esg_mapping_service()를 사용하세요."
        )
    
    # Config 확인
    from src.ai_assist.config import get_ai_config
    config = get_ai_config()
    
    if config.USE_JSON_VECTOR_STORE:
        raise ValueError(
            "USE_JSON_VECTOR_STORE=true이면 get_json_vector_esg_mapping_service()를 사용하세요. "
            "ChromaDB는 배포 환경에서 사용할 수 없습니다."
        )
    
    if _esg_mapping_service is None:
        # Gemini 클라이언트를 config로 초기화
        from src.ai_assist.core.gemini_client import get_gemini_client
        get_gemini_client(
            api_key=config.GEMINI_API_KEY,
            model_name=config.GEMINI_MODEL,
            temperature=config.GEMINI_TEMPERATURE,
            max_output_tokens=config.GEMINI_MAX_TOKENS
        )
        
        _esg_mapping_service = ESGMappingService(
            chroma_persist_dir=Path(config.CHROMA_PERSIST_DIR),
            collection_name=config.CHROMA_COLLECTION_NAME,
            gemini_api_key=config.GEMINI_API_KEY
        )
    
    return _esg_mapping_service


def reset_esg_mapping_service():
    """서비스 초기화 (테스트용)"""
    global _esg_mapping_service
    _esg_mapping_service = None

