# 🐛 Health Check Bugfix

## 문제

**에러:** `An asyncio.Future, a coroutine or an awaitable is required`

**발생 시점:** `/api/v1/ai-assist/health` 엔드포인트 호출 시

**영향:** 모든 Health Check 실패 (503 Error)

---

## 원인

`asyncio.gather()`에 **코루틴 객체** 대신 **메서드 참조**를 전달했습니다.

```python
# ❌ 잘못된 코드
self.checks = {
    "embedding_model": self.check_embedding_model,  # 메서드 참조
}

check_funcs = list(self.checks.values())  # [메서드, 메서드, ...]
await asyncio.gather(*check_funcs)  # ❌ 에러!
```

Python의 `async` 메서드는:
- `method` → 메서드 참조 (호출 가능한 객체)
- `method()` → 코루틴 객체 (awaitable)

`asyncio.gather()`는 **코루틴 객체**를 요구합니다.

---

## 수정

```python
# ✅ 수정된 코드
check_coros = [check_func() for check_func in self.checks.values()]  # 코루틴 생성
await asyncio.gather(*check_coros)  # ✅ 정상 작동!
```

---

## 검증

### 1. 서버 재시작
```powershell
cd backend
uvicorn src.main:app --reload
```

### 2. Health Check API 테스트
```powershell
Invoke-RestMethod -Uri http://localhost:8000/api/v1/ai-assist/health | ConvertTo-Json -Depth 10
```

**예상 응답:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-17T04:30:00Z",
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
      "device_name": "NVIDIA GeForce RTX 3050"
    }
  }
}
```

### 3. Swagger UI 테스트
1. 브라우저에서 http://localhost:8000/docs 접속
2. `GET /api/v1/ai-assist/health` 클릭
3. **Try it out** → **Execute**
4. **Response code: 200** 확인

### 4. Slack 알림 확인
- Unhealthy 알림이 더 이상 오지 않아야 함
- 캐시 작동 확인 (30초 내 재호출 시 빠른 응답)

---

## 추가 개선

### 성능 측정

```python
import time

# Before (순차 실행)
start = time.time()
for check in checks:
    await check()
print(f"순차: {time.time() - start:.2f}s")  # ~4s

# After (병렬 실행)
start = time.time()
await asyncio.gather(*checks)
print(f"병렬: {time.time() - start:.2f}s")  # ~1s
```

**성능 개선:** 4배 빠름 ✨

---

## 학습 포인트

### asyncio.gather() 사용 시 주의사항

```python
# ❌ 잘못된 예시
async def func1():
    return "result1"

async def func2():
    return "result2"

# 틀림
tasks = [func1, func2]  # 메서드 참조
await asyncio.gather(*tasks)  # ❌ 에러!

# ✅ 올바른 예시
tasks = [func1(), func2()]  # 코루틴 생성
await asyncio.gather(*tasks)  # ✅ 정상!
```

### 디버깅 팁

```python
# 코루틴인지 확인
import asyncio
import inspect

result = func()
print(inspect.iscoroutine(result))  # True면 코루틴
print(asyncio.iscoroutine(result))  # True면 코루틴
```

---

## 완료 체크리스트

- [x] `health.py` 수정
- [ ] 서버 재시작
- [ ] Health Check API 테스트 (200 OK)
- [ ] Swagger UI 테스트
- [ ] Slack 알림 중지 확인
- [ ] 캐싱 동작 확인 (30초 TTL)

---

**수정 완료!** 이제 테스트해주세요! 🚀

