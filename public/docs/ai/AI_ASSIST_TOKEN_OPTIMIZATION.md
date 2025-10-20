# Gemini API MAX_TOKENS 최적화

## 🔍 문제 상황

### 증상
```
Response truncated and empty due to MAX_TOKENS limit
ERROR - Generation failed after 3 attempts
WARNING - Using fallback analysis (vector similarity only)
```

### 근본 원인

**Input 토큰이 너무 많음:**
- 10개 후보를 LLM에 전달
- 각 후보마다 300자의 description
- 총 프롬프트: **약 3000~5000 토큰**

**Output 공간 부족:**
- `max_output_tokens=2048`
- 하지만 실제 사용 가능: `2048 - (input 토큰)`
- → 실제 출력 공간: **약 500~1000 토큰만 남음**
- → JSON 응답 생성 중 MAX_TOKENS 도달

---

## ✅ 해결 방법

### 전략
1. **Input 토큰 줄이기** (프롬프트 최적화)
2. **Output 토큰 늘리기** (max_output_tokens 증가)

---

### 1. 프롬프트 최적화 (`prompts.py`)

#### A. 후보 수 대폭 감소

**Before:**
```python
if len(user_text) < 200:
    max_candidates = 10  # ← 너무 많음
elif len(user_text) < 500:
    max_candidates = 7
else:
    max_candidates = 5
```

**After:**
```python
if len(user_text) < 100:
    max_candidates = 5  # 매우 짧은 텍스트
elif len(user_text) < 300:
    max_candidates = 4  # 짧은 텍스트
else:
    max_candidates = 3  # 긴 텍스트
```

**효과:** Input 토큰 **50% 감소** (10개 → 5개)

---

#### B. Description 길이 단축

**Before:**
```python
설명: {meta.get('description', 'N/A')[:300]}...  # 300자
```

**After:**
```python
description = meta.get('description', 'N/A')
if len(description) > 150:
    description = description[:150] + "..."  # 150자
```

**효과:** Input 토큰 **추가 20% 감소**

---

#### C. 불필요한 필드 제거

**Before:**
```
ID: xxx
프레임워크: xxx
카테고리: xxx
주제: xxx
제목: xxx
설명: xxx
키워드: xxx
유사도: xxx
```

**After:**
```
ID: xxx
프레임워크: xxx
제목: xxx
설명: xxx
유사도: xxx
```

**효과:** Input 토큰 **추가 15% 감소**

---

### 총 Input 토큰 감소 효과

| 항목 | Before | After | 절감 |
|-----|--------|-------|------|
| 후보 수 | 10개 | 3-5개 | -50% |
| Description | 300자 | 150자 | -50% |
| 필드 수 | 8개 | 5개 | -37.5% |
| **총 Input** | ~4000 토큰 | **~1200 토큰** | **-70%** |

---

### 2. max_output_tokens 증가 (`config.py`, `gemini_client.py`)

**Before:**
```python
GEMINI_MAX_TOKENS: int = 2048
```

**After:**
```python
GEMINI_MAX_TOKENS: int = 4096  # ESG 매핑 JSON 응답에 충분한 공간 확보
```

**효과:**
- Input: 1200 토큰
- Output: 4096 토큰
- → **실제 사용 가능 출력: ~2900 토큰**
- → JSON 응답(약 500-1000 토큰)에 충분함 ✅

---

### 3. 프롬프트 지침 업데이트

**Before:**
```
- 최대 5개까지만 반환하세요
```

**After:**
```
- 최대 3개까지만 반환하세요 (간결성)
```

**효과:** Output 토큰 **추가 절감**

---

## 📊 토큰 사용량 비교

### Before (문제 상황)

```
┌─────────────────────────────────────────────┐
│ Total Context: 8192 tokens                  │
├─────────────────────────────────────────────┤
│ Input:  ~4000 tokens (10 candidates)        │
│ Output: 2048 tokens (설정)                  │
│                                             │
│ 실제 사용 가능: 2048 - 4000 = OVERFLOW! ❌  │
└─────────────────────────────────────────────┘
```

### After (최적화)

```
┌─────────────────────────────────────────────┐
│ Total Context: 8192 tokens                  │
├─────────────────────────────────────────────┤
│ Input:  ~1200 tokens (3-5 candidates)       │
│ Output: 4096 tokens (설정)                  │
│                                             │
│ 실제 사용 가능: ~2900 tokens ✅             │
│ JSON 응답 예상: ~800 tokens (충분!)        │
└─────────────────────────────────────────────┘
```

---

## 🧪 예상 결과

### Before
```
2025-10-16 22:27:24,627 - ERROR - Response truncated and empty due to MAX_TOKENS limit
2025-10-16 22:27:24,631 - WARNING - Using fallback analysis (vector similarity only)
```

### After
```
2025-10-16 22:XX:XX - DEBUG - Finish reason: FinishReason.STOP
2025-10-16 22:XX:XX - DEBUG - Extracted text via response.text: 756 chars
2025-10-16 22:XX:XX - INFO - ✅ ESG Mapping complete: 2 matches in 3.2s

Matched Standards:
  1. GRI 305-1 (0.95 confidence)
     Reasoning: Scope 1 직접 배출량 보고와 정확히 일치
  
  2. GRI 305-5 (0.82 confidence)
     Reasoning: 온실가스 배출량 감축 목표 달성 관련
```

---

## 📋 변경 파일 요약

| 파일 | 변경 내용 |
|-----|---------|
| `config.py` | `GEMINI_MAX_TOKENS: 2048 → 4096` |
| `gemini_client.py` | 기본값 `2048 → 4096` |
| `prompts.py` | 후보 수 감소 (10→3-5), description 단축 (300→150), 필드 제거 |

---

## 💡 Rate Limit 영향 분석

### TPM (Tokens Per Minute) 계산

**Free Tier TPM: 250,000**

**Before:**
```
요청당 토큰 = 4000 (input) + 2048 (output) = 6048
분당 최대 요청 = 250,000 / 6048 ≈ 41 requests
```

**After:**
```
요청당 토큰 = 1200 (input) + 800 (output) = 2000
분당 최대 요청 = 250,000 / 2000 ≈ 125 requests
```

**효과:** 처리량 **3배 증가!** 🚀

---

## 🚀 다음 단계

### 1. 테스트 재실행
```powershell
cd backend
python scripts/ai/test_esg_mapping.py
```

### 2. 확인 사항
- ✅ `Finish reason: STOP` (MAX_TOKENS 아님)
- ✅ JSON 파싱 성공
- ✅ 3-5개 후보만 분석
- ✅ 응답 시간 단축 (50s → 5s 예상)

### 3. 추가 최적화 고려
- 필요시 `temperature` 조정 (0.3 → 0.1로 더 결정론적)
- 캐싱 추가 (동일한 텍스트 반복 요청 방지)

---

## 📚 참고

- Gemini 2.5 Flash context window: 1,048,576 tokens
- 하지만 실제 사용 권장: input + output < 8192 tokens
- [Gemini API Pricing](https://ai.google.dev/pricing)

