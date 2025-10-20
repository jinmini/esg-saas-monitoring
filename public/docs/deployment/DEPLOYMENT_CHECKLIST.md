# ✅ 배포 체크리스트

## 📋 배포 전 준비사항

### 1. 로컬 테스트

- [ ] Backend 서버 정상 실행 (`uvicorn src.main:app`)
- [ ] Frontend 서버 정상 실행 (`pnpm dev`)
- [ ] Health Check 통과 (`/api/v1/health`)
- [ ] AI 매핑 기능 테스트 성공
- [ ] 브라우저 콘솔 에러 없음

### 2. 파일 준비

- [ ] `frontend/public/data/esg_vectors.json` 존재 (4.18MB)
- [ ] `backend/env.example.txt` 작성 완료
- [ ] `frontend/env.local.example.txt` 작성 완료
- [ ] `render.yaml` 설정 완료
- [ ] `README.md` 업데이트 완료

### 3. Git 정리

- [ ] `.gitignore`에서 `frontend/public/data/` 제외 확인
- [ ] `.env` 파일들이 Git에 포함되지 않았는지 확인
- [ ] 불필요한 파일 제거 (`__pycache__`, `node_modules` 등)
- [ ] 커밋 메시지 정리

---

## 🚀 Supabase 설정

### Step 1: 프로젝트 생성

- [ ] [Supabase Dashboard](https://supabase.com/dashboard) 접속
- [ ] 새 프로젝트 생성 (`esg-compliance-ai`)
- [ ] Region: Northeast Asia (Seoul) 선택
- [ ] Database Password 생성 및 안전한 곳에 저장

### Step 2: 데이터베이스 마이그레이션

- [ ] SQL Editor에서 테이블 생성 스크립트 실행 ([SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고)
- [ ] 테이블 생성 확인 (`documents`, `sections`, `blocks`, `versions`)
- [ ] 인덱스 생성 확인

### Step 3: Connection String 획득

- [ ] Settings → Database → Connection Pooling 이동
- [ ] URI 복사 (Port **6543**)
- [ ] 비밀번호를 실제 값으로 교체
- [ ] 메모장에 안전하게 저장

**예시**:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

---

## 🔧 Render 배포

### Step 1: 서비스 생성

- [ ] [Render Dashboard](https://dashboard.render.com/) 접속
- [ ] New → Web Service 선택
- [ ] GitHub Repository 연결
- [ ] `esg-compliance-ai` 선택

### Step 2: 설정

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
```

- [ ] 위 설정 입력 완료

### Step 3: 환경 변수

**필수 변수**:

- [ ] `DATABASE_URL` = Supabase Connection String
- [ ] `AI_ASSIST_GEMINI_API_KEY` = [Google AI Studio](https://aistudio.google.com/app/apikey) API Key

**선택 변수** (기본값 사용 가능):

- [ ] `AI_ASSIST_USE_JSON_VECTOR_STORE` = `true`
- [ ] `AI_ASSIST_EMBEDDING_DEVICE` = `cpu`
- [ ] `CORS_ORIGINS` = `http://localhost:3000,https://*.vercel.app`
- [ ] `ENVIRONMENT` = `production`

### Step 4: 배포

- [ ] Create Web Service 클릭
- [ ] 배포 로그 확인 (5-10분)
- [ ] 배포 성공 확인
- [ ] URL 메모: `https://esg-compliance-backend.onrender.com`

### Step 5: 검증

```bash
curl https://esg-compliance-backend.onrender.com/api/v1/health
```

- [ ] Status 200 응답 확인
- [ ] `{"status": "healthy"}` 응답 확인

---

## 🌐 Vercel 배포

### Step 1: 프로젝트 생성

- [ ] [Vercel Dashboard](https://vercel.com/dashboard) 접속
- [ ] Add New → Project 선택
- [ ] GitHub Repository import

### Step 2: 설정

```yaml
Framework: Next.js
Root Directory: frontend
Build Command: pnpm install && pnpm build
Output Directory: .next
Install Command: pnpm install
```

- [ ] 위 설정 확인 (자동 감지됨)

### Step 3: 환경 변수

**필수**:

- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://esg-compliance-backend.onrender.com/api/v1`

⚠️ **중요**: `esg-compliance-backend`를 실제 Render 서비스 이름으로 교체!

### Step 4: 배포

- [ ] Deploy 클릭
- [ ] 빌드 로그 확인 (2-3분)
- [ ] 배포 성공 확인
- [ ] URL 메모: `https://your-app.vercel.app`

### Step 5: CORS 업데이트 (Render)

Vercel URL 획득 후 Render 환경 변수 업데이트:

- [ ] Render Dashboard → Environment 탭
- [ ] `CORS_ORIGINS`에 Vercel URL 추가:
  ```
  https://your-app.vercel.app,https://your-app-*.vercel.app
  ```
- [ ] Save Changes
- [ ] Render 서비스 재배포 (자동)

---

## 🧪 배포 후 검증

### Backend 테스트

#### 1. Health Check

```bash
curl https://esg-compliance-backend.onrender.com/api/v1/health
```

- [ ] Status 200 확인

#### 2. Vector Store Status

```bash
curl https://esg-compliance-backend.onrender.com/api/v1/ai-assist/vectorstore/status
```

- [ ] `document_count: 181` 확인
- [ ] `embedding_dimension: 768` 확인

#### 3. ESG Mapping Test

```bash
curl -X POST https://esg-compliance-backend.onrender.com/api/v1/ai-assist/map-esg \
  -H "Content-Type: application/json" \
  -d '{
    "text": "임직원 교육 프로그램",
    "document_id": 1,
    "block_id": "test",
    "frameworks": ["GRI"],
    "top_k": 5
  }'
```

- [ ] Status 200 확인
- [ ] `suggestions` 배열에 GRI 표준 포함

### Frontend 테스트

#### 1. 접속

- [ ] Vercel URL 접속: `https://your-app.vercel.app`
- [ ] 페이지 로딩 확인

#### 2. 기능 테스트

- [ ] 리포트 생성 가능
- [ ] 블록 추가/수정/삭제 가능
- [ ] Sparkles 버튼 클릭 시 AI 패널 표시
- [ ] AI 매핑 실행 시 결과 표시

#### 3. 브라우저 콘솔

- [ ] F12 → Console 탭 확인
- [ ] 에러 메시지 없음
- [ ] Network 탭에서 API 호출 성공 (Status 200)

### 통합 테스트

#### 시나리오 1: 리포트 작성

1. [ ] 새 리포트 생성
2. [ ] 제목 입력: "2024 ESG 보고서"
3. [ ] 블록 추가: "임직원 1인당 평균 연 40시간의 교육 제공"
4. [ ] Sparkles 버튼 클릭
5. [ ] AI 매핑 실행
6. [ ] GRI 404-1 매핑 결과 확인
7. [ ] 저장 및 재로드 테스트

#### 시나리오 2: 성능 테스트

- [ ] AI 매핑 응답 시간 < 30초 (첫 요청)
- [ ] AI 매핑 응답 시간 < 5초 (이후 요청)
- [ ] 페이지 로딩 시간 < 3초

---

## 🐛 트러블슈팅

### Render Sleep 문제

**증상**: 15분 비활성 후 첫 요청이 50초 이상 소요

**해결**:
1. README에 명시: "⏰ 첫 요청 시 서버 Wake-up으로 50초 소요 가능"
2. (선택) BetterStack 무료 모니터링 설정 (10분마다 ping)

### CORS 에러

**증상**:
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**해결**:
1. Render 환경 변수 `CORS_ORIGINS` 확인
2. Vercel 도메인이 포함되어 있는지 확인
3. 와일드카드 패턴 사용: `https://*.vercel.app`

### Database Connection 실패

**증상**:
```
could not connect to server
```

**해결**:
1. Supabase에서 **Connection Pooling** URL 사용 (Port 6543)
2. `DATABASE_URL`에 비밀번호 정확히 입력
3. 특수문자 URL 인코딩 확인 (`@` → `%40`)

### Vector Store 로드 실패

**증상**:
```
FileNotFoundError: JSON vector file not found
```

**해결**:
1. `frontend/public/data/esg_vectors.json` 파일 존재 확인
2. Git에 커밋되어 있는지 확인 (`.gitignore` 예외 처리)
3. Vercel 배포 로그에서 파일 포함 여부 확인

---

## 📊 모니터링

### Render Logs

- [ ] Dashboard → Logs 탭 확인
- [ ] 에러 로그 없는지 확인
- [ ] API 요청 로그 정상

### Vercel Logs

- [ ] Dashboard → Deployments → Logs
- [ ] 빌드 로그 확인
- [ ] Runtime 로그 확인

### Supabase Monitoring

- [ ] Dashboard → Reports → Database
- [ ] Query Performance 확인
- [ ] Table Size 확인 (< 2GB)

---

## 🎯 배포 완료!

### 최종 확인

- [ ] ✅ Supabase 프로젝트 활성화
- [ ] ✅ Render Backend 배포 성공
- [ ] ✅ Vercel Frontend 배포 성공
- [ ] ✅ Health Check 통과
- [ ] ✅ AI 매핑 기능 정상 작동
- [ ] ✅ CORS 설정 완료
- [ ] ✅ 브라우저 콘솔 에러 없음

### URL 정리

```
Frontend: https://your-app.vercel.app
Backend API: https://esg-compliance-backend.onrender.com
API Docs: https://esg-compliance-backend.onrender.com/docs
Metrics: https://esg-compliance-backend.onrender.com/metrics
```

### README 업데이트

- [ ] README.md에 라이브 데모 URL 추가
- [ ] 스크린샷 추가
- [ ] 배포 아키텍처 다이어그램 추가

---

## 📚 Next Steps

### 포트폴리오 준비

1. [ ] 스크린샷/GIF 캡처
   - 메인 대시보드
   - 블록 에디터
   - AI 매핑 기능
   - 결과 패널

2. [ ] 기술 블로그 작성
   - "LLM 기반 ESG 매핑 엔진 개발기"
   - "JSON Vector Store로 ChromaDB 대체하기"
   - "100% 무료로 AI SaaS 배포하기"

3. [ ] 포트폴리오 사이트 업데이트
   - 프로젝트 추가
   - 기술 스택 강조
   - 성과 지표 (70% 성능 향상 등)

---

**작성일**: 2025-01-20  
**버전**: 1.0.0

