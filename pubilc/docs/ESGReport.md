## React 기반 ESG Report Editor 아키텍처

┌──────────────────────────────────────────────┐
│                 ESG Report Editor            │
│        (React + Next.js Custom Editor)       │
├──────────────────────────────────────────────┤
│                  UI Layer                    │
│  ┌────────────────────────────────────────┐  │
│  │ Toolbar / Sidebar / StatusBar / Modals │  │
│  │ (Formatting, Block Insert, ESG Mapping)│  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│              Editor Core Layer               │
│  ┌────────────────────────────────────────┐  │
│  │ Block Renderer (React Components)      │  │
│  │   ├─ ParagraphBlock                    │  │
│  │   ├─ TableBlock                        │  │
│  │   ├─ ImageBlock                        │  │
│  │   ├─ ESGMetricBlock (Custom ESG Unit)  │  │
│  │   └─ ChartBlock (KPI Visualization)    │  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│            Editing Engine Layer              │
│  ┌────────────────────────────────────────┐  │
│  │ contentEditable Handler (DOM Events)   │  │
│  │   ├─ Keyboard Command Parser           │  │
│  │   ├─ Selection Manager                 │  │
│  │   ├─ Undo/Redo Stack                   │  │
│  │   └─ Command Dispatcher                │  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│            Document State Layer              │
│  ┌────────────────────────────────────────┐  │
│  │ Zustand/Recoil Store                   │  │
│  │   ├─ documentTree (JSON Schema)        │  │
│  │   ├─ historyStack                      │  │
│  │   ├─ selectionState                    │  │
│  │   └─ syncStatus                        │  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│             Collaboration Layer              │
│  ┌────────────────────────────────────────┐  │
│  │ WebSocket / CRDT (Automerge/Yjs)       │  │
│  │   ├─ change broadcast                  │  │
│  │   ├─ merge conflicts                   │  │
│  │   └─ presence tracking                 │  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│               Persistence Layer              │
│  ┌────────────────────────────────────────┐  │
│  │ API Service (FastAPI / GraphQL)        │  │
│  │   ├─ /documents/:id                    │  │
│  │   ├─ /versions                         │  │
│  │   ├─ /esg-metrics                      │  │
│  │   └─ /attachments                      │  │
│  └────────────────────────────────────────┘  │
│                     │                        │
│                     ▼                        │
│               Database Layer                 │
│  ┌────────────────────────────────────────┐  │
│  │ PostgreSQL + Prisma ORM                │  │
│  │   ├─ documents (JSON)                  │  │
│  │   ├─ esg_metrics                       │  │
│  │   ├─ users / roles                     │  │
│  │   └─ version_history                   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘


## **PRD: ESG Report Editor - "The Collaborative Canvas"**

*   **버전:** 1.0
*   **작성일:** 2025년 10월 10일
*   **프로젝트 목표:** 단일 사용자 편집을 넘어, 여러 사용자가 실시간으로 협업하고, 버전을 관리하며, 전문적인 ESG 보고서를 작성할 수 있는 차세대 웹 기반 리포트 에디터를 구축한다.

### **1. 사용자 페르소나 및 핵심 시나리오**

*   **주요 사용자:** 기업의 ESG 담당자, 외부 컨설턴트, 검토 및 승인 담당 임원.
*   **핵심 시나리오:**
    1.  **초안 작성:** ESG 담당자가 E/S/G 템플릿을 기반으로 보고서 초안을 작성한다. 텍스트, 이미지, 표를 자유롭게 배치하여 보고서의 구조와 내용을 채운다.
    2.  **협업 및 검토:** 동료 및 외부 컨설턴트를 문서에 초대하여 실시간으로 함께 편집하고, 특정 내용에 대해 댓글을 통해 논의하고 피드백을 주고받는다.
    3.  **버전 관리 및 승인:** 중요한 수정이 완료될 때마다 주요 버전을 저장한다. 최종안이 완성되면, 승인권자에게 검토를 요청하고, 승인된 버전을 최종 발행한다.
    4.  **최종 발행:** 완성된 보고서를 PDF 형식으로 내보내어 외부에 제출한다.

---

### **2. 핵심 기능 요구사항 (Features)**

이 PRD는 '가짜 데이터(Mock Data)'와 '가짜 API(Mock API)'를 기반으로 한 프론트엔드 프로토타이핑을 목표로 합니다.

#### **F1: 통합 리포트 에디터 (The Canvas)**

*   **FR-1.1 (페이지 뷰):** 중앙에 A4 규격의 흰색 페이지(캔버스)가 표시되어야 한다. 콘텐츠가 길어지면 자동으로 다음 페이지가 생성되어야 한다. 사용자는 Ctrl+휠을 통해 캔버스를 줌 인/아웃 할 수 있다.
*   **FR-1.2 (객체 기반 편집):** 캔버스 위의 모든 콘텐츠(텍스트 박스, 이미지, 표)는 독립된 '객체'이다.
*   **FR-1.3 (자유 배치 및 크기 조절):** 사용자는 모든 객체를 마우스로 드래그하여 페이지 내 원하는 위치로 이동시킬 수 있으며, 객체 모서리의 핸들을 통해 크기를 자유롭게 조절할 수 있다.
*   **FR-1.4 (객체 속성 패널):** 화면 오른쪽에 '속성 패널'을 배치한다. 사용자가 특정 객체를 선택하면, 해당 객체의 상세 속성(좌표, 크기, 색상, 여백 등)이 이 패널에 표시되며, 값을 직접 수정하여 객체를 변경할 수 있다.

#### **F2: 리치 텍스트 박스 (Rich Text Box)**

*   **FR-2.1 (인라인 편집):** 텍스트 박스를 더블클릭하면 편집 모드로 전환되어 내용을 수정할 수 있어야 한다.
*   **FR-2.2 (플로팅 툴바):** 편집 모드에서는 텍스트 박스 근처에 작은 플로팅 툴바가 나타나야 한다.
*   **FR-2.3 (기본 서식):** 툴바를 통해 기본적인 서식(굵게, 기울임, 밑줄, 글자 크기/색상, 정렬)을 적용할 수 있어야 한다.

#### **F3: 버전 관리 시스템 (Version History)**

*   **FR-3.1 (버전 히스토리 패널):** 화면 우측 또는 모달을 통해 문서의 버전 기록 타임라인을 볼 수 있는 UI를 제공한다.
*   **FR-3.2 (버전 목록):** 각 버전은 버전 번호, 저장 시각, 작성자, 그리고 '주요 버전' 여부(`isMajor`)가 표시되어야 한다.
*   **FR-3.3 (버전 복원):** 사용자는 특정 버전을 선택하고 '이 버전으로 복원' 버튼을 클릭하여 현재 문서를 해당 버전의 상태로 되돌릴 수 있어야 한다. (복원 전 경고 메시지 표시)
*   **(Stretch Goal) 버전 비교 (Diff Viewer):** 두 버전을 선택하여 변경된 내용을 시각적으로 비교(하이라이트)하는 기능을 구현한다.

#### **F4: 실시간 협업: Presence & Comments**

*   **FR-4.1 (동시 접속자 표시):** 문서 상단에 현재 접속 중인 다른 사용자들의 아바타 목록을 표시한다.
*   **FR-4.2 (실시간 커서 및 선택 영역):** 다른 사용자의 커서 위치와 그들이 선택한 텍스트/객체 영역이 각기 다른 색상으로 실시간 표시되어야 한다.
*   **FR-4.3 (인라인 댓글):** 사용자는 특정 텍스트를 드래그하거나 객체를 선택한 후, '댓글 달기' 기능을 통해 의견을 남길 수 있어야 한다.
*   **FR-4.4 (댓글 스레드 패널):** 문서 우측에 댓글 전용 패널을 배치한다. 이 패널에서는 문서의 모든 댓글을 스레드 형태로 볼 수 있으며, 답글을 달거나, 댓글의 상태를 '해결(Resolve)'로 변경할 수 있어야 한다.
*   **FR-4.5 (멘션 기능):** 댓글 내용에 `@사용자이름`을 입력하면 해당 사용자에게 알림을 보낼 수 있는 기능을 구현한다.

#### **F5: 공유 및 권한 관리 (Sharing & RBAC)**

*   **FR-5.1 (공유 모달):** '공유' 버튼 클릭 시, 다른 사용자를 문서에 초대할 수 있는 모달창을 표시한다.
*   **FR-5.2 (역할 기반 초대):** 사용자를 이메일로 검색하여 초대하고, `Viewer`, `Commenter`, `Editor`, `Admin` 중 하나의 역할을 부여할 수 있는 드롭다운 메뉴를 제공한다.
*   **FR-5.3 (접근 제어 시뮬레이션):** (프로토타입 단계에서는) 로그인한 사용자의 역할에 따라 특정 UI(예: `Editor`가 아니면 툴바 비활성화)가 비활성화되는 모습을 시뮬레이션한다.

---

### **3. 기술적 가이드라인 (For Frontend Team)**

*   **상태 관리:** 모든 문서 및 UI 상태는 `Zustand`를 사용하여 중앙에서 관리한다.
*   **데이터:** 백엔드 API가 개발되기 전까지, 이 PRD에 명시된 모든 기능을 구현하기 위한 가상 데이터(`mockData.ts`)를 직접 생성하여 사용한다.
*   **API 연동:** 모든 API 호출은 `lib/api/` 디렉토리 내에 실제 API와 동일한 인터페이스를 가진 가짜 함수(`mockFetchDocument`, `mockUpdateComment` 등)로 구현한다. 이 함수들은 `setTimeout`을 사용하여 네트워크 지연을 시뮬레이션한다.
*   **핵심 아키텍처:** 에디터의 핵심은 **"Konva Canvas Layer (이미지/표) + HTML Overlay Layer (텍스트 박스)"**의 하이브리드 아키텍처를 기반으로 구현한다.

---

### **4. MVP 제외 범위 (Out of Scope for this Prototype)**

*   실제 백엔드 API 연동
*   실시간 협업을 위한 WebSocket 실제 연결
*   `ESGMetricBlock`과 같은 복잡한 커스텀 블록의 상세 기능
*   PDF 내보내기 기능의 실제 구현 (버튼 UI만 구현)
*   모바일 반응형 디자인

---

# ESG Report Editor – Frontend PRD v1.1
## "The Collaborative Canvas"

---

## 📋 문서 정보

| 항목 | 내용 |
|------|------|
| **버전** | v1.1 (Updated) |
| **작성일** | 2025-10-10 |
| **프로젝트명** | ESG Report Editor – "The Collaborative Canvas" |
| **목표** | 지속가능경영보고서 문서를 다중 사용자가 실시간으로 작성·검토·승인할 수 있는 웹 기반 에디터 구축 |
| **주요 사용자** | ESG 담당자, 외부 컨설턴트, 검토 임원 |
| **핵심 가치** | 실시간 협업 · 구조화된 보고서 관리 · 감사 추적 가능성 · 직관적인 편집 경험 |
| **기술 스택** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, Yjs |

---

## 💡 UX 플로우 상세

### 1️⃣ 문서 대시보드 (Document Home)

**레이아웃:**
```
┌─────────────────────────────────────────────────┐
│ [새 문서 생성] [검색] [필터▾] [정렬▾]      [@프로필▾] │
├─────────────────────────────────────────────────┤
│  탭: [📝 작성중] [👁️ 검토중] [✓ 승인됨] [📤 게시됨]  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ 📄 2024년 ESG 보고서      상태: 검토중        │ │
│ │ 최근 수정: 2분 전 by 김철수                   │ │
│ │ 협업자: [👤][👤][👤] +3                      │ │
│ │ [열기] [공유] [•••]                          │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**주요 기능:**
- **필터링**: 상태 (Draft/Review/Approved/Published), 담당자, ESG 카테고리 (E/S/G), 작성 기간
- **정렬**: 최근 수정일, 제목, 작성자
- **빠른 액션**: 문서 복제, 템플릿으로 저장, 일괄 삭제
- **미리보기**: 호버 시 문서 썸네일 및 메타데이터 표시

---

### 2️⃣ 문서 에디터 (Editor Workspace)

**레이아웃:**
```
┌────────────────────────────────────────────────────────────┐
│ ← [제목] 자동저장됨 3초 전  [👤👤👤] [버전▾] [공유] [게시]     │
├──────┬──────────────────────────────────────┬──────────────┤
│ 📚   │ # 1. 회사 개요                        │ 💬 코멘트     │
│ 섹션  │                                       │ ─────────    │
│      │ 우리 회사는...                         │ [전체/내것]   │
│ ▼1장 │ [커서: 김철수👤]                       │              │
│  ▶1.1│                                       │ 💬 김철수:    │
│  ▶1.2│ ## 1.1 사업 영역                      │ "여기 수정   │
│      │ - 제조업                               │ 필요해요"    │
│ ▶2장 │ - 서비스업                            │ [답글][해결]  │
│      │                                       │              │
│ [+]  │ [선택영역: 이영희 highlighting]        │ 💬 이영희:    │
└──────┴──────────────────────────────────────┴──────────────┘
```

**핵심 컴포넌트 인터페이스:**

#### **EditorCanvas (중앙 에디터)**
```typescript
interface EditorCanvasProps {
  documentId: string;
  initialContent: DocumentNode;
  readOnly?: boolean;
  onContentChange?: (content: DocumentNode) => void;
  onSelectionChange?: (selection: EditorSelection) => void;
}

interface EditorSelection {
  blockId: string;
  offset: number;
  length: number;
  userId?: string;
}
```

#### **SectionTreePanel (좌측 패널)**
```typescript
interface SectionTreePanelProps {
  sections: SectionNode[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  onSectionReorder: (sectionId: string, newOrder: number) => void;
  onSectionAdd: (parentId?: string) => void;
  collapsedSections: Set<string>;
}
```

#### **CommentPanel (우측 패널)**
```typescript
interface CommentPanelProps {
  threads: CommentThread[];
  filter: 'all' | 'mine' | 'unresolved';
  onThreadClick: (threadId: string) => void;
  onReplyAdd: (threadId: string, content: string) => void;
  onThreadResolve: (threadId: string) => void;
}
```

---

### 3️⃣ 블록 타입 시스템

**지원하는 블록 타입:**

```typescript
type BlockType = 
  | 'paragraph'
  | 'heading1' | 'heading2' | 'heading3'
  | 'bulletList' | 'orderedList'
  | 'table'
  | 'image'
  | 'quote'
  | 'divider'
  | 'callout'
  | 'esgMetric'  // ESG 지표 전용
  | 'chart';     // 데이터 차트

interface BlockNode {
  id: string;
  type: BlockType;
  content: string | object;
  metadata?: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    comments?: string[];  // CommentThread IDs
  };
  styles?: {
    align?: 'left' | 'center' | 'right';
    indent?: number;
  };
}
```

**블록별 렌더링 규칙:**

| 블록 타입 | 렌더링 | 편집 동작 |
|----------|--------|----------|
| `paragraph` | `<p>` 태그 | 인라인 스타일 (bold, italic, link) |
| `heading1-3` | `<h1-3>` | 자동 목차 생성 |
| `bulletList` | `<ul><li>` | Tab/Shift+Tab 들여쓰기 |
| `table` | `<table>` | 셀 병합, 행/열 추가/삭제 |
| `esgMetric` | 커스텀 컴포넌트 | 지표 타입 선택, 단위 입력 |
| `chart` | Recharts | 데이터 소스 연결, 차트 타입 변경 |

---

## 🌐 실시간 협업 UX 명세

### Presence 표시 (사용자 위치 추적)

**1. 커서 표시**
```typescript
interface UserCursor {
  userId: string;
  userName: string;
  color: string;  // 사용자별 고유 색상
  position: {
    blockId: string;
    offset: number;
  };
}
```

**시각적 표현:**
- 커서: 사용자 색상의 얇은 세로선 + 이름 라벨
- 에니메이션: 부드러운 이동 (transition: 100ms)
- 5초간 입력 없으면 커서 투명도 50%

**2. 선택 영역 하이라이트**
```typescript
interface UserSelection {
  userId: string;
  color: string;
  ranges: Array<{
    blockId: string;
    startOffset: number;
    endOffset: number;
  }>;
}
```

**시각적 표현:**
- 배경색: `${userColor}20` (20% 투명도)
- 테두리: `2px solid ${userColor}`

**3. 활성 사용자 표시 (상단바)**
```
┌────────────────────────────────────────────────┐
│ [제목]  👤김철수(편집중) 👤이영희(읽는중) 👤박민수 │
│         ↑ 초록 점       ↑ 회색 점             │
└────────────────────────────────────────────────┘
```

### 충돌 해결 UX

**시나리오 1: 동시 편집 충돌**
- Yjs CRDT가 자동 병합
- UI 변화 없음 (자동 해결)

**시나리오 2: 삭제된 블록에 댓글 작성**
```
┌─────────────────────────────────────────────┐
│ ⚠️ 이 블록은 다른 사용자가 삭제했습니다.       │
│ [댓글 보기] [블록 복원하기]                   │
└─────────────────────────────────────────────┘
```

**시나리오 3: 권한 변경**
```
┌─────────────────────────────────────────────┐
│ 🔒 편집 권한이 제거되었습니다.                 │
│ 변경사항이 저장되지 않을 수 있습니다.           │
│ [새로고침]                                    │
└─────────────────────────────────────────────┘
```

---

## 🧱 프론트엔드 아키텍처

### 디렉토리 구조

```
src/
├─ app/                          # Next.js App Router
│   ├─ (auth)/
│   │   ├─ login/
│   │   └─ register/
│   ├─ dashboard/
│   │   └─ page.tsx
│   ├─ editor/
│   │   └─ [documentId]/
│   │       └─ page.tsx
│   ├─ layout.tsx
│   └─ providers.tsx             # Global providers
│
├─ components/
│   ├─ editor/
│   │   ├─ EditorCanvas.tsx       # 메인 에디터
│   │   ├─ blocks/
│   │   │   ├─ ParagraphBlock.tsx
│   │   │   ├─ HeadingBlock.tsx
│   │   │   ├─ TableBlock.tsx
│   │   │   ├─ ESGMetricBlock.tsx
│   │   │   └─ index.ts
│   │   ├─ inline/
│   │   │   ├─ BoldMark.tsx
│   │   │   ├─ LinkMark.tsx
│   │   │   └─ index.ts
│   │   └─ BlockRenderer.tsx      # 블록 타입별 라우팅
│   │
│   ├─ sidebar/
│   │   ├─ SectionTreePanel.tsx
│   │   ├─ CommentPanel.tsx
│   │   ├─ VersionPanel.tsx
│   │   └─ OutlinePanel.tsx
│   │
│   ├─ toolbar/
│   │   ├─ EditorToolbar.tsx
│   │   ├─ FormattingToolbar.tsx
│   │   ├─ BlockTypeSelector.tsx
│   │   └─ PresenceIndicator.tsx
│   │
│   ├─ collaboration/
│   │   ├─ UserCursor.tsx
│   │   ├─ SelectionHighlight.tsx
│   │   └─ AwarenessProvider.tsx
│   │
│   └─ common/
│       ├─ Button.tsx
│       ├─ Input.tsx
│       ├─ Modal.tsx
│       ├─ Dropdown.tsx
│       └─ Toast.tsx
│
├─ hooks/
│   ├─ editor/
│   │   ├─ useEditorStore.ts      # Zustand store
│   │   ├─ useCommand.ts          # Command pattern
│   │   ├─ useSelection.ts        # 선택 영역 관리
│   │   └─ useBlockOperations.ts  # CRUD 작업
│   │
│   ├─ collaboration/
│   │   ├─ useYjsSync.ts          # Yjs 동기화
│   │   ├─ usePresence.ts         # Awareness
│   │   └─ useWebSocket.ts        # WS 연결
│   │
│   ├─ useAutosave.ts
│   ├─ useKeyboardShortcuts.ts
│   └─ usePermissions.ts
│
├─ services/
│   ├─ api/
│   │   ├─ documents.ts
│   │   ├─ comments.ts
│   │   ├─ versions.ts
│   │   └─ auth.ts
│   ├─ websocket.ts
│   └─ storage.ts                 # LocalStorage 관리
│
├─ stores/
│   ├─ editorStore.ts             # 에디터 상태
│   ├─ collaborationStore.ts      # 협업 상태
│   └─ uiStore.ts                 # UI 상태 (패널 열림/닫힘)
│
├─ types/
│   ├─ documentSchema.ts          # 공유 타입
│   ├─ api.ts                     # OpenAPI 자동 생성
│   ├─ editor.ts
│   └─ collaboration.ts
│
├─ utils/
│   ├─ editor/
│   │   ├─ blockUtils.ts
│   │   ├─ selectionUtils.ts
│   │   └─ formatters.ts
│   ├─ diffUtils.ts
│   ├─ validators.ts
│   └─ dateUtils.ts
│
└─ styles/
    ├─ globals.css
    ├─ editor.css
    └─ theme.ts
```

---

## 🏗️ 상태 관리 아키텍처

### EditorStore (Zustand)

```typescript
interface EditorStore {
  // 문서 상태
  document: DocumentNode | null;
  currentSection: string | null;
  
  // 선택 상태
  selection: EditorSelection | null;
  
  // UI 상태
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // 히스토리 (Undo/Redo)
  history: {
    past: DocumentNode[];
    future: DocumentNode[];
  };
  
  // Actions
  setDocument: (doc: DocumentNode) => void;
  updateBlock: (blockId: string, content: Partial<BlockNode>) => void;
  insertBlock: (position: number, block: BlockNode) => void;
  deleteBlock: (blockId: string) => void;
  undo: () => void;
  redo: () => void;
  
  // Command 실행
  executeCommand: (command: EditorCommand) => void;
}
```

### CollaborationStore

```typescript
interface CollaborationStore {
  // Yjs 상태
  yjsDoc: Y.Doc | null;
  awareness: Awareness | null;
  
  // 사용자 Presence
  connectedUsers: Map<string, UserPresence>;
  
  // WebSocket 상태
  wsStatus: 'connected' | 'disconnected' | 'reconnecting';
  
  // Actions
  broadcastCursor: (position: CursorPosition) => void;
  broadcastSelection: (selection: EditorSelection) => void;
}
```

---

## 🎯 Command Pattern 구현

```typescript
// 모든 편집 작업을 Command로 캡슐화
interface EditorCommand {
  type: string;
  execute: (store: EditorStore) => void;
  undo: (store: EditorStore) => void;
}

// 예시: 블록 삽입 Command
class InsertBlockCommand implements EditorCommand {
  type = 'INSERT_BLOCK';
  
  constructor(
    private position: number,
    private block: BlockNode
  ) {}
  
  execute(store: EditorStore) {
    // Yjs 동기화 + 로컬 상태 업데이트
    const yBlocks = store.yjsDoc.getArray('blocks');
    yBlocks.insert(this.position, [this.block]);
  }
  
  undo(store: EditorStore) {
    const yBlocks = store.yjsDoc.getArray('blocks');
    yBlocks.delete(this.position, 1);
  }
}

// 사용
const { executeCommand } = useEditorStore();
executeCommand(new InsertBlockCommand(5, newBlock));
```

**지원하는 Command 목록:**
- `InsertBlockCommand`
- `DeleteBlockCommand`
- `UpdateBlockCommand`
- `MoveBlockCommand`
- `ToggleMarkCommand` (Bold, Italic, etc.)
- `InsertLinkCommand`
- `IndentCommand` / `OutdentCommand`

---

## ⚡ 성능 최적화 전략

### 1. 대용량 문서 처리

**가상화 (Virtualization)**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function EditorCanvas({ blocks }: { blocks: BlockNode[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // 평균 블록 높이
    overscan: 10, // 버퍼 블록 수
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <BlockRenderer
            key={blocks[virtualRow.index].id}
            block={blocks[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. 리렌더링 최적화

**React.memo + useMemo**
```typescript
const BlockRenderer = React.memo(({ block }: { block: BlockNode }) => {
  const Component = useMemo(() => {
    switch (block.type) {
      case 'paragraph': return ParagraphBlock;
      case 'heading1': return HeadingBlock;
      // ...
    }
  }, [block.type]);
  
  return <Component block={block} />;
}, (prev, next) => {
  // 깊은 비교 대신 ID + 타임스탬프 비교
  return prev.block.id === next.block.id &&
         prev.block.metadata.lastModified === next.block.metadata.lastModified;
});
```

### 3. Debounce & Throttle

```typescript
// Autosave: Debounce (3초)
const debouncedSave = useDebouncedCallback(
  (content: DocumentNode) => {
    api.documents.update(documentId, content);
  },
  3000
);

// Cursor 브로드캐스트: Throttle (100ms)
const throttledBroadcast = useThrottledCallback(
  (cursor: CursorPosition) => {
    awareness.setLocalState({ cursor });
  },
  100
);
```

### 4. 코드 스플리팅

```typescript
// 블록 타입별 lazy loading
const TableBlock = lazy(() => import('./blocks/TableBlock'));
const ChartBlock = lazy(() => import('./blocks/ChartBlock'));
const ESGMetricBlock = lazy(() => import('./blocks/ESGMetricBlock'));
```

---

## ♿ 접근성 (A11y) 전략

### 키보드 단축키

| 단축키 | 동작 | 범위 |
|--------|------|------|
| `Cmd/Ctrl + B` | Bold 토글 | 선택 영역 |
| `Cmd/Ctrl + I` | Italic 토글 | 선택 영역 |
| `Cmd/Ctrl + K` | 링크 삽입 | 선택 영역 |
| `Cmd/Ctrl + Z` | Undo | 전역 |
| `Cmd/Ctrl + Shift + Z` | Redo | 전역 |
| `Cmd/Ctrl + /` | 블록 타입 메뉴 | 현재 블록 |
| `Tab` | 들여쓰기 | 현재 블록 |
| `Shift + Tab` | 내어쓰기 | 현재 블록 |
| `Cmd/Ctrl + Alt + 1-3` | 헤딩 변환 | 현재 블록 |
| `Cmd/Ctrl + Enter` | 새 블록 추가 | 아래 |
| `Cmd/Ctrl + Shift + D` | 블록 복제 | 현재 블록 |
| `Cmd/Ctrl + Shift + ↑/↓` | 블록 이동 | 현재 블록 |

### ARIA 속성

```tsx
// 에디터 컨테이너
<div
  role="textbox"
  aria-multiline="true"
  aria-label="문서 편집기"
  aria-describedby="editor-help"
>
  {/* 블록들 */}
</div>

// 블록
<div
  role="group"
  aria-label={`${block.type} 블록`}
  aria-describedby={`block-${block.id}-meta`}
>
  {/* 블록 내용 */}
</div>

// 코멘트
<aside
  role="complementary"
  aria-label="코멘트 패널"
>
  {/* 코멘트 스레드 */}
</aside>
```

### 스크린 리더 지원

- **라이브 리전**: 자동저장, 에러 메시지
  ```tsx
  <div role="status" aria-live="polite" aria-atomic="true">
    {isSaving ? '저장 중...' : `${lastSaved}에 저장됨`}
  </div>
  ```

- **포커스 관리**: 모달/패널 열릴 때 포커스 이동
  ```typescript
  useEffect(() => {
    if (isCommentPanelOpen) {
      commentPanelRef.current?.focus();
    }
  }, [isCommentPanelOpen]);
  ```

---

## 🎨 디자인 시스템

### 색상 체계

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // ESG 카테고리 색상
        environmental: {
          50: '#f0fdf4',
          500: '#22c55e',  // 메인 그린
          700: '#15803d',
        },
        social: {
          50: '#eff6ff',
          500: '#3b82f6',  // 메인 블루
          700: '#1d4ed8',
        },
        governance: {
          50: '#f9fafb',
          500: '#6b7280',  // 메인 그레이
          700: '#374151',
        },
        
        // 문서 상태 색상
        status: {
          draft: '#94a3b8',
          review: '#3b82f6',
          approved: '#22c55e',
          published: '#f59e0b',
        },
        
        // 협업 사용자 색상 (8가지)
        user: {
          1: '#ef4444',  // Red
          2: '#f97316',  // Orange
          3: '#f59e0b',  // Amber
          4: '#84cc16',  // Lime
          5: '#06b6d4',  // Cyan
          6: '#3b82f6',  // Blue
          7: '#8b5cf6',  // Violet
          8: '#ec4899',  // Pink
        },
      },
    },
  },
};
```

### 타이포그래피

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');

.editor-content {
  /* 본문 */
  font-family: 'Noto Sans KR', 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.75;
  letter-spacing: -0.01em;
}

.editor-content h1 {
  font-size: 2.25rem;   /* 36px */
  font-weight: 700;
  line-height: 1.2;
  margin: 2rem 0 1rem;
}

.editor-content h2 {
  font-size: 1.875rem;  /* 30px */
  font-weight: 700;
  line-height: 1.3;
  margin: 1.5rem 0 0.75rem;
}

.editor-content h3 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 1.4;
  margin: 1.25rem 0 0.5rem;
}
```

### 모션 원칙 (Framer Motion)

```typescript
// 페이지 전환
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// 블록 삽입/삭제
const blockVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// 패널 슬라이드
const panelVariants = {
  closed: { x: '100%' },
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};
```

---

## 🚨 에러 처리 및 사용자 피드백

### 에러 경계 (Error Boundary)

```typescript
// components/common/ErrorBoundary.tsx
class EditorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
>