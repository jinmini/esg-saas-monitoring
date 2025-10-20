# 🔍 AI Assist 모니터링 시스템 설치 가이드

## 📋 목차
1. [의존성 설치](#의존성-설치)
2. [환경 변수 설정](#환경-변수-설정)
3. [테스트 실행](#테스트-실행)
4. [서버 실행](#서버-실행)
5. [모니터링 확인](#모니터링-확인)
6. [트러블슈팅](#트러블슈팅)

---

## 1. 의존성 설치

### 1.1 모니터링 라이브러리 설치
```powershell
cd backend

# 가상환경 활성화 (Python 3.12)
..\venv312\Scripts\activate

# 모니터링 의존성 설치
pip install -r requirements/monitoring.txt
```

### 1.2 설치 확인
```powershell
python -c "import structlog, prometheus_client; print('✅ 모니터링 라이브러리 설치 완료')"
```

---

## 2. 환경 변수 설정

### 2.1 `.env.dev` 파일에 추가

파일 위치: `backend/.env.dev`

```env
# ============================================
# AI Assist 모니터링 설정
# ============================================

# Logging
AI_ASSIST_LOG_LEVEL=INFO
AI_ASSIST_LOG_FORMAT=json
AI_ASSIST_LOG_FILE=./data/logs/ai_assist.log

# Metrics
AI_ASSIST_METRICS_ENABLED=true

# Alerting (Slack)
AI_ASSIST_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Alert Thresholds
AI_ASSIST_ALERT_ERROR_RATE_THRESHOLD=0.05
AI_ASSIST_ALERT_LATENCY_THRESHOLD=45.0
AI_ASSIST_ALERT_TOKEN_USAGE_THRESHOLD=0.8
```

### 2.2 Slack Webhook URL 설정

#### Step 1: Slack App 생성
1. https://api.slack.com/apps 접속
2. **Create New App** 클릭
3. **From scratch** 선택
4. App Name: `AI Assist Alerts`
5. Workspace 선택 → **Create App**

#### Step 2: Incoming Webhooks 활성화
1. 왼쪽 메뉴 **Features** → **Incoming Webhooks**
2. **Activate Incoming Webhooks** → **On**
3. **Add New Webhook to Workspace** 클릭
4. 알림받을 채널 선택 (예: `#ai-assist-alerts`)
5. **Allow** 클릭

#### Step 3: Webhook URL 복사
1. 생성된 Webhook URL 복사
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```
2. `.env.dev`의 `AI_ASSIST_SLACK_WEBHOOK_URL`에 붙여넣기

#### Step 4: 테스트
```powershell
# PowerShell에서 테스트
$body = @{ text = "Hello from AI Assist!" } | ConvertTo-Json
Invoke-WebRequest -Uri "YOUR_WEBHOOK_URL" -Method POST -Body $body -ContentType "application/json"
```

---

## 3. 테스트 실행

### 3.1 모니터링 시스템 테스트
```powershell
cd backend
python scripts/ai/test_monitoring.py
```

**예상 출력:**
```
🔍 AI Assist 모니터링 시스템 테스트
============================================================

1. 로깅 시스템 테스트
============================================================
✅ 로깅 테스트 완료

2. 메트릭 시스템 테스트
============================================================
📊 GPU 사용률: 15.23%, 메모리: 1024 MB
✅ 메트릭 테스트 완료

3. Health Check 테스트
============================================================
전체 상태: healthy
시간: 2025-10-16T12:00:00Z

구성 요소 상태:
✅ embedding_model: healthy
   - 모델: intfloat/multilingual-e5-base
✅ chroma_db: healthy
   - 문서 수: 181
✅ gemini_api: healthy
✅ gpu: healthy
   - GPU: NVIDIA GeForce RTX 3050

✅ Health Check 테스트 완료

4. 알림 시스템 테스트
============================================================
📤 Slack 테스트 알림 전송 중...
✅ Slack 알림 전송 성공!
   Slack 채널을 확인하세요.

============================================================
✅ 모든 테스트 완료!
============================================================
```

### 3.2 로그 파일 확인
```powershell
# 로그 디렉토리 생성 확인
ls data/logs/

# 로그 내용 확인 (JSON 포맷)
Get-Content data/logs/ai_assist.log | Select-Object -Last 20
```

---

## 4. 서버 실행

### 4.1 FastAPI 서버 시작
```powershell
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**예상 출력:**
```
🚀 ESG SaaS Monitoring Platform Starting...
✅ Database connection successful
✅ Logging initialized: json format
✅ Metrics initialized
✅ Slack alerting initialized
ℹ️  AI Assist auto-refresh disabled
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 5. 모니터링 확인

### 5.1 Health Check API
```powershell
# PowerShell
Invoke-RestMethod -Uri http://localhost:8000/api/v1/ai-assist/health | ConvertTo-Json -Depth 10
```

**응답 예시:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T12:00:00Z",
  "checks": {
    "embedding_model": {
      "status": "healthy",
      "model": "intfloat/multilingual-e5-base",
      "device": "cuda",
      "dimension": 768
    },
    "chroma_db": {
      "status": "healthy",
      "document_count": 181,
      "collection_name": "esg_standards"
    },
    "gemini_api": {
      "status": "healthy",
      "model": "gemini-2.5-flash",
      "test_token_count": 1
    },
    "gpu": {
      "status": "healthy",
      "available": true,
      "device_name": "NVIDIA GeForce RTX 3050",
      "memory_allocated_mb": 1024.5,
      "utilization": 0.15
    }
  }
}
```

### 5.2 Prometheus Metrics
```powershell
# 메트릭 확인
Invoke-WebRequest -Uri http://localhost:8000/api/v1/ai-assist/metrics

# 특정 메트릭 필터링
(Invoke-WebRequest -Uri http://localhost:8000/api/v1/ai-assist/metrics).Content | Select-String "ai_assist_esg_mapping"
```

**메트릭 예시:**
```
# HELP ai_assist_esg_mapping_requests_total Total number of ESG mapping requests
# TYPE ai_assist_esg_mapping_requests_total counter
ai_assist_esg_mapping_requests_total{framework="GRI",status="success"} 45.0

# HELP ai_assist_esg_mapping_duration_seconds ESG mapping duration in seconds
# TYPE ai_assist_esg_mapping_duration_seconds histogram
ai_assist_esg_mapping_duration_seconds_bucket{le="30.0"} 42.0
ai_assist_esg_mapping_duration_seconds_sum 1248.5
ai_assist_esg_mapping_duration_seconds_count 45.0

# HELP ai_assist_gemini_tokens_used_total Total Gemini tokens used
# TYPE ai_assist_gemini_tokens_used_total counter
ai_assist_gemini_tokens_used_total{type="input"} 54000.0
ai_assist_gemini_tokens_used_total{type="output"} 36000.0
```

### 5.3 API 문서 확인
브라우저에서 접속:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**새로 추가된 엔드포인트:**
- `GET /api/v1/ai-assist/health` - Health Check
- `GET /api/v1/ai-assist/metrics` - Prometheus Metrics

---

## 6. 트러블슈팅

### 6.1 `ModuleNotFoundError: No module named 'structlog'`

**원인:** 모니터링 의존성 미설치

**해결:**
```powershell
pip install -r requirements/monitoring.txt
```

---

### 6.2 Slack 알림이 전송되지 않음

**원인 1:** Webhook URL 오류

**확인:**
```powershell
# .env.dev 파일 확인
Get-Content .env.dev | Select-String "SLACK_WEBHOOK_URL"
```

**원인 2:** 네트워크 문제

**테스트:**
```powershell
$body = @{ text = "Test" } | ConvertTo-Json
Invoke-WebRequest -Uri "YOUR_WEBHOOK_URL" -Method POST -Body $body -ContentType "application/json"
```

---

### 6.3 로그 파일이 생성되지 않음

**원인:** 디렉토리 권한 문제

**해결:**
```powershell
# 로그 디렉토리 생성
New-Item -ItemType Directory -Force -Path data/logs

# 권한 확인
Get-Acl data/logs
```

---

### 6.4 Health Check에서 GPU가 `degraded`

**원인:** GPU 사용 불가 (정상 동작)

**설명:**
- GPU 없이도 CPU 모드로 동작
- `degraded`는 경고일 뿐 서비스 불가 아님
- 성능은 저하되지만 기능은 정상

**확인:**
```powershell
python -c "import torch; print(f'CUDA 사용 가능: {torch.cuda.is_available()}')"
```

---

### 6.5 메트릭이 `/metrics`에 표시되지 않음

**원인:** 메트릭 기록 부재

**해결:**
1. ESG 매핑 API 호출:
   ```powershell
   $body = @{
       text = "Scope 1 배출량 1,200 tCO2e"
       frameworks = @("GRI")
   } | ConvertTo-Json

   Invoke-RestMethod -Uri http://localhost:8000/api/v1/ai-assist/map-esg `
       -Method POST `
       -Body $body `
       -ContentType "application/json"
   ```

2. 메트릭 재확인:
   ```powershell
   Invoke-WebRequest -Uri http://localhost:8000/api/v1/ai-assist/metrics
   ```

---

## 🎯 다음 단계

### Week 1 완료 체크리스트
- [x] 구조화된 로깅 시스템
- [x] Request ID 추적 미들웨어
- [x] Prometheus 메트릭 수집
- [x] Health Check API
- [x] Slack 알림 연동
- [ ] 통합 테스트 (ESG 매핑 + 모니터링)

### Week 2 계획
1. Prometheus + Grafana 설정
2. 대시보드 구축 (3개)
3. 알림 규칙 정의
4. 분산 추적 (OpenTelemetry) - 선택

### 즉시 실행
```powershell
# 1. 서버 실행
cd backend
uvicorn src.main:app --reload

# 2. ESG 매핑 테스트
python scripts/ai/test_esg_mapping.py

# 3. Health Check 확인
Invoke-RestMethod -Uri http://localhost:8000/api/v1/ai-assist/health

# 4. Slack 채널 확인 (알림 수신 확인)
```

---

## 📚 참고 문서

- [Structlog Documentation](https://www.structlog.org/)
- [Prometheus Python Client](https://github.com/prometheus/client_python)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [FastAPI Middleware](https://fastapi.tiangolo.com/advanced/middleware/)

---

**🎉 모니터링 시스템 설치 완료!**

이제 AI Assist 서비스의 모든 동작을 실시간으로 관찰할 수 있습니다.

문의사항이 있으시면 언제든 질문해주세요! 💬

