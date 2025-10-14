# ESG Report Editor - UI/UX 디자인 가이드

> **작성일**: 2025-10-10  
> **버전**: 1.0.0  
> **대상**: UI/UX 디자이너, 프론트엔드 개발자

---

## 📋 목차

1. [디자인 철학](#1-디자인-철학)
2. [레이아웃 시스템](#2-레이아웃-시스템)
3. [컴포넌트 디자인](#3-컴포넌트-디자인)
4. [인터랙션 패턴](#4-인터랙션-패턴)
5. [애니메이션 가이드](#5-애니메이션-가이드)
6. [색상 시스템](#6-색상-시스템)
7. [타이포그래피](#7-타이포그래피)
8. [아이콘 가이드](#8-아이콘-가이드)
9. [반응형 디자인](#9-반응형-디자인)
10. [접근성](#10-접근성)

---

## 1. 디자인 철학

### 1.1 핵심 원칙

#### 🎯 명확성 (Clarity)
- 사용자가 무엇을 할 수 있는지 즉시 이해
- 복잡한 ESG 데이터를 직관적으로 표현
- 불필요한 장식 최소화

#### ⚡ 효율성 (Efficiency)
- 최소 클릭으로 작업 완료
- 키보드 단축키 지원
- 자주 사용하는 기능에 빠른 접근

#### 🎨 일관성 (Consistency)
- 모든 블록 타입에 동일한 인터랙션 패턴
- 일관된 시각적 언어
- 예측 가능한 동작

#### 🔐 신뢰성 (Reliability)
- 자동 저장
- Undo/Redo 항상 가능
- 데이터 손실 방지

### 1.2 디자인 영감

**참고 제품**:
- **Notion**: 블록 기반 구조, 슬래시 커맨드
- **Google Docs**: 실시간 협업, 댓글 시스템
- **Confluence**: 문서 구조, 버전 관리
- **Figma**: 협업 인디케이터, 히스토리 패널

---

## 2. 레이아웃 시스템

### 2.1 전체 레이아웃 구조

```
┌─────────────────────────────────────────────────────────┐
│                        TopBar (64px)                    │
└─────────────────────────────────────────────────────────┘
┌─────────┬────────────────────────────────┬──────────────┐
│ Sidebar │         Canvas                 │   Sidebar    │
│  Left   │      (가변 너비)                │    Right     │
│ (280px) │                                │   (320px)    │
│         │  ┌──────────────────────┐      │              │
│         │  │                      │      │              │
│         │  │   Content Area       │      │              │
│         │  │   (최대 720px)       │      │              │
│         │  │                      │      │              │
│         │  └──────────────────────┘      │              │
│         │                                │              │
└─────────┴────────────────────────────────┴──────────────┘
```

### 2.2 반응형 브레이크포인트

| 디바이스 | 너비 | 레이아웃 변경 |
|----------|------|---------------|
| 모바일 | < 768px | 사이드바 숨김, 풀스크린 에디터 |
| 태블릿 | 768px - 1024px | 사이드바 토글 가능 |
| 데스크톱 | 1024px - 1440px | 3-Panel 레이아웃 |
| 대형 화면 | > 1440px | 3-Panel + 여백 확장 |

### 2.3 Canvas 콘텐츠 영역

**최대 너비**: 720px (가독성 최적화)
**좌우 패딩**: 64px
**상하 패딩**: 48px

```css
.canvas-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 64px;
}
```

**근거**:
- 영문 기준 65-75자/줄이 최적 가독성
- 한글 기준 35-45자/줄 권장
- 720px ≈ 45자 × 16px

### 2.4 섹션 간격

```css
/* 섹션 간 여백 */
.section-gap: 64px (4rem)

/* 블록 간 여백 */
.block-gap: 16px (1rem)

/* 섹션 내부 패딩 */
.section-padding: 24px (1.5rem)
```

---

## 3. 컴포넌트 디자인

### 3.1 TopBar

**높이**: 64px  
**배경**: 흰색 (`bg-white`)  
**그림자**: `shadow-sm` (0 1px 2px 0 rgba(0, 0, 0, 0.05))

```
┌─────────────────────────────────────────────────────────┐
│ [←] [문서 제목]     [💾 저장됨]  [👤👤]  [🕒] [🔗] [⋮]  │
│                     ↑              ↑      ↑   ↑   ↑     │
│                   상태            협업  버전 공유 더보기 │
└─────────────────────────────────────────────────────────┘
```

**컴포넌트 구성**:
```typescript
<TopBar>
  <LeftSection>
    <BackButton />
    <DocumentTitle editable />
  </LeftSection>
  
  <CenterSection>
    <UndoButton />
    <RedoButton />
  </CenterSection>
  
  <RightSection>
    <SaveStatus />
    <Collaborators />
    <VersionButton />
    <ShareButton />
    <MoreMenu />
  </RightSection>
</TopBar>
```

#### 저장 상태 인디케이터

| 상태 | 아이콘 | 색상 | 텍스트 |
|------|--------|------|--------|
| `idle` | - | - | - |
| `saving` | 🔄 (회전) | `text-gray-500` | "저장 중..." |
| `saved` | ✅ | `text-green-600` | "저장됨" |
| `error` | ❌ | `text-red-600` | "저장 실패" |
| `offline` | 📴 | `text-orange-500` | "오프라인" |

### 3.2 SidebarLeft (섹션 네비게이션)

**너비**: 280px  
**배경**: `bg-gray-50`  
**스크롤**: 독립적 스크롤

```
┌────────────────────┐
│ [📄 목차]          │
│                    │
│ ▼ 📄 Executive     │
│   Summary          │
│   └─ 🌍 Env (5)    │
│   └─ 👥 Social (3) │
│                    │
│ ▶ 📄 Performance   │
│   Data             │
│                    │
│ [+ 섹션 추가]      │
└────────────────────┘
```

#### 섹션 아이템 상태

**기본 상태**:
```css
.section-item {
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.section-item:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

**활성 상태** (현재 보고 있는 섹션):
```css
.section-item.active {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #3b82f6;
}
```

#### ESG 카테고리 뱃지

```typescript
const categoryStyles = {
  environmental: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: '🌍',
  },
  social: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: '👥',
  },
  governance: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: '📊',
  },
};
```

### 3.3 SidebarRight (댓글/활동)

**너비**: 320px  
**배경**: `bg-white`  
**경계선**: `border-l border-gray-200`

```
┌────────────────────┐
│ [💬 댓글] [📋 활동] │
├────────────────────┤
│                    │
│ 👤 홍길동          │
│ "이 부분 확인..."  │
│ 3시간 전           │
│   └─ 답글 (2)      │
│                    │
│ 👤 김철수          │
│ "수정 완료"        │
│ 5시간 전           │
│                    │
├────────────────────┤
│ [필터]             │
│ ☑ 미해결           │
│ □ 해결됨           │
└────────────────────┘
```

#### 댓글 스레드 디자인

```typescript
<CommentThread>
  <CommentHeader>
    <Avatar src={user.avatar} />
    <UserName>{user.name}</UserName>
    <Timestamp>{comment.createdAt}</Timestamp>
  </CommentHeader>
  
  <CommentBody>
    {comment.text}
  </CommentBody>
  
  <CommentActions>
    <ReplyButton />
    <ResolveButton />
    <MoreButton />
  </CommentActions>
  
  {comment.replies && (
    <RepliesList>
      {comment.replies.map(reply => (
        <Reply key={reply.id} {...reply} />
      ))}
    </RepliesList>
  )}
</CommentThread>
```

### 3.4 블록 디자인

#### 기본 블록 구조

```
┌─────────────────────────────────────────┐
│ [🔲][+][⋮]  블록 내용...                │ ← 호버 시 액션 표시
└─────────────────────────────────────────┘
   ↑   ↑  ↑
  드래그 추가 더보기
```

#### 블록 상태별 스타일

**기본**:
```css
.block {
  padding: 8px 16px;
  border-radius: 4px;
  margin: 8px 0;
  position: relative;
}
```

**호버**:
```css
.block:hover {
  background: rgba(0, 0, 0, 0.02);
}

.block:hover .block-actions {
  opacity: 1;
}
```

**포커스** (편집 중):
```css
.block:focus-within {
  background: white;
  box-shadow: 0 0 0 2px #3b82f6;
  outline: none;
}
```

**선택됨** (드래그 중):
```css
.block.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}
```

### 3.5 BlockActions (호버 메뉴)

**위치**: 블록 왼쪽 `-40px`  
**표시 조건**: 블록 호버 시  
**애니메이션**: `opacity 0 → 1` (200ms)

```
    [🔲]  ← 드래그 핸들
    [+]   ← 블록 추가
    [⋮]   ← 더보기 메뉴
      └─ [↑ 위로 이동]
      └─ [↓ 아래로 이동]
      └─ [📋 복제]
      └─ [🗑️ 삭제]
```

**버튼 스타일**:
```css
.block-action-button {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.block-action-button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: scale(1.05);
}

.block-action-button:active {
  transform: scale(0.95);
}
```

### 3.6 BlockTypeMenu (블록 선택 메뉴)

**크기**: 320px × 최대 400px  
**위치**: 블록 아래 또는 + 버튼 근처  
**애니메이션**: Scale + Fade (100ms)

```
┌────────────────────────────────┐
│ 🔍 [블록 검색...] [✕]          │
├────────────────────────────────┤
│ 📝 본문      /p                │ ← 기본
│    일반 텍스트 단락             │
│                                │
│ 📄 제목 1    /h1               │ ← 선택됨 (파란 배경)
│    가장 큰 제목                │
│                                │
│ 📄 제목 2    /h2               │
│    중간 크기 제목              │
│                                │
│ 📊 표        /table            │
│    데이터를 표 형태로 정리      │
│                                │
│ 🖼️ 이미지     /img             │
│    사진이나 그림 삽입           │
└────────────────────────────────┘
```

**메뉴 아이템 스타일**:
```css
.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f3f4f6;
}

.menu-item.selected {
  background: #dbeafe;  /* blue-100 */
  color: #1e40af;       /* blue-800 */
}
```

### 3.7 FloatingToolbar (텍스트 포맷팅)

**위치**: 선택 영역 위 16px  
**표시 조건**: 텍스트 선택 시  
**애니메이션**: Slide up + Fade (150ms)

```
     ▲ (화살표)
┌─────────────────────────────────────┐
│ [B] [I] [U] [H] [Code] [🔗] [💬]  │
│  ↑   ↑   ↑   ↑    ↑     ↑    ↑    │
│ 굵게 기울임 밑줄 하이 코드 링크 댓글│
└─────────────────────────────────────┘
```

**버튼 상태**:
```css
/* 기본 */
.toolbar-button {
  padding: 6px 10px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.15s;
}

/* 호버 */
.toolbar-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* 활성 (이미 적용된 포맷) */
.toolbar-button.active {
  background: #3b82f6;
  color: white;
}
```

### 3.8 TableBlock (표 블록)

**최소 크기**: 1행 1열  
**기본 크기**: 3행 3열  
**셀 최소 너비**: 100px

```
┌─────────────┬─────────────┬─────────────┐
│ Header 1    │ Header 2    │ Header 3    │ ← 헤더 (회색 배경)
├─────────────┼─────────────┼─────────────┤
│ Cell 1,1 🗑️│ Cell 1,2    │ Cell 1,3    │ ← 호버 시 🗑️
├─────────────┼─────────────┼─────────────┤
│ Cell 2,1    │ Cell 2,2    │ Cell 2,3    │
└─────────────┴─────────────┴─────────────┘
      ↓              ↓             ↓
   [1번 열 삭제] [2번 열 삭제] [3번 열 삭제]  ← 호버 시

[➕ 행 추가] [➕ 열 추가]
```

**셀 스타일**:
```css
/* 헤더 셀 */
th {
  background: #f9fafb;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #e5e7eb;
}

/* 일반 셀 */
td {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  vertical-align: top;
}

/* 편집 가능 셀 */
td[contenteditable="true"]:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}
```

### 3.9 ImageBlock (이미지 블록)

**최소 너비**: 20%  
**최대 너비**: 100%  
**기본 너비**: 80%

```
┌─────────────────────────────────────┐
│  [이미지 URL 입력 또는 파일 업로드]  │
│                                     │
│  ┌───────────────────────┐          │
│  │                       │          │
│  │      [이미지 표시]    │ ← 호버: 툴바
│  │                       │   [◀][▣][▶][🔗][🗑️]
│  └───────────────────────┘          │
│                                     │
│  너비: ━━━━━━━●━━━ 80%              │
└─────────────────────────────────────┘
```

**정렬 옵션**:
```typescript
const alignments = {
  left: { justify: 'flex-start', icon: <AlignLeft /> },
  center: { justify: 'center', icon: <AlignCenter /> },
  right: { justify: 'flex-end', icon: <AlignRight /> },
};
```

**이미지 툴바**:
```css
.image-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 6px;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-block:hover .image-toolbar {
  opacity: 1;
}
```

---

## 4. 인터랙션 패턴

### 4.1 블록 추가 플로우

```
사용자 액션 → 메뉴 표시 → 타입 선택 → 블록 생성
```

**방법 1: + 버튼**
```
1. 블록 호버
2. [+] 버튼 클릭
3. BlockTypeMenu 표시
4. 블록 타입 선택
5. 해당 위치에 블록 추가
```

**방법 2: 섹션 끝 버튼**
```
1. 섹션 끝 [+ 블록 추가] 버튼 클릭
2. BlockTypeMenu 표시
3. 블록 타입 선택
4. 섹션 끝에 블록 추가
```

**방법 3: 슬래시 커맨드**
```
1. 빈 블록에서 '/' 입력
2. BlockTypeMenu 자동 표시
3. 검색어 입력 (선택)
4. 블록 타입 선택
5. 기존 블록이 선택한 타입으로 변환
```

### 4.2 텍스트 포맷팅 플로우

```
텍스트 선택 → 툴바 표시 → 포맷 적용 → Command 저장
```

**단계별 동작**:
```
1. 사용자가 텍스트 드래그 선택
2. 150ms 후 FloatingToolbar 표시
3. 포맷 버튼 클릭 (예: Bold)
4. ApplyMarkCommand 실행
5. 선택 영역에 <strong> 태그 적용
6. 툴바의 [B] 버튼 활성 상태로 변경
```

### 4.3 드래그 앤 드롭 (예정)

```
드래그 시작 → 시각적 피드백 → 드롭 → 위치 업데이트
```

**단계별 동작**:
```
1. 드래그 핸들 [🔲] 마우스 다운
2. 블록 opacity: 0.5, 원본 위치에 placeholder 표시
3. 드래그 중 마우스 위치에 따라 drop zone 하이라이트
4. 마우스 업: MoveBlockCommand 실행
5. 애니메이션으로 최종 위치로 이동
```

### 4.4 Undo/Redo 플로우

```
액션 실행 → Command Stack 푸시 → Undo/Redo 버튼 활성화
```

**Undo 시나리오**:
```
초기 상태: past=[A, B, C], future=[]

1. Undo 실행 (Ctrl+Z)
2. C.undo() 호출
3. 상태: past=[A, B], future=[C]
4. 문서 상태 C 이전으로 되돌림
```

**Redo 시나리오**:
```
상태: past=[A, B], future=[C]

1. Redo 실행 (Ctrl+Shift+Z)
2. C.execute() 호출
3. 상태: past=[A, B, C], future=[]
4. 문서 상태 C 다시 적용
```

### 4.5 저장 플로우

```
문서 변경 → isDirty=true → 3초 대기 → 자동 저장
```

**Debounced 저장**:
```typescript
const debouncedSave = useDebouncedCallback(
  async (document: DocumentNode) => {
    setSaveStatus('saving');
    
    try {
      await saveDocument(document);
      setSaveStatus('saved');
      setLastSaved(new Date());
      setIsDirty(false);
      
      // 2초 후 'saved' 상태 초기화
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    }
  },
  3000  // 3초 대기
);
```

---

## 5. 애니메이션 가이드

### 5.1 애니메이션 원칙

**Duration (지속 시간)**:
- **즉각 반응** (< 100ms): 버튼 호버, 포커스
- **빠른 전환** (100-200ms): 메뉴 열기/닫기, 툴바 표시
- **자연스러운 이동** (200-300ms): 블록 이동, 페이드 인/아웃
- **느린 애니메이션** (> 300ms): 페이지 전환, 로딩

**Easing (가속도 곡선)**:
```css
/* 표준 */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);

/* 감속 (Decelerate) - 들어오는 요소 */
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);

/* 가속 (Accelerate) - 나가는 요소 */
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);

/* 튕김 (Bounce) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 5.2 Framer Motion 변형(Variants)

#### 페이드 인/아웃
```typescript
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {children}
</motion.div>
```

#### 슬라이드 업
```typescript
const slideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    y: 10, 
    opacity: 0, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  },
};
```

#### 스케일 + 페이드
```typescript
const scaleVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { duration: 0.15, ease: 'easeOut' } 
  },
  exit: { 
    scale: 0.95, 
    opacity: 0, 
    transition: { duration: 0.1, ease: 'easeIn' } 
  },
};
```

### 5.3 애니메이션 적용 예시

#### BlockTypeMenu 열기
```typescript
<AnimatePresence>
  {showBlockTypeMenu && (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="block-type-menu"
    >
      {/* 메뉴 내용 */}
    </motion.div>
  )}
</AnimatePresence>
```

#### FloatingToolbar 표시
```typescript
<motion.div
  initial={{ y: 10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 5, opacity: 0 }}
  transition={{ duration: 0.15 }}
  className="floating-toolbar"
>
  {/* 툴바 버튼 */}
</motion.div>
```

#### 블록 삭제 애니메이션
```typescript
<motion.div
  layout
  exit={{ 
    height: 0, 
    opacity: 0, 
    marginTop: 0, 
    marginBottom: 0,
    transition: { duration: 0.2 } 
  }}
>
  {block}
</motion.div>
```

---

## 6. 색상 시스템

### 6.1 브랜드 색상

```css
/* Primary (파랑) */
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

**사용 예시**:
- 링크: `--primary-500`
- 버튼 (활성): `--primary-600`
- 포커스 링: `--primary-500`
- 배경 (선택됨): `--primary-100`

### 6.2 ESG 카테고리 색상

```css
/* Environmental (초록) */
--env-bg: #d1fae5;      /* green-100 */
--env-text: #065f46;    /* green-800 */
--env-icon: #10b981;    /* green-500 */

/* Social (파랑) */
--social-bg: #dbeafe;   /* blue-100 */
--social-text: #1e40af; /* blue-800 */
--social-icon: #3b82f6; /* blue-500 */

/* Governance (보라) */
--gov-bg: #ede9fe;      /* purple-100 */
--gov-text: #5b21b6;    /* purple-800 */
--gov-icon: #8b5cf6;    /* purple-500 */
```

### 6.3 시맨틱 색상

```css
/* Success (성공) */
--success: #10b981;     /* green-500 */
--success-bg: #d1fae5;  /* green-100 */
--success-text: #065f46;/* green-800 */

/* Warning (경고) */
--warning: #f59e0b;     /* amber-500 */
--warning-bg: #fef3c7;  /* amber-100 */
--warning-text: #92400e;/* amber-800 */

/* Error (에러) */
--error: #ef4444;       /* red-500 */
--error-bg: #fee2e2;    /* red-100 */
--error-text: #991b1b;  /* red-800 */

/* Info (정보) */
--info: #3b82f6;        /* blue-500 */
--info-bg: #dbeafe;     /* blue-100 */
--info-text: #1e40af;   /* blue-800 */
```

### 6.4 중립 색상 (그레이스케일)

```css
/* Gray Scale */
--gray-50:  #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

**사용 가이드**:
- 배경: `--gray-50`
- 경계선: `--gray-200`
- 비활성 텍스트: `--gray-500`
- 주요 텍스트: `--gray-800`

### 6.5 다크모드 (향후 구현)

```css
/* 다크모드 색상 */
--dark-bg: #111827;          /* gray-900 */
--dark-surface: #1f2937;     /* gray-800 */
--dark-border: #374151;      /* gray-700 */
--dark-text-primary: #f9fafb;/* gray-50 */
--dark-text-secondary: #9ca3af; /* gray-400 */
```

---

## 7. 타이포그래피

### 7.1 폰트 패밀리

```css
/* 본문 (한글 + 영문) */
font-family: 
  'Pretendard', 
  -apple-system, 
  BlinkMacSystemFont, 
  'Segoe UI', 
  'Roboto', 
  sans-serif;

/* 코드 */
font-family: 
  'Fira Code', 
  'JetBrains Mono', 
  'Consolas', 
  monospace;

/* 숫자 (표, 차트) */
font-variant-numeric: tabular-nums;
```

### 7.2 타입 스케일

```css
/* Heading Levels */
.text-h1 { font-size: 32px; line-height: 1.2; font-weight: 600; }
.text-h2 { font-size: 24px; line-height: 1.3; font-weight: 600; }
.text-h3 { font-size: 20px; line-height: 1.4; font-weight: 600; }

/* Body Text */
.text-base  { font-size: 16px; line-height: 1.6; font-weight: 400; }
.text-sm    { font-size: 14px; line-height: 1.5; font-weight: 400; }
.text-xs    { font-size: 12px; line-height: 1.5; font-weight: 400; }

/* Special */
.text-caption { font-size: 12px; line-height: 1.4; color: var(--gray-500); }
.text-label   { font-size: 14px; line-height: 1.4; font-weight: 500; }
.text-code    { font-size: 14px; line-height: 1.6; font-family: 'Fira Code'; }
```

### 7.3 블록별 타이포그래피

**제목 블록**:
```css
h1.block-heading { 
  font-size: 32px; 
  line-height: 1.2; 
  font-weight: 600;
  margin: 24px 0 16px;
}

h2.block-heading { 
  font-size: 24px; 
  line-height: 1.3; 
  font-weight: 600;
  margin: 20px 0 12px;
}

h3.block-heading { 
  font-size: 20px; 
  line-height: 1.4; 
  font-weight: 600;
  margin: 16px 0 8px;
}
```

**본문 블록**:
```css
p.block-paragraph { 
  font-size: 16px; 
  line-height: 1.6; 
  margin: 8px 0;
}
```

**인용 블록**:
```css
blockquote.block-quote {
  font-size: 18px;
  line-height: 1.6;
  font-style: italic;
  color: var(--gray-600);
  border-left: 4px solid var(--gray-300);
  padding-left: 16px;
  margin: 16px 0;
}
```

### 7.4 텍스트 포맷 스타일

```css
/* Bold */
strong { font-weight: 600; }

/* Italic */
em { font-style: italic; }

/* Underline */
u { text-decoration: underline; text-underline-offset: 2px; }

/* Strikethrough */
s { text-decoration: line-through; }

/* Highlight */
mark { 
  background: #fef3c7; 
  color: #92400e; 
  padding: 2px 4px; 
  border-radius: 2px;
}

/* Inline Code */
code { 
  background: #f3f4f6; 
  color: #dc2626; 
  padding: 2px 6px; 
  border-radius: 4px;
  font-size: 14px;
  font-family: 'Fira Code', monospace;
}

/* Link */
a { 
  color: var(--primary-500); 
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.15s;
}

a:hover { color: var(--primary-700); }
```

---

## 8. 아이콘 가이드

### 8.1 아이콘 라이브러리

**사용 라이브러리**: `lucide-react`

**이유**:
- 일관된 디자인 언어
- 트리 쉐이킹 지원 (번들 크기 최적화)
- SVG 기반 (확장성)
- 활발한 유지보수

### 8.2 아이콘 크기

```typescript
// 작은 아이콘 (버튼, 인라인)
<Icon size={16} />

// 기본 아이콘 (툴바, 메뉴)
<Icon size={18} />

// 큰 아이콘 (헤더, 강조)
<Icon size={20} />

// 특대 아이콘 (빈 상태, 일러스트)
<Icon size={48} />
```

### 8.3 블록 타입 아이콘 매핑

```typescript
import {
  Type,           // paragraph
  Heading1,       // heading level 1
  Heading2,       // heading level 2
  Heading3,       // heading level 3
  List,           // bullet list
  ListOrdered,    // numbered list
  CheckSquare,    // checkbox list
  Quote,          // quote
  Table,          // table
  Image,          // image
  BarChart,       // chart
  Leaf,           // ESG metric
} from 'lucide-react';

const blockIcons = {
  paragraph: <Type size={18} />,
  heading: <Heading1 size={18} />,
  list: <List size={18} />,
  quote: <Quote size={18} />,
  table: <Table size={18} />,
  image: <Image size={18} />,
  chart: <BarChart size={18} />,
  esgMetric: <Leaf size={18} />,
};
```

### 8.4 액션 아이콘

```typescript
import {
  Plus,           // 추가
  Trash2,         // 삭제
  Copy,           // 복제
  GripVertical,   // 드래그 핸들
  ArrowUp,        // 위로 이동
  ArrowDown,      // 아래로 이동
  MoreVertical,   // 더보기 메뉴
  Save,           // 저장
  Cloud,          // 클라우드 저장
  Undo2,          // Undo
  Redo2,          // Redo
  Bold,           // 굵게
  Italic,         // 기울임
  Underline,      // 밑줄
  Highlighter,    // 하이라이트
  Code,           // 코드
  Link,           // 링크
  MessageSquare,  // 댓글
} from 'lucide-react';
```

### 8.5 상태 아이콘

```typescript
import {
  Check,          // 성공, 완료
  X,              // 닫기, 취소
  AlertCircle,    // 경고
  AlertTriangle,  // 에러
  Info,           // 정보
  Loader,         // 로딩 (회전)
  CloudOff,       // 오프라인
} from 'lucide-react';
```

---

## 9. 반응형 디자인

### 9.1 브레이크포인트 전략

```typescript
const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};
```

### 9.2 레이아웃 변화

#### 데스크톱 (≥ 1024px)
```
[SidebarLeft (280px)] [Canvas (가변)] [SidebarRight (320px)]
```

#### 태블릿 (768px - 1023px)
```
[Canvas (전체 너비)]
[SidebarLeft 토글 가능]
[SidebarRight 토글 가능]
```

#### 모바일 (< 768px)
```
[Canvas (전체 너비)]
[Bottom Sheet 방식 메뉴]
```

### 9.3 반응형 클래스

```typescript
// Tailwind 반응형 유틸리티
<div className="
  w-full                 // 모바일: 전체 너비
  md:w-auto             // 태블릿: 자동
  lg:w-280              // 데스크톱: 280px
  
  hidden                 // 모바일: 숨김
  lg:block              // 데스크톱: 표시
  
  p-4                    // 모바일: 16px 패딩
  md:p-6                // 태블릿: 24px 패딩
  lg:p-8                // 데스크톱: 32px 패딩
">
```

### 9.4 터치 최적화 (모바일)

```css
/* 터치 타겟 최소 크기 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* 터치 피드백 */
.touch-button:active {
  transform: scale(0.95);
  background: rgba(0, 0, 0, 0.05);
}

/* 스크롤 최적화 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

---

## 10. 접근성

### 10.1 키보드 네비게이션

**전역 단축키**:
```
Ctrl+Z          : Undo
Ctrl+Shift+Z    : Redo
Ctrl+B          : 굵게
Ctrl+I          : 기울임
Ctrl+U          : 밑줄
Ctrl+E          : 인라인 코드
Ctrl+K          : 링크 추가
/               : 슬래시 커맨드
Esc             : 메뉴 닫기
```

**블록 네비게이션**:
```
Tab             : 다음 블록으로 이동
Shift+Tab       : 이전 블록으로 이동
Enter           : 블록 편집 모드
Esc             : 편집 취소
```

**메뉴 네비게이션**:
```
ArrowDown       : 다음 아이템
ArrowUp         : 이전 아이템
Enter           : 아이템 선택
Esc             : 메뉴 닫기
```

### 10.2 ARIA 속성

```typescript
// 버튼
<button
  aria-label="블록 삭제"
  aria-keyshortcuts="Delete"
  role="button"
>
  <Trash2 />
</button>

// 토글 버튼
<button
  aria-label="왼쪽 사이드바 토글"
  aria-pressed={isLeftSidebarOpen}
  role="button"
>
  <PanelLeft />
</button>

// 편집 가능 영역
<div
  contentEditable
  role="textbox"
  aria-label="블록 내용 편집"
  aria-multiline="true"
>
  {content}
</div>

// 메뉴
<div role="menu" aria-label="블록 타입 선택">
  <button role="menuitem" aria-label="제목 1">
    <Heading1 /> 제목 1
  </button>
</div>
```

### 10.3 포커스 관리

```typescript
// 포커스 가능한 요소
const focusableElements = 
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// 트랩 포커스 (모달, 드로어)
const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
  const focusableContent = containerRef.current?.querySelectorAll(focusableElements);
  const firstFocusable = focusableContent?.[0];
  const lastFocusable = focusableContent?.[focusableContent.length - 1];

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        (lastFocusable as HTMLElement)?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        (firstFocusable as HTMLElement)?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
};
```

### 10.4 색상 대비

**WCAG AA 준수** (최소 대비율 4.5:1)

```css
/* 주요 텍스트 */
color: #1f2937; /* gray-800 */
background: #ffffff;
/* 대비율: 14.52:1 ✅ */

/* 부가 텍스트 */
color: #6b7280; /* gray-500 */
background: #ffffff;
/* 대비율: 4.76:1 ✅ */

/* 버튼 */
color: #ffffff;
background: #3b82f6; /* primary-500 */
/* 대비율: 4.56:1 ✅ */
```

### 10.5 스크린 리더 지원

```typescript
// 시각적으로 숨김 (스크린 리더는 읽음)
<span className="sr-only">
  블록 추가 버튼
</span>

// 동적 콘텐츠 알림
<div role="status" aria-live="polite" aria-atomic="true">
  {saveStatus === 'saved' && '문서가 저장되었습니다.'}
</div>

// 로딩 상태
<div role="status" aria-live="polite">
  <Loader className="animate-spin" />
  <span className="sr-only">로딩 중...</span>
</div>
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내역 |
|------|------|-----------|
| 1.0.0 | 2025-10-10 | 초기 문서 작성 |

---

## 🔗 관련 문서

- [아키텍처 설계 문서](./ESG_EDITOR_ARCHITECTURE.md)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [Framer Motion 가이드](https://www.framer.com/motion/)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)

---

**문의**: 프로젝트 저장소 Issues를 통해 질문이나 제안을 남겨주세요.

