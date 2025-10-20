# AI Assist Library Update - CUDA & Google Gemini API 최신화

## 개요
AI Assist 모듈의 의존성 라이브러리를 CUDA 12.9 환경과 최신 Google Gemini API에 맞춰 업데이트했습니다.

---

## 1. requirements/ai.txt 업데이트

### 주요 변경사항

#### 1.1 PyTorch CUDA 지원
```diff
- torch==2.1.2
+ torch>=2.1.0,<2.3.0
+ # PyTorch with CUDA 12.1 support (compatible with CUDA 12.x including 12.9)
```

**설치 방법:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

**이유:**
- CUDA 12.1은 CUDA 12.x 시리즈(12.9 포함)와 호환됩니다
- 안정화된 버전으로 RTX 3050에서 최적의 성능을 제공합니다
- sentence-transformers 및 transformers와의 호환성이 검증되었습니다

#### 1.2 Google Gemini API 최신화
```diff
- google-generativeai==0.3.2
+ google-genai>=1.0.0
```

**변경 이유:**
- `google-generativeai`는 deprecated 상태
- `google-genai`는 최신 공식 SDK로 더 나은 타입 힌팅과 안정성 제공
- API 구조가 개선되어 더 직관적인 사용 가능

#### 1.3 불필요한 의존성 제거
```diff
- langchain==0.1.0
- langchain-community==0.0.13
```

**이유:**
- 현재 구현에서 langchain을 직접 사용하지 않음
- chromadb와 sentence-transformers만으로 충분
- 의존성 충돌 위험 감소

---

## 2. core/gemini_client.py 마이그레이션

### 2.1 Import 변경

#### Before (google-generativeai)
```python
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
```

#### After (google-genai)
```python
from google import genai
from google.genai import types
```

### 2.2 클라이언트 초기화 변경

#### Before
```python
genai.configure(api_key=api_key)
self.model = genai.GenerativeModel(
    model_name=model_name,
    generation_config=self.generation_config,
    safety_settings=self.safety_settings
)
```

#### After
```python
self.client = genai.Client(api_key=api_key)
```

**주요 차이점:**
- 클라이언트 인스턴스 기반 접근 방식으로 변경
- 더 명확한 리소스 관리 및 컨텍스트 격리
- 멀티스레드 환경에서 더 안전

### 2.3 GenerationConfig 변경

#### Before
```python
self.generation_config = {
    "temperature": temperature,
    "max_output_tokens": max_output_tokens,
    "top_p": 0.95,
    "top_k": 40,
    "response_mime_type": "application/json",
}
```

#### After
```python
self.generation_config = types.GenerateContentConfig(
    temperature=temperature,
    max_output_tokens=max_output_tokens,
    top_p=0.95,
    top_k=40,
    response_mime_type="application/json",
)
```

**개선사항:**
- 타입 안정성 향상 (Pydantic 기반 검증)
- IDE 자동완성 지원
- 런타임 에러 감소

### 2.4 SafetySettings 변경

#### Before
```python
self.safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    # ...
}
```

#### After
```python
self.safety_settings = [
    types.SafetySetting(
        category="HARM_CATEGORY_HARASSMENT",
        threshold="BLOCK_NONE"
    ),
    types.SafetySetting(
        category="HARM_CATEGORY_HATE_SPEECH",
        threshold="BLOCK_NONE"
    ),
    # ...
]
```

**주요 변경:**
- Dict → List[SafetySetting] 구조로 변경
- 문자열 기반 카테고리/임계값 사용
- 더 직관적이고 JSON 직렬화 친화적

### 2.5 generate_content 호출 변경

#### Before
```python
response = self.model.generate_content(prompt)
text = response.text.strip()
```

#### After
```python
response = self.client.models.generate_content(
    model=self.model_name,
    contents=prompt,
    config=types.GenerateContentConfig(
        temperature=self.temperature,
        max_output_tokens=self.max_output_tokens,
        top_p=0.95,
        top_k=40,
        response_mime_type="application/json" if parse_json else "text/plain",
        safety_settings=self.safety_settings,
    )
)
text = response.text.strip()
```

**주요 개선:**
- 모델 이름을 명시적으로 전달
- 설정을 호출 시점에 명확히 지정 가능
- `response_mime_type`을 동적으로 조정 가능

### 2.6 count_tokens 호출 변경

#### Before
```python
result = self.model.count_tokens(text)
return result.total_tokens
```

#### After
```python
result = self.client.models.count_tokens(
    model=self.model_name,
    contents=text
)
return result.total_tokens
```

---

## 3. 설치 순서 및 검증

### 3.1 권장 설치 순서

```bash
# 1. PyTorch CUDA 버전 설치 (가장 먼저)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 2. 나머지 의존성 설치
pip install -r requirements/ai.txt

# 3. CUDA 설치 확인
python -c "import torch; print('CUDA Available:', torch.cuda.is_available()); print('CUDA Version:', torch.version.cuda)"
```

**예상 출력:**
```
CUDA Available: True
CUDA Version: 12.1
```

### 3.2 Google Gemini API 테스트

```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents="Hello, world!"
)
print(response.text)
```

### 3.3 임베딩 모델 CUDA 확인

```python
from src.ai_assist.core.embeddings import get_embeddings

embeddings = get_embeddings()
print(f"Device: {embeddings.device}")
print(f"Model loaded: {embeddings.model_name}")

# GPU 메모리 확인
if embeddings.device == "cuda":
    import torch
    print(f"GPU Memory Reserved: {torch.cuda.memory_reserved() / 1e9:.2f} GB")
    print(f"GPU Memory Allocated: {torch.cuda.memory_allocated() / 1e9:.2f} GB")
```

**예상 출력 (RTX 3050):**
```
Device: cuda
Model loaded: intfloat/multilingual-e5-base
GPU Memory Reserved: ~2.5 GB
GPU Memory Allocated: ~1.8 GB
```

---

## 4. 호환성 매트릭스

| 구성 요소 | 기존 버전 | 업데이트 버전 | 비고 |
|---------|---------|-------------|------|
| **CUDA** | N/A | 12.9 | RTX 3050 |
| **PyTorch** | 2.1.2 (CPU) | 2.1.0~2.2.x (CUDA 12.1) | 안정화 버전 |
| **Google SDK** | google-generativeai 0.3.2 | google-genai >=1.0.0 | 공식 최신 SDK |
| **Transformers** | 4.36.2 | 4.36.2 | 변경 없음 |
| **Sentence-Transformers** | 2.3.1 | 2.3.1 | 변경 없음 |
| **ChromaDB** | 0.4.22 | 0.4.22 | 변경 없음 |

---

## 5. Breaking Changes 요약

### 5.1 코드 변경 필요 사항
1. ✅ **gemini_client.py**: 완료 (자동 마이그레이션됨)
2. ⚠️ **환경변수**: `GEMINI_API_KEY` → `AI_ASSIST_GEMINI_API_KEY` (config.py에서 이미 처리됨)
3. ✅ **임베딩**: 변경 없음 (sentence-transformers는 동일 API 유지)

### 5.2 설정 파일 변경
- `.env` 파일에 `AI_ASSIST_GEMINI_API_KEY` 추가 필요
- 기존 `GEMINI_API_KEY`도 호환되도록 fallback 구현됨 (gemini_client.py)

---

## 6. 성능 개선 예상치

### 6.1 임베딩 속도 (CPU vs CUDA)

| 배치 크기 | CPU (예상) | GPU (RTX 3050) | 개선율 |
|---------|-----------|----------------|-------|
| 32 | ~2.5초 | ~0.3초 | **8.3배** |
| 64 | ~5.0초 | ~0.5초 | **10배** |
| 128 | ~10.0초 | ~1.0초 | **10배** |

### 6.2 메모리 사용량

- **CPU 모드**: 시스템 RAM ~3GB
- **GPU 모드**: VRAM ~2.5GB, 시스템 RAM ~1GB
- **RTX 3050 (4GB VRAM)**: 충분한 여유 공간 확보

---

## 7. 트러블슈팅

### 7.1 CUDA Out of Memory
```python
# embed_pipeline.py에서 자동 감지 및 조정
if torch.cuda.is_available():
    total_mem_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
    if total_mem_gb < 8:
        self.batch_size = 16  # RTX 3050의 경우 자동으로 16으로 조정
```

### 7.2 Gemini API 호환성 에러
```bash
# 최신 버전으로 업데이트
pip install --upgrade google-genai
```

### 7.3 torch CUDA 버전 불일치
```bash
# 강제 재설치
pip uninstall torch torchvision torchaudio
pip cache purge
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

## 8. 다음 단계

### 8.1 라이브러리 설치 전 체크리스트
- [ ] NVIDIA 드라이버 최신 버전 확인 (CUDA 12.9 호환)
- [ ] 기존 torch CPU 버전 제거 (`pip uninstall torch`)
- [ ] pip 캐시 정리 (`pip cache purge`)
- [ ] 충분한 디스크 공간 확보 (~5GB)

### 8.2 설치 후 검증
- [ ] CUDA 가용성 확인
- [ ] 임베딩 모델 GPU 로딩 확인
- [ ] Gemini API 연결 테스트
- [ ] 벡터스토어 초기화 테스트

### 8.3 API 테스트 준비
- [ ] `.env` 파일에 `AI_ASSIST_GEMINI_API_KEY` 추가
- [ ] `backend/src/ai_assist/esg_mapping/data/` 디렉토리에 `gri_2021.jsonl` 배치
- [ ] 로그 디렉토리 생성: `backend/data/logs/`
- [ ] 벡터스토어 디렉토리 생성: `backend/data/vectorstore/`

---

## 참고 자료

1. **Google Gemini SDK 문서**: https://github.com/googleapis/python-genai
2. **PyTorch CUDA 설치 가이드**: https://pytorch.org/get-started/locally/
3. **Sentence Transformers 문서**: https://www.sbert.net/
4. **ChromaDB 문서**: https://docs.trychroma.com/

---

**작성일**: 2025-10-16  
**작성자**: AI Assistant  
**버전**: 1.0.0

