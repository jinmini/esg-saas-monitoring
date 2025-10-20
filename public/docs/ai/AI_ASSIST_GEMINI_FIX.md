# Gemini API 빈 응답 문제 해결

## 🔍 문제 진단

### 증상
```
ERROR - Empty response from Gemini API
WARNING - Generation attempt 1 failed: Empty response from API
```

### 원인
```
Finish reason: FinishReason.MAX_TOKENS
response.text value: None
```

**근본 원인:**
- `max_output_tokens=200`이 너무 작아서 응답이 중간에 잘림
- Gemini API는 불완전한 응답에 대해 `response.text = None` 반환
- `google-genai` SDK는 MAX_TOKENS로 중단된 경우 `response.text` 대신 `response.candidates[0].content.parts[0].text`에 부분 텍스트를 저장할 수 있음

---

## ✅ 해결 방법

### 1. `config.py` - 충분한 토큰 수 설정

```python
# Gemini API
GEMINI_API_KEY: str
GEMINI_MODEL: str = "gemini-2.5-flash"
GEMINI_MAX_OUTPUT_TOKENS: int = 2048  # ← ESG 매핑 분석에 충분한 토큰 수
GEMINI_TEMPERATURE: float = 0.3
```

**설명:**
- ESG 매핑은 여러 후보를 분석하고 JSON 응답을 생성하므로 최소 1024 토큰 이상 필요
- 2048 토큰으로 설정하면 대부분의 경우 충분함
- gemini-2.5-flash Free tier의 TPM(250,000)을 고려하면 적정 수준

---

### 2. `gemini_client.py` - MAX_TOKENS 처리 로직 추가

#### A. 응답 추출 개선

```python
# 방법 1: response.text (일반적)
if hasattr(response, 'text') and response.text:
    text = response.text.strip()
    logger.debug(f"Extracted text via response.text: {len(text)} chars")

# 방법 2: response.candidates[0].content.parts[0].text
# (MAX_TOKENS로 중단된 경우 response.text는 None일 수 있음)
elif hasattr(response, 'candidates') and response.candidates:
    if hasattr(response.candidates[0], 'content'):
        content = response.candidates[0].content
        if hasattr(content, 'parts') and content.parts:
            if hasattr(content.parts[0], 'text'):
                text = content.parts[0].text
                if text:  # None 체크
                    text = text.strip()
                    logger.debug(f"Extracted text via candidates: {len(text)} chars")
```

**설명:**
- `response.text`가 None이어도 `candidates[0].content.parts[0].text`에서 부분 응답 추출 시도
- 두 방법을 모두 사용하여 응답 추출 성공률 향상

#### B. MAX_TOKENS 경고

```python
# MAX_TOKENS로 중단된 경우 경고
if finish_reason and 'MAX_TOKENS' in str(finish_reason):
    if text:
        logger.warning(f"Response truncated due to MAX_TOKENS limit ({self.max_output_tokens})")
        logger.warning("Consider increasing max_output_tokens for complete responses")
    else:
        logger.error(f"Response truncated and empty due to MAX_TOKENS limit")
        raise ValueError(f"Response truncated by MAX_TOKENS ({self.max_output_tokens})")
```

**설명:**
- MAX_TOKENS로 중단된 경우를 명확히 감지하고 로그 출력
- 부분 응답이 있으면 경고만 표시하고 계속 진행
- 완전히 비어있으면 에러 발생

#### C. `get_gemini_client()` 파라미터 확장

```python
def get_gemini_client(
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    temperature: Optional[float] = None,
    max_output_tokens: Optional[int] = None
) -> GeminiClient:
    # ...
    _gemini_client = GeminiClient(
        api_key=api_key,
        model_name=model_name or "gemini-2.5-flash",
        temperature=temperature or 0.3,
        max_output_tokens=max_output_tokens or 2048  # ← 기본값 2048
    )
```

**설명:**
- Config에서 설정을 전달받을 수 있도록 파라미터 추가
- 기본값을 2048로 설정하여 안전성 확보

---

### 3. `service.py` - Config 설정 전달

```python
def get_esg_mapping_service() -> ESGMappingService:
    global _esg_mapping_service
    
    if _esg_mapping_service is None:
        from src.ai_assist.config import get_ai_config
        config = get_ai_config()
        
        # Gemini 클라이언트를 config로 초기화
        from src.ai_assist.core.gemini_client import get_gemini_client
        get_gemini_client(
            api_key=config.GEMINI_API_KEY,
            model_name=config.GEMINI_MODEL,
            temperature=config.GEMINI_TEMPERATURE,
            max_output_tokens=config.GEMINI_MAX_TOKENS  # ← 2048 전달
        )
        
        _esg_mapping_service = ESGMappingService(...)
```

**설명:**
- 서비스 초기화 시 config의 모든 Gemini 설정을 클라이언트에 전달
- 중앙화된 설정 관리로 일관성 확보

---

## 🧪 테스트

### Before (문제 상황)
```python
# test_gemini_api.py - Test 5
max_output_tokens=200  # ← 너무 작음

# 결과:
# Finish reason: FinishReason.MAX_TOKENS
# response.text value: None
# ❌ ERROR: 'NoneType' object is not subscriptable
```

### After (해결)
```python
# config.py
GEMINI_MAX_OUTPUT_TOKENS: int = 2048

# gemini_client.py
max_output_tokens=2048  # ← 충분한 토큰

# 예상 결과:
# Finish reason: FinishReason.STOP
# response.text: "ESG (Environmental, Social, Governance) reporting standards..."
# ✅ Response generated successfully
```

---

## 📋 변경 파일 요약

| 파일 | 변경 내용 |
|-----|---------|
| `config.py` | `GEMINI_MAX_TOKENS=2048` 설정 확인 |
| `gemini_client.py` | MAX_TOKENS 처리 로직 추가, candidates 방식 추출 지원 |
| `service.py` | Config 설정을 Gemini 클라이언트에 전달 |

---

## 🚀 다음 단계

1. ✅ **테스트 실행**
   ```powershell
   cd backend
   python scripts/ai/test_esg_mapping.py
   ```

2. ✅ **로그 확인**
   - `Finish reason: STOP` 확인
   - `Extracted text via response.text` 확인
   - MAX_TOKENS 경고가 없는지 확인

3. ✅ **실제 ESG 매핑 테스트**
   - 긴 텍스트로 테스트하여 2048 토큰으로 충분한지 확인
   - 필요시 4096으로 증가 (단, Rate Limit 고려)

---

## 💡 추가 최적화 고려사항

### 토큰 수 조정 가이드

| 용도 | 권장 max_tokens | 설명 |
|-----|----------------|------|
| 간단한 분류 | 512 | 짧은 JSON 응답 |
| ESG 매핑 (현재) | 2048 | 여러 후보 분석 + JSON |
| 상세 설명 | 4096 | 긴 reasoning 포함 |
| 보고서 생성 | 8192 | 전체 문서 생성 |

**현재 설정 (2048):**
- ✅ ESG 매핑에 적합
- ✅ Free tier TPM(250,000) 내에서 충분한 요청 가능
- ✅ 대부분의 경우 MAX_TOKENS 도달 없음

### Rate Limit 계산
```
TPM = 250,000 (Free tier)
max_output_tokens = 2048
평균 input_tokens ≈ 1000 (ESG 매핑)

요청당 토큰 = 1000 + 2048 = 3048
분당 최대 요청 = 250,000 / 3048 ≈ 82 requests
```

→ **현재 RPM 제한(10)보다 TPM이 더 제한적이지 않음**

---

## 📚 참고

- [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [google-genai SDK Documentation](https://github.com/googleapis/python-genai)
- [FinishReason Enum](https://ai.google.dev/api/python/google/generativeai/types/FinishReason)

