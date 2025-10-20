# 🚀 ESG Compliance AI - 배포 가이드

## 📋 목차
- [배포 아키텍처](#배포-아키텍처)
- [사전 준비](#사전-준비)
- [1. Supabase 설정](#1-supabase-설정)
- [2. Render Backend 배포](#2-render-backend-배포)
- [3. Vercel Frontend 배포](#3-vercel-frontend-배포)
- [4. 환경 변수 설정](#4-환경-변수-설정)
- [5. 배포 후 검증](#5-배포-후-검증)
- [트러블슈팅](#트러블슈팅)

---

## 🏗️ 배포 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                    사용자                             │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────▼──────────┐
        │   Vercel (Frontend)  │
        │   Next.js + Static   │
        │   JSON Vector Store  │
        └───────────┬──────────┘
                    │ API Calls
        ┌───────────▼──────────┐
        │  Render (Backend)    │
        │  FastAPI + Python    │
        │  JSON Vector Search  │
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │ Supabase (Database)  │
        │  PostgreSQL 2GB      │
        └──────────────────────┘
                    
        ┌──────────────────────┐
        │ Google AI Studio     │
        │ Gemini 2.5 Flash     │
        └──────────────────────┘
```

### 비용 요약
- ✅ **Vercel**: $0 (Free Tier)
- ✅ **Render**: $0 (Free Tier, Sleep after 15min)
- ✅ **Supabase**: $0 (Free Tier, 2GB)
- ✅ **Gemini API**: $0 (Free Tier)
- **총 비용**: **$0/월** 🎉

---

## 📦 사전 준비

### 1. 계정 생성
- [ ] [Supabase](https://supabase.com/) 계정
- [ ] [Render](https://render.com/) 계정
- [ ] [Vercel](https://vercel.com/) 계정
- [ ] [Google AI Studio](https://aistudio.google.com/) Gemini API Key

### 2. 로컬 테스트 완료
```bash
# Backend
cd backend
python -m uvicorn src.main:app --reload

# Frontend
cd frontend
pnpm dev
```

### 3. Git Repository
- GitHub에 코드 푸시 완료
- `.env` 파일은 `.gitignore`에 포함되어 있는지 확인

---

## 1. Supabase 설정

### Step 1: 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   ```
   Name: esg-compliance-ai
   Database Password: [강력한 비밀번호 생성]
   Region: Northeast Asia (Seoul)
   ```
4. **Create new project** 클릭 (약 2분 소요)

### Step 2: Database URL 복사

1. 프로젝트 생성 완료 후 **Settings** → **Database** 이동
2. **Connection string** → **URI** 탭 선택
3. **Connection Pooling** 섹션에서 다음 URL 복사:
   ```
   postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
   ```
4. `[PASSWORD]`를 실제 비밀번호로 교체

### Step 3: 테이블 생성

SQL Editor에서 실행:

```sql
-- Documents 테이블
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sections 테이블
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_sections_document_id ON sections(document_id);
```

✅ **완료**: DATABASE_URL 메모장에 저장

---

## 2. Render Backend 배포

### Step 1: GitHub 연동

1. [Render Dashboard](https://dashboard.render.com/) 접속
2. **New** → **Web Service** 클릭
3. **Connect GitHub** 선택
4. Repository 선택: `your-username/esg-compliance-ai`

### Step 2: 서비스 설정

```yaml
Name: esg-compliance-backend
Region: Singapore (또는 Oregon)
Branch: main
Root Directory: backend
Runtime: Python 3.12

Build Command:
pip install --upgrade pip &&
pip install -r requirements/base.txt &&
pip install -r requirements/ai.txt

Start Command:
uvicorn src.main:app --host 0.0.0.0 --port $PORT

Instance Type: Free
```

### Step 3: 환경 변수 설정

**Environment Variables** 섹션에서 추가:

```bash
# Required
DATABASE_URL=[Supabase에서 복사한 URL]
AI_ASSIST_GEMINI_API_KEY=[Google AI Studio API Key]

# Optional (기본값 사용 가능)
AI_ASSIST_USE_JSON_VECTOR_STORE=true
AI_ASSIST_EMBEDDING_DEVICE=cpu
AI_ASSIST_GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGINS=http://localhost:3000,https://*.vercel.app
ENVIRONMENT=production
```

### Step 4: 배포 시작

1. **Create Web Service** 클릭
2. 배포 로그 확인 (약 5-10분)
3. 배포 완료 후 URL 확인: `https://esg-compliance-backend.onrender.com`

### Step 5: Health Check 확인

```bash
curl https://esg-compliance-backend.onrender.com/api/v1/health
```

예상 응답:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T..."
}
```

✅ **완료**: Render URL 메모장에 저장

---

## 3. Vercel Frontend 배포

### Step 1: GitHub 연동

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **Add New** → **Project** 클릭
3. GitHub Repository import: `esg-compliance-ai`

### Step 2: 프로젝트 설정

```yaml
Framework Preset: Next.js
Root Directory: frontend
Build Command: pnpm install && pnpm build
Output Directory: .next
Install Command: pnpm install
```

### Step 3: 환경 변수 설정

**Environment Variables** 섹션에서 추가:

```bash
NEXT_PUBLIC_API_BASE_URL=https://esg-compliance-backend.onrender.com/api/v1
```

**중요**: `esg-compliance-backend`를 실제 Render 서비스 이름으로 교체!

### Step 4: 배포 시작

1. **Deploy** 클릭
2. 빌드 로그 확인 (약 2-3분)
3. 배포 완료 후 URL 확인: `https://your-app.vercel.app`

### Step 5: Custom Domain (선택사항)

1. **Settings** → **Domains** 이동
2. Custom domain 추가
3. DNS 설정 완료

✅ **완료**: Vercel URL 메모장에 저장

---

## 4. 환경 변수 설정 요약

### Render (Backend)

| 변수 | 값 | 필수 |
|------|-----|------|
| `DATABASE_URL` | Supabase Connection String | ✅ |
| `AI_ASSIST_GEMINI_API_KEY` | Google AI Studio API Key | ✅ |
| `AI_ASSIST_USE_JSON_VECTOR_STORE` | `true` | ⚠️ |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | ⚠️ |

### Vercel (Frontend)

| 변수 | 값 | 필수 |
|------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` | ✅ |

---

## 5. 배포 후 검증

### ✅ 체크리스트

#### Backend 검증
```bash
# Health Check
curl https://your-backend.onrender.com/api/v1/health

# Vector Store Status
curl https://your-backend.onrender.com/api/v1/ai-assist/vectorstore/status

# ESG Mapping Test
curl -X POST https://your-backend.onrender.com/api/v1/ai-assist/map-esg \
  -H "Content-Type: application/json" \
  -d '{
    "text": "임직원 교육 프로그램",
    "document_id": 1,
    "block_id": "test",
    "frameworks": ["GRI"],
    "top_k": 5
  }'
```

#### Frontend 검증
1. Vercel URL 접속: `https://your-app.vercel.app`
2. 리포트 생성 테스트
3. AI 매핑 기능 테스트
4. 브라우저 콘솔에서 에러 확인

#### 통합 검증
- [ ] 리포트 생성 → 저장 → 로드
- [ ] AI 매핑: 블록 선택 → Sparkles 클릭 → GRI 매핑 확인
- [ ] 네트워크: DevTools에서 API 호출 성공 확인
- [ ] 성능: AI 매핑 응답 시간 < 5초

---

## 🐛 트러블슈팅

### 1. Render Sleep 문제

**증상**: 15분 비활성 후 첫 요청이 느림 (50초+)

**해결**:
```bash
# BetterStack에서 10분마다 Health Check
curl https://your-backend.onrender.com/api/v1/health
```

또는 README에 명시:
> "⏰ 첫 요청 시 50초 정도 소요될 수 있습니다 (서버 Wake-up)"

### 2. CORS 에러

**증상**: 
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**해결**: Render 환경 변수 업데이트
```bash
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### 3. Database Connection 실패

**증상**:
```
could not connect to server: Connection refused
```

**해결**: 
1. Supabase에서 **Connection Pooling** URL 사용 (Port 6543)
2. `DATABASE_URL`에 비밀번호 정확히 입력
3. Supabase 프로젝트가 활성화 상태인지 확인

### 4. JSON Vector Store 로드 실패

**증상**:
```
FileNotFoundError: Vector JSON not found
```

**해결**:
1. `frontend/public/data/esg_vectors.json` 파일 존재 확인
2. Vercel 배포 시 `public` 폴더 포함 확인
3. 파일 크기 확인: 약 4.18 MB

### 5. Gemini API 에러

**증상**:
```
401 Unauthorized: Invalid API key
```

**해결**:
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 새 API Key 생성
2. Render 환경 변수에 정확히 복사
3. API Key에 공백 없는지 확인

---

## 📊 모니터링

### Render 로그 확인
```bash
# Dashboard에서 Logs 탭 확인
# 또는 CLI 사용:
render logs -s your-service-name
```

### Vercel 로그 확인
```bash
# Dashboard에서 Deployments → Logs 확인
```

### Supabase 모니터링
```bash
# Dashboard → Reports → Database
# Query Performance, Table Size 확인
```

---

## 🎯 최적화 팁

### 1. Render Wake-up 최소화
- BetterStack 무료 모니터링 (10분 간격 ping)
- README에 "첫 로드 시 대기 시간" 명시

### 2. Vercel Static File 캐싱
- `esg_vectors.json`은 자동으로 CDN 캐싱
- 업데이트 시 새로 배포 필요

### 3. Database Query 최적화
- 자주 사용하는 쿼리에 인덱스 추가
- Supabase Dashboard에서 Slow Queries 확인

---

## ✅ 배포 완료 체크리스트

- [ ] Supabase 프로젝트 생성 및 테이블 마이그레이션
- [ ] Render Backend 배포 및 환경 변수 설정
- [ ] Vercel Frontend 배포 및 환경 변수 설정
- [ ] Health Check 통과
- [ ] AI 매핑 기능 테스트 성공
- [ ] CORS 설정 확인
- [ ] README에 배포 URL 업데이트

---

## 📚 참고 자료

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google AI Studio](https://aistudio.google.com/)

---

## 🎉 배포 성공!

축하합니다! 이제 포트폴리오용 ESG Compliance AI가 실행 중입니다.

**Next Steps**:
1. README.md에 라이브 데모 링크 추가
2. 스크린샷/GIF 캡처
3. 포트폴리오에 프로젝트 추가

---

**작성일**: 2025-01-20  
**버전**: 1.0.0

