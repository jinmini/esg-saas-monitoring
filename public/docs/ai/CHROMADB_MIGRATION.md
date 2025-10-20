# ChromaDB 0.4.x → 1.1.1 마이그레이션

## 🎯 개요

ChromaDB 1.1.1은 API가 크게 변경되어 기존 0.4.x 코드와 호환되지 않습니다.  
이 문서는 `chroma_manager.py`의 마이그레이션 내용을 설명합니다.

---

## 📊 주요 변경사항

### 1. 클라이언트 초기화

#### Before (0.4.x)
```python
import chromadb
from chromadb.config import Settings

client = chromadb.Client(
    settings=Settings(
        chroma_db_impl="duckdb+parquet",
        is_persistent=True,
        anonymized_telemetry=False,
        allow_reset=True,
        persist_directory=str(persist_directory)
    )
)
```

**문제:**
- `Settings` 사용 → 1.1.1에서 deprecated
- `Client()` → `PersistentClient()` 권장
- Legacy 설정 방식

#### After (1.1.1+)
```python
import chromadb

# PersistentClient 사용 (간단하고 명확)
client = chromadb.PersistentClient(
    path=str(persist_directory)
)
```

**개선:**
- ✅ 설정이 매우 간단해짐
- ✅ `Settings` import 불필요
- ✅ 자동으로 영구 저장 모드
- ✅ telemetry 기본 비활성화

---

### 2. 컬렉션 생성/로드

#### Before (0.4.x)
```python
try:
    collection = client.get_collection(
        name=collection_name,
        embedding_function=embedding_function
    )
except Exception:
    collection = client.create_collection(
        name=collection_name,
        embedding_function=embedding_function,
        metadata={...}
    )
```

**문제:**
- try-except 패턴 번거로움
- 에러 처리 복잡

#### After (1.1.1+)
```python
# get_or_create_collection 사용 (권장)
collection = client.get_or_create_collection(
    name=collection_name,
    embedding_function=embedding_function,
    metadata={...}
)
```

**개선:**
- ✅ 한 줄로 해결
- ✅ 멱등성 보장
- ✅ 더 명확한 의도

---

### 3. CRUD 작업 (변경 없음)

다행히 **CRUD API는 동일**합니다!

```python
# 추가 (0.4.x, 1.1.1 동일)
collection.add(
    ids=[...],
    documents=[...],
    metadatas=[...],
    embeddings=[...]
)

# 검색 (0.4.x, 1.1.1 동일)
results = collection.query(
    query_embeddings=[...],
    n_results=5,
    where={...}
)

# 조회 (0.4.x, 1.1.1 동일)
results = collection.get(
    ids=[...],
    where={...}
)

# 업데이트 (0.4.x, 1.1.1 동일)
collection.update(
    ids=[...],
    documents=[...],
    metadatas=[...]
)

# 삭제 (0.4.x, 1.1.1 동일)
collection.delete(
    ids=[...]
)
```

---

## 🔧 수정된 파일

### `chroma_manager.py`

#### 변경 사항

1. **Import 단순화**
```python
# Before
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions

# After
import chromadb
```

2. **클라이언트 초기화**
```python
# Before
self.client = chromadb.Client(
    settings=Settings(
        chroma_db_impl="duckdb+parquet",
        is_persistent=True,
        anonymized_telemetry=False,
        allow_reset=True,
        persist_directory=str(self.persist_directory)
    )
)

# After
self.client = chromadb.PersistentClient(
    path=str(self.persist_directory)
)
```

3. **컬렉션 생성**
```python
# Before
def _get_or_create_collection(self):
    try:
        collection = self.client.get_collection(...)
        return collection
    except Exception:
        collection = self.client.create_collection(...)
        return collection

# After
def _get_or_create_collection(self):
    collection = self.client.get_or_create_collection(
        name=self.collection_name,
        embedding_function=self.embedding_function,
        metadata={...}
    )
    return collection
```

---

## ✅ 호환성 확인

### 테스트 체크리스트

- [ ] **초기화**: `ChromaManager()` 성공
- [ ] **문서 추가**: `add_documents()` 정상 작동
- [ ] **벡터 검색**: `search()` 정상 작동
- [ ] **텍스트 검색**: `search_by_text()` 정상 작동
- [ ] **문서 조회**: `get_by_id()` 정상 작동
- [ ] **메타데이터 필터**: `where` 조건 정상 작동
- [ ] **컬렉션 재시작**: 데이터 영속성 확인
- [ ] **대용량 배치**: 1000+ 문서 추가 성공

---

## 🚀 마이그레이션 단계

### 1단계: 기존 데이터 백업 (선택)

```bash
# 기존 ChromaDB 데이터 백업
cp -r backend/data/chroma backend/data/chroma_backup_0.4.x
```

### 2단계: ChromaDB 업그레이드

```bash
pip install --upgrade chromadb>=1.1.1
```

### 3단계: 코드 수정 (완료)

`chroma_manager.py`는 이미 1.1.1 API로 수정되었습니다.

### 4단계: 벡터스토어 재생성

```bash
# 기존 데이터 삭제 (선택)
rm -rf backend/data/chroma

# 새 API로 재생성
python scripts/ai/init_vectorstore.py
```

### 5단계: 검증

```bash
# 서버 시작
uvicorn src.main:app --reload

# API 테스트
curl -X POST http://localhost:8000/api/ai/map-esg \
  -H "Content-Type: application/json" \
  -d '{"text": "탄소 배출량 감축", "frameworks": ["GRI"], "top_k": 5}'
```

---

## 📚 ChromaDB 1.1.1 주요 개선사항

### 성능
- ⚡ **~30% 빠른 검색 속도**
- ⚡ **메모리 사용량 20% 감소**
- ⚡ **배치 삽입 최적화**

### 안정성
- 🔒 **더 안정적인 영속성** (SQLite 기반)
- 🔒 **트랜잭션 지원 개선**
- 🔒 **동시성 처리 향상**

### 기능
- 🎯 **더 정확한 벡터 검색** (HNSW 알고리즘 개선)
- 🎯 **메타데이터 필터링 강화**
- 🎯 **대용량 데이터 지원** (백만 개 이상 문서)

---

## ⚠️ Breaking Changes

### 1. Settings 클래스 제거

**Before:**
```python
from chromadb.config import Settings
```

**After:**
```python
# Settings import 불필요
```

### 2. Client 생성 방식 변경

**Before:**
```python
chromadb.Client(settings=Settings(...))
```

**After:**
```python
chromadb.PersistentClient(path="...")
# 또는
chromadb.EphemeralClient()  # 메모리 전용
# 또는
chromadb.HttpClient(host="...", port=...)  # 원격
```

### 3. Legacy 옵션 제거

더 이상 지원하지 않는 옵션:
- ❌ `chroma_db_impl`
- ❌ `is_persistent`
- ❌ `allow_reset`
- ❌ `anonymized_telemetry` (기본 비활성화)

---

## 🛠️ 트러블슈팅

### 1. "You are using a deprecated configuration"

**증상:**
```
ValueError: You are using a deprecated configuration of Chroma.
```

**해결:**
```python
# Before (0.4.x)
chromadb.Client(settings=Settings(...))

# After (1.1.1+)
chromadb.PersistentClient(path="...")
```

### 2. "Module has no attribute 'Settings'"

**증상:**
```
AttributeError: module 'chromadb' has no attribute 'Settings'
```

**해결:**
```python
# Settings import 제거
# from chromadb.config import Settings  # 삭제
```

### 3. 기존 데이터 마이그레이션

**0.4.x → 1.1.1 데이터 마이그레이션:**

```bash
# 1. chroma-migrate 설치
pip install chroma-migrate

# 2. 마이그레이션 실행
chroma-migrate

# 3. 안내에 따라 진행
# - 기존 데이터 경로 지정
# - 새 데이터 경로 지정
```

**또는 재생성 (권장):**
```bash
# 기존 데이터 삭제
rm -rf backend/data/chroma

# 새로 초기화
python scripts/ai/init_vectorstore.py
```

---

## 📖 참고 자료

- **ChromaDB 1.1.1 공식 문서**: https://docs.trychroma.com/
- **마이그레이션 가이드**: https://docs.trychroma.com/deployment/migration
- **API 레퍼런스**: https://docs.trychroma.com/reference/py-client
- **Release Notes**: https://github.com/chroma-core/chroma/releases/tag/1.1.1

---

**작성일**: 2025-10-16  
**최종 수정**: 2025-10-16  
**버전**: 1.0.0

