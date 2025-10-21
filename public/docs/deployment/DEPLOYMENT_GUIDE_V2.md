# ESG Compliance AI - 배포 가이드

> **무료 인프라 100% 활용**: Render (Backend) + Vercel (Frontend) + Supabase (Database)

---

## 📋 배포 전 체크리스트

- [ ] Gemini API Key 발급 완료
- [ ] Supabase 프로젝트 생성 완료
- [ ] Naver API 키 발급 완료 (크롤러용)
- [ ] GitHub Repository Push 완료
- [ ] `backend/data/esg_vectors.json` 파일 존재 확인
- [ ] 로컬 테스트 완료

---

## 🗄️ Phase 1: Supabase 데이터베이스 설정 (5분)

### 1.1 프로젝트 생성
```
1. https://supabase.com/dashboard 접속
2. "New Project" 클릭
3. Project Name: esg-compliance-ai
4. Database Password: 안전한 비밀번호 생성 (저장 필수!)
5. Region: Northeast Asia (Seoul)
6. "Create new project" 클릭 (2~3분 대기)
```

### 1.2 Connection String 복사
```
1. Project Settings → Database → Connection string
2. "URI" 탭 선택
3. Connection string 복사:
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

4. asyncpg용으로 변환:
   postgresql+asyncpg://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
   ^^^^^^^^^^^^^^ 추가
```

### 1.3 테이블 생성
```sql
-- Supabase SQL Editor에서 실행
-- backend/scripts/init_db.sql 파일 내용 전체 복사 & 실행
-- 또는 Alembic Migration 실행 (배포 후)
```

---

## 🐍 Phase 2: Render 백엔드 배포 (10분)

### 2.1 Render 계정 생성
```
1. https://render.com 접속
2. "Get Started for Free" → GitHub 연동
3. esg-gen-v1 Repository 권한 부여
```

### 2.2 Web Service 생성
```
1. Dashboard → "New +" → "Web Service"
2. GitHub Repository 선택: esg-gen-v1
3. 설정:
   - Name: esg-compliance-backend
   - Region: Singapore (Free Tier)
   - Branch: main
   - Root Directory: backend
   - Runtime: Python 3
   - Build Command: pip install --upgrade pip && pip install -r requirements/deploy.txt
   - Start Command: uvicorn src.main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free
```

### 2.3 환경 변수 설정 (중요!)
```
Environment 탭에서 다음 변수 추가:

[Database]
DATABASE_URL = postgresql+asyncpg://postgres.xxxxx:password@...
  └─ Supabase Connection String (asyncpg 버전)

[AI Assist - Gemini API]
AI_ASSIST_GEMINI_API_KEY = AIzaSy...
  └─ https://aistudio.google.com/app/apikey

AI_ASSIST_GEMINI_MODEL = gemini-2.5-flash

[Embedding & Vector Store]
AI_ASSIST_USE_GEMINI_EMBEDDING = true
AI_ASSIST_USE_JSON_VECTOR_STORE = true

[Logging]
AI_ASSIST_LOG_LEVEL = INFO
AI_ASSIST_METRICS_ENABLED = true

[CORS - 나중에 Vercel URL로 업데이트]
CORS_ORIGINS = http://localhost:3000,https://*.vercel.app

[Environment]
ENVIRONMENT = production

[Naver API - 크롤러용]
NAVER_CLIENT_ID = your_naver_client_id
NAVER_CLIENT_SECRET = your_naver_client_secret
```

### 2.4 배포 시작
```
1. "Create Web Service" 클릭
2. 빌드 로그 확인 (5~10분 소요)
3. 성공 시 URL 생성: https://esg-compliance-backend.onrender.com
```

### 2.5 Health Check 확인
```bash
# 브라우저에서 접속
https://esg-compliance-backend.onrender.com/api/v1/health

# 예상 응답
{
  "status": "healthy",
  "timestamp": "2025-10-21T...",
  "version": "1.0.0"
}
```

### 2.6 AI Assist 상태 확인
```bash
# Swagger UI 접속
https://esg-compliance-backend.onrender.com/docs

# /api/v1/ai-assist/vectorstore/status 엔드포인트 테스트
# 예상 응답:
{
  "collection_name": "esg_standards",
  "document_count": 181,
  "embedding_dimension": 768,
  "embedding_model": "gemini-embedding-001",
  "memory_size_mb": 2.63,
  "file_size_mb": 2.63
}
```

---

## ⚡ Phase 3: Vercel 프론트엔드 배포 (5분)

### 3.1 Vercel 계정 생성
```
1. https://vercel.com 접속
2. "Sign Up" → GitHub 연동
3. esg-gen-v1 Repository Import
```

### 3.2 프로젝트 설정
```
1. "Import Git Repository" 클릭
2. esg-gen-v1 선택
3. 설정:
   - Project Name: esg-compliance-ai
   - Framework Preset: Next.js
   - Root Directory: frontend
   - Build Command: pnpm install && pnpm build (자동 감지됨)
   - Output Directory: .next (자동 감지됨)
   - Install Command: pnpm install (자동 감지됨)
```

### 3.3 환경 변수 설정
```
Environment Variables 탭:

NEXT_PUBLIC_API_BASE_URL = https://esg-compliance-backend.onrender.com/api/v1
  └─ Render에서 생성된 Backend URL 입력
```

### 3.4 배포 시작
```
1. "Deploy" 클릭
2. 빌드 로그 확인 (3~5분 소요)
3. 성공 시 URL 생성: https://esg-compliance-ai.vercel.app
```

### 3.5 프론트엔드 접속 테스트
```
1. https://esg-compliance-ai.vercel.app 접속
2. 로그인 화면 확인
3. Dashboard 진입
4. Report Editor에서 AI Assist 테스트
```

---

## 🔄 Phase 4: CORS 업데이트 (필수!)

### 4.1 Render Environment Variables 업데이트
```
Render Dashboard → esg-compliance-backend → Environment

CORS_ORIGINS 값 수정:
Before: http://localhost:3000,https://*.vercel.app
After:  http://localhost:3000,https://esg-compliance-ai.vercel.app
        └─ 실제 Vercel URL로 교체

"Save Changes" → 자동 재배포 대기 (2~3분)
```

---

## 🧪 Phase 5: E2E 테스트 (5분)

### 5.1 백엔드 API 테스트
```bash
# Health Check
curl https://esg-compliance-backend.onrender.com/api/v1/health

# AI Assist Vector Store 상태
curl https://esg-compliance-backend.onrender.com/api/v1/ai-assist/vectorstore/status

# Companies 조회
curl https://esg-compliance-backend.onrender.com/api/v1/companies
```

### 5.2 프론트엔드 UI 테스트
```
1. Dashboard 접속
2. Report Editor 열기
3. 텍스트 입력 후 AI Assist (Cmd+K 또는 Ctrl+K)
4. ESG Mapping 결과 확인
5. 사이드바에 Suggestions 표시 확인
```

### 5.3 AI Mapping 통합 테스트
```
1. Report Editor에서 텍스트 입력:
   "2024년 Scope 1 온실가스 배출량 1,200 tCO2e, Scope 2 배출량 800 tCO2e"

2. 'Map ESG' 버튼 클릭

3. 예상 결과 (우측 사이드바):
   ✓ GRI 305-1: Direct (Scope 1) GHG emissions
   ✓ GRI 305-2: Energy indirect (Scope 2) GHG emissions
   ✓ 신뢰도 점수: 0.85~0.95
   ✓ LLM Reasoning 표시
```

---

## 📊 배포 상태 모니터링

### Render Logs
```
Render Dashboard → Logs 탭

주요 확인 사항:
- ✓ "Uvicorn running on http://0.0.0.0:10000"
- ✓ "JSON Vector Store loaded: 181 documents"
- ✓ "AI Assist initialized successfully"
- ✗ "RESOURCE_EXHAUSTED" (Gemini API Rate Limit)
- ✗ "DatabaseError" (Supabase 연결 실패)
```

### Vercel Logs
```
Vercel Dashboard → Deployments → [Latest] → Functions

주요 확인 사항:
- ✓ API 요청 성공 (200 OK)
- ✗ CORS 에러 (Render CORS_ORIGINS 확인)
- ✗ API_BASE_URL 404 (환경 변수 확인)
```

---

## 🚨 트러블슈팅

### 1. Render 빌드 실패
```
Error: No module named 'xxx'

해결:
1. requirements/deploy.txt에 패키지 추가
2. Git Commit & Push
3. Render가 자동 재배포
```

### 2. Vercel CORS 에러
```
Access to fetch at 'https://...onrender.com' has been blocked by CORS policy

해결:
1. Render Environment Variables에서 CORS_ORIGINS 확인
2. Vercel URL 정확히 입력 (https:// 포함, 뒤 슬래시 없음)
3. Render 재배포
```

### 3. AI Assist 500 에러
```
{"detail": "GEMINI_API_KEY not found"}

해결:
1. Render Environment Variables 확인
2. AI_ASSIST_GEMINI_API_KEY 값 정확히 입력
3. "Save Changes" 후 재배포
```

### 4. Database 연결 실패
```
{"detail": "Database connection failed"}

해결:
1. DATABASE_URL에 'postgresql+asyncpg://' 접두사 확인
2. Supabase Password 정확히 입력
3. Supabase Project가 'Active' 상태 확인
```

### 5. esg_vectors.json 파일 없음
```
FileNotFoundError: [Errno 2] No such file or directory: 'backend/data/esg_vectors.json'

해결:
1. 로컬에서 generate_vector_json.py 실행
2. backend/data/esg_vectors.json 생성 확인
3. Git Commit & Push
4. Render 재배포
```

---

## 🎯 배포 성공 체크리스트

- [ ] Render Backend URL 접속 가능
- [ ] `/api/v1/health` 200 OK
- [ ] `/api/v1/ai-assist/vectorstore/status` 181 documents
- [ ] Vercel Frontend URL 접속 가능
- [ ] Dashboard 로그인 성공
- [ ] Report Editor AI Assist 작동
- [ ] ESG Mapping 결과 사이드바 표시
- [ ] Render Logs 에러 없음
- [ ] Vercel Logs CORS 에러 없음

---

## 📈 성능 최적화 팁

### Render Free Tier 제약
```
- 15분 무활동 시 Sleep (첫 요청 Cold Start 30초)
- 월 750시간 무료 (31일 * 24시간 = 744시간)
- 0.1 vCPU, 512MB RAM

대응 전략:
1. Uptime Robot으로 5분마다 Health Check (Sleep 방지)
2. 첫 요청 타임아웃 60초로 설정 (Cold Start 대비)
3. JSON Vector Store로 메모리 82MB 유지
```

### Vercel Free Tier 제약
```
- 월 100GB Bandwidth
- 빌드 시간 6,000분/월

대응 전략:
1. 정적 에셋 최적화 (이미지 압축)
2. API 요청 최소화 (캐싱 활용)
3. 불필요한 재배포 방지
```

---

## 🔐 보안 체크리스트

- [ ] `.env.dev`, `.env.prod` Git에 포함 안 됨 (`.gitignore` 확인)
- [ ] Render Secret Environment Variables 사용
- [ ] Vercel Environment Variables "Production" Only
- [ ] Gemini API Key 노출 안 됨 (프론트엔드에서 직접 호출 금지)
- [ ] DATABASE_URL 노출 안 됨
- [ ] CORS Origins 최소 범위로 제한

---

## 📞 도움 받기

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com

### Vercel Support
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

### Supabase Support
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## 🎉 배포 완료 후

### 다음 단계
1. **Uptime Monitoring 설정** (UptimeRobot)
2. **에러 추적 설정** (Sentry)
3. **Analytics 추가** (Google Analytics 4)
4. **커스텀 도메인 연결** (Vercel)
5. **SSL 인증서 확인** (자동 생성됨)

### 사용자 초대
```
1. Vercel Dashboard → Settings → Team Members
2. 팀원 이메일 초대
3. Render Dashboard → Settings → Members
4. 백엔드 접근 권한 공유
```

---

**🚀 축하합니다! ESG Compliance AI가 전 세계에 배포되었습니다!**

**Live URLs**:
- Frontend: https://esg-compliance-ai.vercel.app
- Backend: https://esg-compliance-backend.onrender.com
- API Docs: https://esg-compliance-backend.onrender.com/docs

