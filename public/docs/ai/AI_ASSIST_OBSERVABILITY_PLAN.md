# 🔍 AI Assist Observability & Monitoring 계획

## 📋 목표

**프로덕션 환경에서 AI 시스템의 동작을 실시간으로 관찰하고, 문제를 조기에 감지하여 안정적인 서비스를 제공**

---

## 🎯 현재 시스템 상태 점검

### ✅ 구축 완료
- [x] E5 임베딩 모델 (multilingual-e5-base)
- [x] ChromaDB 벡터 DB (181개 GRI 표준)
- [x] Gemini 2.5 Flash LLM
- [x] JSON 파싱 + 자동 보정
- [x] Retry 로직 (3회)
- [x] 기본 로깅 (Python logging)

### ⚠️ 부족한 부분
- [ ] **구조화된 로그** (JSON 형식, 메타데이터)
- [ ] **메트릭 수집** (응답 시간, 토큰 사용량, 에러율)
- [ ] **분산 추적** (Request ID, Trace 연결)
- [ ] **알림 시스템** (에러 발생 시 Slack/Email)
- [ ] **Health Check** (AI 서비스 상태 확인)
- [ ] **성능 대시보드** (Grafana/Prometheus)

---

## 🏗️ 3계층 Observability 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   1️⃣ Logging Layer                        │
├─────────────────────────────────────────────────────────┤
│  - 구조화된 JSON 로그                                      │
│  - Request ID 추적                                        │
│  - 에러 스택 트레이스                                       │
│  - 사용자 컨텍스트 (company_id, user_id)                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   2️⃣ Metrics Layer                        │
├─────────────────────────────────────────────────────────┤
│  - 응답 시간 (Latency)                                    │
│  - 토큰 사용량 (Input/Output Tokens)                      │
│  - 에러율 (Error Rate)                                    │
│  - 처리량 (Throughput - req/min)                          │
│  - 벡터 검색 유사도 (Similarity Score)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   3️⃣ Tracing Layer                        │
├─────────────────────────────────────────────────────────┤
│  - End-to-End 요청 추적                                    │
│  - 각 단계별 시간 측정                                      │
│    • 임베딩 생성 (E5)                                      │
│    • 벡터 검색 (ChromaDB)                                 │
│    • LLM 호출 (Gemini)                                    │
│    • JSON 파싱                                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 핵심 메트릭 정의

### 1. 성능 메트릭

| 메트릭 | 목표 | 경고 | 심각 |
|--------|------|------|------|
| **응답 시간 (p95)** | < 30s | > 45s | > 60s |
| **응답 시간 (p99)** | < 45s | > 60s | > 90s |
| **처리량** | > 100 req/min | < 50 req/min | < 20 req/min |
| **임베딩 시간** | < 1s | > 2s | > 5s |
| **벡터 검색 시간** | < 0.5s | > 1s | > 2s |
| **LLM 호출 시간** | < 15s | > 30s | > 60s |

### 2. 품질 메트릭

| 메트릭 | 목표 | 경고 | 심각 |
|--------|------|------|------|
| **매칭 성공률** | > 90% | < 80% | < 70% |
| **평균 신뢰도** | > 0.80 | < 0.70 | < 0.60 |
| **JSON 파싱 성공률** | > 95% | < 90% | < 85% |
| **Fallback 비율** | < 5% | > 10% | > 20% |

### 3. 비용 메트릭

| 메트릭 | 목표 | 경고 | 심각 |
|--------|------|------|------|
| **일일 토큰 사용량** | < 1M | > 5M | > 10M |
| **평균 입력 토큰** | < 2000 | > 3000 | > 4000 |
| **평균 출력 토큰** | < 1000 | > 2000 | > 3000 |
| **API 요청 수 (RPD)** | < 10k | > 50k | > 100k |

### 4. 안정성 메트릭

| 메트릭 | 목표 | 경고 | 심각 |
|--------|------|------|------|
| **에러율** | < 1% | > 5% | > 10% |
| **Retry 비율** | < 5% | > 15% | > 30% |
| **타임아웃 비율** | < 1% | > 3% | > 5% |
| **가용성 (Uptime)** | > 99.9% | < 99% | < 95% |

---

## 🛠️ 구현 계획

### Phase 1: 기본 Observability (1주일)

#### 1.1 구조화된 로깅 시스템
```python
# src/ai_assist/core/logger.py
import structlog
from datetime import datetime
import json

def get_ai_logger(name: str):
    """구조화된 로거 반환"""
    return structlog.get_logger(name).bind(
        service="ai_assist",
        environment=os.getenv("ENV", "dev"),
        version="1.0.0"
    )

# 사용 예시
logger = get_ai_logger(__name__)
logger.info(
    "esg_mapping_started",
    request_id=request_id,
    text_length=len(text),
    frameworks=frameworks,
    timestamp=datetime.utcnow().isoformat()
)
```

#### 1.2 Request ID 추적
```python
# src/ai_assist/middleware/request_id.py
import uuid
from fastapi import Request

async def add_request_id_middleware(request: Request, call_next):
    """모든 요청에 request_id 추가"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
```

#### 1.3 메트릭 수집기
```python
# src/ai_assist/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# 카운터
esg_mapping_requests = Counter(
    "esg_mapping_requests_total",
    "Total ESG mapping requests",
    ["framework", "status"]
)

# 히스토그램 (응답 시간)
esg_mapping_duration = Histogram(
    "esg_mapping_duration_seconds",
    "ESG mapping duration",
    ["stage"]  # embedding, vector_search, llm, json_parsing
)

# 게이지 (현재 값)
esg_mapping_in_progress = Gauge(
    "esg_mapping_in_progress",
    "ESG mapping requests in progress"
)

# 토큰 사용량
gemini_tokens_used = Counter(
    "gemini_tokens_used_total",
    "Total Gemini tokens used",
    ["type"]  # input, output
)
```

#### 1.4 Health Check 엔드포인트
```python
# src/ai_assist/router.py에 추가
@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """AI Assist 서비스 상태 확인"""
    checks = {
        "embedding_model": await check_embedding_model(),
        "chroma_db": await check_chroma_db(),
        "gemini_api": await check_gemini_api(),
        "gpu": await check_gpu_availability()
    }
    
    status = "healthy" if all(checks.values()) else "unhealthy"
    
    return {
        "status": status,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }
```

---

### Phase 2: 고급 모니터링 (2주일)

#### 2.1 분산 추적 (OpenTelemetry)
```python
# src/ai_assist/core/tracing.py
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

tracer = trace.get_tracer(__name__)

async def map_esg_with_tracing(text: str, frameworks: List[str]):
    """ESG 매핑 (추적 포함)"""
    with tracer.start_as_current_span("esg_mapping") as span:
        span.set_attribute("text_length", len(text))
        span.set_attribute("frameworks", ",".join(frameworks))
        
        # 1. 임베딩
        with tracer.start_as_current_span("embedding"):
            embedding = await generate_embedding(text)
        
        # 2. 벡터 검색
        with tracer.start_as_current_span("vector_search"):
            candidates = await search_vectors(embedding)
        
        # 3. LLM 호출
        with tracer.start_as_current_span("llm_analysis"):
            result = await analyze_with_llm(text, candidates)
        
        return result
```

#### 2.2 에러 분류 및 알림
```python
# src/ai_assist/core/error_handler.py
class AIAssistError(Exception):
    """AI Assist 기본 에러"""
    severity: str = "ERROR"
    should_alert: bool = False

class TokenLimitExceededError(AIAssistError):
    """토큰 제한 초과 에러 (경고)"""
    severity: str = "WARNING"
    should_alert: bool = True

class GeminiAPIError(AIAssistError):
    """Gemini API 에러 (심각)"""
    severity: str = "CRITICAL"
    should_alert: bool = True

async def handle_ai_error(error: AIAssistError, context: dict):
    """에러 처리 및 알림"""
    logger.error(
        "ai_error_occurred",
        error_type=type(error).__name__,
        severity=error.severity,
        context=context
    )
    
    if error.should_alert:
        await send_alert(
            title=f"AI Assist Error: {type(error).__name__}",
            message=str(error),
            severity=error.severity,
            context=context
        )
```

#### 2.3 Prometheus + Grafana 대시보드
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    
  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

volumes:
  prometheus_data:
  grafana_data:
```

---

### Phase 3: 인텔리전트 모니터링 (3주일)

#### 3.1 이상 탐지 (Anomaly Detection)
```python
# src/ai_assist/monitoring/anomaly_detector.py
import numpy as np
from sklearn.ensemble import IsolationForest

class ResponseTimeAnomalyDetector:
    """응답 시간 이상 탐지"""
    
    def __init__(self, window_size: int = 100):
        self.model = IsolationForest(contamination=0.05)
        self.history = []
    
    def add_sample(self, duration: float):
        """새 샘플 추가"""
        self.history.append(duration)
        
        if len(self.history) > self.window_size:
            self.history.pop(0)
            
            # 모델 재학습
            X = np.array(self.history).reshape(-1, 1)
            self.model.fit(X)
    
    def is_anomaly(self, duration: float) -> bool:
        """이상치 여부 판단"""
        if len(self.history) < self.window_size:
            return False
        
        prediction = self.model.predict([[duration]])
        return prediction[0] == -1  # -1 = anomaly
```

#### 3.2 자동 스케일링 트리거
```python
# src/ai_assist/monitoring/autoscaler.py
class AIAssistAutoScaler:
    """AI Assist 자동 스케일링"""
    
    async def check_and_scale(self):
        """부하 확인 및 스케일링"""
        metrics = await get_current_metrics()
        
        # CPU/GPU 사용률 > 80%
        if metrics["gpu_utilization"] > 0.8:
            await scale_up()
            logger.info("scaling_up", reason="high_gpu_utilization")
        
        # 대기 큐 > 100
        elif metrics["queue_length"] > 100:
            await scale_up()
            logger.info("scaling_up", reason="high_queue_length")
        
        # 에러율 > 10%
        elif metrics["error_rate"] > 0.1:
            await send_alert("High error rate detected")
```

#### 3.3 A/B 테스트 프레임워크
```python
# src/ai_assist/experiments/ab_test.py
class ESGMappingExperiment:
    """ESG 매핑 A/B 테스트"""
    
    def __init__(self, variants: List[str]):
        self.variants = variants
        self.results = {v: [] for v in variants}
    
    async def run_variant(self, variant: str, text: str):
        """실험 변형 실행"""
        config = self.get_variant_config(variant)
        
        start = time.time()
        result = await map_esg(text, config)
        duration = time.time() - start
        
        self.results[variant].append({
            "duration": duration,
            "confidence": result["average_confidence"],
            "matches": len(result["matches"])
        })
        
        return result
    
    def get_winner(self) -> str:
        """우승 변형 선택"""
        scores = {}
        for variant, results in self.results.items():
            scores[variant] = np.mean([
                r["confidence"] for r in results
            ])
        
        return max(scores, key=scores.get)
```

---

## 📈 예상 대시보드 구성

### 대시보드 1: 실시간 모니터링
```
┌─────────────────────────────────────────────────────────┐
│               AI Assist - Real-time Monitor              │
├─────────────────────────────────────────────────────────┤
│  ⏱️  응답 시간 (p95)        26.8s   [─────────▓▓▓──]    │
│  📊 처리량 (req/min)        125     [▓▓▓▓▓▓▓▓▓───]    │
│  ❌ 에러율                  0.5%    [▓──────────]    │
│  💰 토큰 사용량 (일일)       45k     [▓▓▓─────────]    │
├─────────────────────────────────────────────────────────┤
│  🔥 최근 5분 요청: 62개                                  │
│  ✅ 성공: 61   ❌ 실패: 1                                │
│  🔄 Retry: 3   ⏰ Timeout: 0                            │
└─────────────────────────────────────────────────────────┘
```

### 대시보드 2: 품질 메트릭
```
┌─────────────────────────────────────────────────────────┐
│                 AI Assist - Quality Metrics              │
├─────────────────────────────────────────────────────────┤
│  📌 평균 신뢰도             0.87    [▓▓▓▓▓▓▓▓▓▓─]    │
│  🎯 매칭 성공률             92%     [▓▓▓▓▓▓▓▓▓──]    │
│  📝 JSON 파싱 성공률         98%     [▓▓▓▓▓▓▓▓▓▓]    │
│  🔙 Fallback 비율           2%      [▓─────────]    │
├─────────────────────────────────────────────────────────┤
│  프레임워크별 매칭 분포:                                   │
│  GRI:  65%  [▓▓▓▓▓▓▓───]                                │
│  SASB: 20%  [▓▓▓───────]                                │
│  TCFD: 10%  [▓─────────]                                │
│  ESRS: 5%   [▓─────────]                                │
└─────────────────────────────────────────────────────────┘
```

### 대시보드 3: 비용 최적화
```
┌─────────────────────────────────────────────────────────┐
│               AI Assist - Cost Optimization              │
├─────────────────────────────────────────────────────────┤
│  💵 예상 월 비용            $45     [▓▓▓▓──────]    │
│  🔢 평균 입력 토큰           1,200                        │
│  🔢 평균 출력 토큰           800                          │
│  📊 토큰 효율성             68%     [▓▓▓▓▓▓▓───]    │
├─────────────────────────────────────────────────────────┤
│  최적화 제안:                                             │
│  ⚠️  프롬프트 길이 15% 감소 가능                           │
│  ✅ JSON 파싱 성공률 높음 (재호출 적음)                     │
│  💡 캐싱으로 20% 비용 절감 가능                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 우선순위 및 타임라인

### Week 1: 기본 Observability
**목표:** 프로덕션 배포 전 필수 모니터링 구축

- [ ] Day 1-2: 구조화된 로깅 (structlog)
- [ ] Day 3: Request ID 추적
- [ ] Day 4: 기본 메트릭 수집 (Prometheus Client)
- [ ] Day 5: Health Check 엔드포인트
- [ ] Day 6-7: 통합 테스트 및 문서화

**산출물:**
- `src/ai_assist/core/logger.py`
- `src/ai_assist/core/metrics.py`
- `src/ai_assist/middleware/request_id.py`
- Health Check API

---

### Week 2: 고급 모니터링
**목표:** 실시간 대시보드 및 알림

- [ ] Day 1-2: Prometheus + Grafana 설정
- [ ] Day 3: 에러 분류 시스템
- [ ] Day 4: Slack 알림 연동
- [ ] Day 5: OpenTelemetry 분산 추적
- [ ] Day 6-7: 대시보드 구축

**산출물:**
- Grafana 대시보드 (3개)
- 알림 규칙 (Slack/Email)
- `monitoring/` 디렉토리

---

### Week 3: 인텔리전트 모니터링
**목표:** 자동화 및 최적화

- [ ] Day 1-2: 이상 탐지 모델
- [ ] Day 3: 자동 스케일링 로직
- [ ] Day 4: A/B 테스트 프레임워크
- [ ] Day 5: 비용 최적화 리포트
- [ ] Day 6-7: 성능 튜닝

**산출물:**
- Anomaly Detector
- AutoScaler
- A/B Test Framework

---

## ✅ 체크리스트 (프론트엔드 연동 전)

### 필수 (Must-have)
- [ ] 구조화된 JSON 로그
- [ ] Request ID 추적
- [ ] Health Check 엔드포인트
- [ ] 기본 메트릭 (응답 시간, 에러율, 토큰 사용량)
- [ ] Prometheus 연동
- [ ] Grafana 기본 대시보드

### 권장 (Should-have)
- [ ] 에러 분류 및 알림
- [ ] 분산 추적 (OpenTelemetry)
- [ ] 성능 프로파일링
- [ ] Rate Limiting 구현

### 선택 (Nice-to-have)
- [ ] 이상 탐지
- [ ] 자동 스케일링
- [ ] A/B 테스트

---

## 🔧 즉시 시작 가능한 항목

### 1. 의존성 추가
```txt
# requirements/monitoring.txt
structlog>=24.1.0
prometheus-client>=0.19.0
opentelemetry-api>=1.22.0
opentelemetry-sdk>=1.22.0
opentelemetry-instrumentation-fastapi>=0.43b0
python-json-logger>=2.0.7
```

### 2. 환경 변수 추가
```env
# .env.dev에 추가
AI_ASSIST_LOG_LEVEL=INFO
AI_ASSIST_LOG_FORMAT=json
AI_ASSIST_METRICS_ENABLED=true
AI_ASSIST_TRACING_ENABLED=false  # Phase 2에서 활성화
AI_ASSIST_ALERT_WEBHOOK_URL=https://hooks.slack.com/...
```

### 3. 디렉토리 구조
```
backend/
├── src/ai_assist/
│   ├── core/
│   │   ├── logger.py        # ✨ NEW
│   │   ├── metrics.py       # ✨ NEW
│   │   └── tracing.py       # ✨ NEW
│   ├── middleware/
│   │   └── request_id.py    # ✨ NEW
│   └── monitoring/
│       ├── health.py        # ✨ NEW
│       ├── anomaly.py       # ✨ NEW
│       └── autoscaler.py    # ✨ NEW
└── monitoring/
    ├── prometheus.yml       # ✨ NEW
    ├── grafana/
    │   └── dashboards/
    │       ├── realtime.json
    │       ├── quality.json
    │       └── cost.json
    └── docker-compose.monitoring.yml
```

---

## 📚 참고 문서

- [Structlog Documentation](https://www.structlog.org/)
- [Prometheus Client Python](https://github.com/prometheus/client_python)
- [OpenTelemetry Python](https://opentelemetry-python.readthedocs.io/)
- [Grafana Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)

---

**다음 단계:** Phase 1 구현 시작 → `src/ai_assist/core/logger.py` 작성


