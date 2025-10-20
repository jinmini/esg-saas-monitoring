"""
Prometheus 메트릭 수집

AI Assist 서비스의 성능, 품질, 비용 메트릭을 수집합니다.
"""
from prometheus_client import Counter, Histogram, Gauge, Info
from typing import Optional, List
import time
from contextlib import contextmanager, asynccontextmanager


# ============================================
# 1. 요청 메트릭
# ============================================

# 총 요청 수
esg_mapping_requests_total = Counter(
    "ai_assist_esg_mapping_requests_total",
    "Total number of ESG mapping requests",
    ["framework", "status"]  # status: success, error, fallback
)

# 진행 중인 요청 수
esg_mapping_in_progress = Gauge(
    "ai_assist_esg_mapping_in_progress",
    "Number of ESG mapping requests in progress"
)


# ============================================
# 2. 성능 메트릭
# ============================================

# 응답 시간 (전체)
esg_mapping_duration_seconds = Histogram(
    "ai_assist_esg_mapping_duration_seconds",
    "ESG mapping duration in seconds",
    buckets=[1, 5, 10, 15, 20, 30, 45, 60, 90, 120]
)

# 각 단계별 응답 시간
esg_mapping_stage_duration_seconds = Histogram(
    "ai_assist_esg_mapping_stage_duration_seconds",
    "ESG mapping stage duration in seconds",
    ["stage"],  # stage: embedding, vector_search, llm_analysis, json_parsing
    buckets=[0.1, 0.5, 1, 2, 5, 10, 15, 20, 30, 60]
)


# ============================================
# 3. 품질 메트릭
# ============================================

# 매칭 수
esg_mapping_matches_count = Histogram(
    "ai_assist_esg_mapping_matches_count",
    "Number of ESG matches found",
    buckets=[0, 1, 2, 3, 4, 5, 10]
)

# 평균 신뢰도
esg_mapping_confidence_score = Histogram(
    "ai_assist_esg_mapping_confidence_score",
    "Average confidence score of ESG matches",
    buckets=[0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0]
)

# JSON 파싱 결과
esg_mapping_json_parsing_total = Counter(
    "ai_assist_esg_mapping_json_parsing_total",
    "JSON parsing results",
    ["result"]  # result: success, corrected, failed
)

# Fallback 사용 횟수
esg_mapping_fallback_total = Counter(
    "ai_assist_esg_mapping_fallback_total",
    "Number of times fallback was used",
    ["reason"]  # reason: llm_error, json_error, timeout
)


# ============================================
# 4. 비용 메트릭
# ============================================

# 토큰 사용량
gemini_tokens_used_total = Counter(
    "ai_assist_gemini_tokens_used_total",
    "Total Gemini tokens used",
    ["type"]  # type: input, output
)

# 평균 토큰 수
gemini_tokens_average = Histogram(
    "ai_assist_gemini_tokens_average",
    "Average Gemini tokens per request",
    ["type"],  # type: input, output
    buckets=[100, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000]
)


# ============================================
# 5. 에러 메트릭
# ============================================

# 에러 횟수
esg_mapping_errors_total = Counter(
    "ai_assist_esg_mapping_errors_total",
    "Total number of errors",
    ["error_type"]  # error_type: TokenLimitExceeded, GeminiAPIError, etc.
)

# Retry 횟수
esg_mapping_retries_total = Counter(
    "ai_assist_esg_mapping_retries_total",
    "Total number of retries",
    ["stage"]  # stage: llm_call, vector_search, etc.
)


# ============================================
# 6. 시스템 메트릭
# ============================================

# GPU 사용률 (0-1)
gpu_utilization = Gauge(
    "ai_assist_gpu_utilization",
    "GPU utilization (0-1)"
)

# GPU 메모리 사용량 (bytes)
gpu_memory_used_bytes = Gauge(
    "ai_assist_gpu_memory_used_bytes",
    "GPU memory used in bytes"
)

# ChromaDB 문서 수
chroma_documents_total = Gauge(
    "ai_assist_chroma_documents_total",
    "Total number of documents in ChromaDB"
)

# 서비스 정보
service_info = Info(
    "ai_assist_service",
    "AI Assist service information"
)


# ============================================
# 편의 함수들
# ============================================

@contextmanager
def track_request(frameworks: Optional[List[str]] = None):
    """
    요청 추적 컨텍스트 매니저 (동기 버전)
    
    Example:
        >>> with track_request(frameworks=["GRI"]):
        >>>     result = map_esg(text)  # 동기 함수
    """
    esg_mapping_in_progress.inc()
    start_time = time.time()
    
    framework_label = ",".join(frameworks) if frameworks else "all"
    status = "success"
    
    try:
        yield
    except Exception:
        status = "error"
        raise
    finally:
        duration = time.time() - start_time
        esg_mapping_in_progress.dec()
        esg_mapping_duration_seconds.observe(duration)
        esg_mapping_requests_total.labels(
            framework=framework_label,
            status=status
        ).inc()


@asynccontextmanager
async def track_request_async(frameworks: Optional[List[str]] = None):
    """
    요청 추적 컨텍스트 매니저 (비동기 버전)
    
    FastAPI/async context 내에서 사용하세요.
    
    Example:
        >>> async with track_request_async(frameworks=["GRI"]):
        >>>     result = await map_esg(text)  # 비동기 함수
    """
    esg_mapping_in_progress.inc()
    start_time = time.time()
    
    framework_label = ",".join(frameworks) if frameworks else "all"
    status = "success"
    
    try:
        yield
    except Exception:
        status = "error"
        raise
    finally:
        duration = time.time() - start_time
        esg_mapping_in_progress.dec()
        esg_mapping_duration_seconds.observe(duration)
        esg_mapping_requests_total.labels(
            framework=framework_label,
            status=status
        ).inc()


@contextmanager
def track_stage(stage: str):
    """
    단계별 시간 추적 (동기 버전)
    
    Args:
        stage: embedding, vector_search, llm_analysis, json_parsing
    
    Example:
        >>> with track_stage("llm_analysis"):
        >>>     result = gemini_client.generate(prompt)  # 동기 함수
    """
    start_time = time.time()
    try:
        yield
    finally:
        duration = time.time() - start_time
        esg_mapping_stage_duration_seconds.labels(stage=stage).observe(duration)


@asynccontextmanager
async def track_stage_async(stage: str):
    """
    단계별 시간 추적 (비동기 버전)
    
    Args:
        stage: embedding, vector_search, llm_analysis, json_parsing
    
    Example:
        >>> async with track_stage_async("llm_analysis"):
        >>>     result = await gemini_client.generate(prompt)  # 비동기 함수
    """
    start_time = time.time()
    try:
        yield
    finally:
        duration = time.time() - start_time
        esg_mapping_stage_duration_seconds.labels(stage=stage).observe(duration)


def record_matches(count: int, average_confidence: float):
    """
    매칭 결과 기록
    
    Args:
        count: 매칭 수
        average_confidence: 평균 신뢰도 (0-1)
    """
    esg_mapping_matches_count.observe(count)
    if count > 0:
        esg_mapping_confidence_score.observe(average_confidence)


def record_json_parsing(result: str):
    """
    JSON 파싱 결과 기록
    
    Args:
        result: success, corrected, failed
    """
    esg_mapping_json_parsing_total.labels(result=result).inc()


def record_fallback(reason: str):
    """
    Fallback 사용 기록
    
    Args:
        reason: llm_error, json_error, timeout
    """
    esg_mapping_fallback_total.labels(reason=reason).inc()


def record_tokens(input_tokens: int, output_tokens: int):
    """
    토큰 사용량 기록
    
    Args:
        input_tokens: 입력 토큰 수
        output_tokens: 출력 토큰 수
    """
    gemini_tokens_used_total.labels(type="input").inc(input_tokens)
    gemini_tokens_used_total.labels(type="output").inc(output_tokens)
    gemini_tokens_average.labels(type="input").observe(input_tokens)
    gemini_tokens_average.labels(type="output").observe(output_tokens)


def record_error(error_type: str):
    """
    에러 기록 (계층화된 에러 타입 사용 권장)
    
    Args:
        error_type: 에러 타입 (prefix 규칙 사용 권장)
        
    에러 타입 prefix 규칙:
        - GeminiAPI/* : Gemini API 관련 에러
          예: GeminiAPI/TokenLimitExceeded, GeminiAPI/RateLimitExceeded
        - JSONError/* : JSON 파싱 관련 에러
          예: JSONError/ParseFailed, JSONError/ValidationFailed
        - VectorStore/* : ChromaDB 관련 에러
          예: VectorStore/ConnectionFailed, VectorStore/QueryTimeout
        - Timeout/* : 타임아웃 관련 에러
          예: Timeout/LLMCall, Timeout/VectorSearch
    
    PromQL 집계 예시:
        # 모든 Gemini API 에러 수
        sum(ai_assist_esg_mapping_errors_total{error_type=~"GeminiAPI/.*"})
        
        # JSON 파싱 에러율
        rate(ai_assist_esg_mapping_errors_total{error_type=~"JSONError/.*"}[5m])
    """
    esg_mapping_errors_total.labels(error_type=error_type).inc()


def record_retry(stage: str):
    """
    Retry 기록
    
    Args:
        stage: llm_call, vector_search, etc.
    """
    esg_mapping_retries_total.labels(stage=stage).inc()


def update_gpu_metrics(utilization: float, memory_used: int):
    """
    GPU 메트릭 업데이트
    
    Args:
        utilization: GPU 사용률 (0-1)
        memory_used: GPU 메모리 사용량 (bytes)
    """
    gpu_utilization.set(utilization)
    gpu_memory_used_bytes.set(memory_used)


def update_chroma_metrics(document_count: int):
    """
    ChromaDB 메트릭 업데이트
    
    Args:
        document_count: 총 문서 수
    """
    chroma_documents_total.set(document_count)


def init_service_info(version: str, model: str, embedding_model: str):
    """
    서비스 정보 초기화
    
    Args:
        version: 서비스 버전
        model: LLM 모델명
        embedding_model: 임베딩 모델명
    """
    service_info.info({
        "version": version,
        "llm_model": model,
        "embedding_model": embedding_model
    })

