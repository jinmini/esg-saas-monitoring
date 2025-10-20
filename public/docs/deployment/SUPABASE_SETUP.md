# 🗄️ Supabase 설정 가이드

## 📋 목차
- [Supabase란?](#supabase란)
- [프로젝트 생성](#1-프로젝트-생성)
- [데이터베이스 마이그레이션](#2-데이터베이스-마이그레이션)
- [Connection String 획득](#3-connection-string-획득)
- [RLS (Row Level Security) 설정](#4-rls-설정-선택사항)
- [백업 및 복원](#5-백업-및-복원)

---

## 🎯 Supabase란?

**Supabase**는 오픈소스 Firebase 대안으로, PostgreSQL 기반의 Backend-as-a-Service입니다.

### 왜 Supabase를 선택했는가?

| 기능 | Supabase Free | Render PostgreSQL |
|------|---------------|-------------------|
| **용량** | 2GB | 0.5GB |
| **백업** | 자동 (7일) | 없음 |
| **Dashboard** | 우수 | 기본 |
| **REST API** | 제공 | 없음 |
| **비용** | $0 | $0 |

✅ **결론**: 2GB 용량 + 자동 백업으로 Supabase 선택

---

## 1. 프로젝트 생성

### Step 1: 계정 생성

1. [Supabase](https://supabase.com/) 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인

### Step 2: Organization 생성 (처음만)

1. **Create Organization** 클릭
2. Organization name: `esg-projects` (또는 원하는 이름)
3. **Create organization** 클릭

### Step 3: 프로젝트 생성

1. **New Project** 클릭
2. 프로젝트 정보 입력:

```yaml
Name: esg-compliance-ai
Database Password: [강력한 비밀번호 생성 - 메모장에 저장!]
Region: Northeast Asia (Seoul) 또는 Southeast Asia (Singapore)
Pricing Plan: Free
```

3. **Create new project** 클릭
4. 프로젝트 생성 대기 (약 2분)

✅ **완료**: 프로젝트 생성 완료 후 Dashboard 표시

---

## 2. 데이터베이스 마이그레이션

### Step 1: SQL Editor 접속

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

### Step 2: 테이블 생성 SQL 실행

아래 SQL을 복사하여 실행:

```sql
-- ============================================
-- ESG Compliance AI Database Schema
-- ============================================

-- 1. Documents 테이블
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sections 테이블
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- 3. Blocks 테이블 (JSON 저장)
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    section_id INTEGER NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    content JSONB,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- 4. Versions 테이블 (버전 관리)
CREATE TABLE IF NOT EXISTS versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    title VARCHAR(255),
    snapshot_data JSONB NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- Documents 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_template ON documents(is_template);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Sections 인덱스
CREATE INDEX IF NOT EXISTS idx_sections_document_id ON sections(document_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(document_id, order_index);

-- Blocks 인덱스
CREATE INDEX IF NOT EXISTS idx_blocks_section_id ON blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON blocks(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_blocks_type ON blocks(block_type);

-- Versions 인덱스
CREATE INDEX IF NOT EXISTS idx_versions_document_id ON versions(document_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at DESC);

-- ============================================
-- 트리거 (자동 updated_at 갱신)
-- ============================================

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documents 트리거
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sections 트리거
CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Blocks 트리거
CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 샘플 데이터 (선택사항)
-- ============================================

-- 템플릿 문서 생성
INSERT INTO documents (title, description, is_template, is_public)
VALUES 
    ('ESG 보고서 기본 템플릿', 'GRI 기반 ESG 보고서 기본 구조', true, true),
    ('지속가능성 보고서 템플릿', 'SASB 기반 지속가능성 보고서 구조', true, true)
ON CONFLICT DO NOTHING;
```

3. **Run** 버튼 클릭 (Ctrl + Enter)
4. "Success. No rows returned" 메시지 확인

### Step 3: 테이블 확인

1. 좌측 메뉴 **Table Editor** 클릭
2. 생성된 테이블 확인:
   - ✅ `documents`
   - ✅ `sections`
   - ✅ `blocks`
   - ✅ `versions`

---

## 3. Connection String 획득

### Step 1: Settings 접속

1. 좌측 메뉴 하단 **Settings** (⚙️) 클릭
2. **Database** 탭 선택

### Step 2: Connection String 복사

**중요**: **Connection Pooling** 사용!

1. **Connection Pooling** 섹션으로 스크롤
2. **URI** 탭 선택
3. 다음 형식의 URL 복사:

```
postgresql://postgres.[PROJECT-ID]:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

4. `[YOUR-PASSWORD]`를 실제 비밀번호로 **수동 교체**

### 예시:

```bash
# Before
postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# After (비밀번호: MyStr0ngP@ssw0rd)
postgresql://postgres.abcdefghijk:MyStr0ngP@ssw0rd@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### ⚠️ 주의사항

- ❌ **Direct Connection** URL은 사용하지 마세요 (Port 5432)
- ✅ **Connection Pooling** URL 사용 (Port 6543)
- 이유: Render 무료 티어는 동시 연결 수 제한

✅ **완료**: Connection String을 안전한 곳에 저장

---

## 4. RLS (Row Level Security) 설정 (선택사항)

### RLS란?

Row Level Security는 PostgreSQL의 보안 기능으로, 사용자별로 행(row) 단위 접근 제어가 가능합니다.

### 포트폴리오 프로젝트에서는?

**현재는 설정하지 않음**
- 사용자 인증 기능이 없음
- 데모 목적으로 모든 데이터 공개
- 추후 OAuth 추가 시 설정 고려

### 향후 설정 예시 (참고용)

```sql
-- RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 정책: 본인이 작성한 문서만 조회
CREATE POLICY "Users can view own documents"
ON documents FOR SELECT
USING (user_id = auth.uid());

-- 정책: 본인이 작성한 문서만 수정
CREATE POLICY "Users can update own documents"
ON documents FOR UPDATE
USING (user_id = auth.uid());
```

---

## 5. 백업 및 복원

### 자동 백업

Supabase Free Tier는 **7일간 자동 백업** 제공:

1. **Settings** → **Database** → **Backups**
2. 자동 백업 목록 확인
3. **Restore** 버튼으로 복원 가능

### 수동 백업 (SQL Dump)

#### 백업 생성

```bash
# pg_dump 설치 필요
pg_dump "postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" > backup.sql
```

#### 백업 복원

```bash
psql "postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres" < backup.sql
```

### CSV Export (간단한 백업)

1. **Table Editor** → 원하는 테이블 선택
2. **Export** 버튼 클릭
3. CSV 다운로드

---

## 📊 모니터링

### Database Health

1. **Reports** → **Database** 이동
2. 확인 항목:
   - Query Performance
   - Table Size
   - Index Hit Rate

### Query Performance

```sql
-- Slow Query 확인
SELECT
    query,
    calls,
    total_time / 1000 as total_time_sec,
    mean_time / 1000 as mean_time_sec
FROM pg_stat_statements
WHERE mean_time > 1000  -- 1초 이상
ORDER BY total_time DESC
LIMIT 10;
```

---

## 🐛 트러블슈팅

### 1. Connection Refused

**증상**:
```
could not connect to server: Connection refused
```

**해결**:
- Supabase 프로젝트가 Paused 상태인지 확인
- Dashboard에서 프로젝트 Resume
- 7일 비활성 시 자동 Pause됨

### 2. Too Many Connections

**증상**:
```
FATAL: remaining connection slots are reserved
```

**해결**:
- ✅ **Connection Pooling** URL 사용 (Port 6543)
- ❌ Direct Connection URL 사용하지 않기 (Port 5432)

### 3. Password 인증 실패

**증상**:
```
password authentication failed for user "postgres"
```

**해결**:
1. 비밀번호에 특수문자 포함 시 URL 인코딩:
   ```
   @  →  %40
   #  →  %23
   !  →  %21
   ```
2. 비밀번호 재설정: **Settings** → **Database** → **Reset Database Password**

---

## ✅ 설정 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 마이그레이션 (테이블 4개)
- [ ] 인덱스 생성 완료
- [ ] Connection Pooling URL 복사
- [ ] Render 환경 변수에 설정
- [ ] 백엔드 연결 테스트 성공

---

## 📚 참고 자료

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**작성일**: 2025-10-20  
**버전**: 1.0.0

