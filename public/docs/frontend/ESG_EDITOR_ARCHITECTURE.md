# ESG Report Editor - 아키텍처 설계 문서

> **작성일**: 2025-10-10  
> **버전**: 1.0.0  
> **개발 현황**: Phase 4 완료 (Core Editing Features)

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처 설계](#3-아키텍처-설계)
4. [데이터 모델](#4-데이터-모델)
5. [상태 관리](#5-상태-관리)
6. [Command Pattern](#6-command-pattern)
7. [컴포넌트 구조](#7-컴포넌트-구조)
8. [주요 기능](#8-주요-기능)
9. [UI/UX 설계 원칙](#9-uiux-설계-원칙)
10. [개발 가이드](#10-개발-가이드)

---

## 1. 프로젝트 개요

### 1.1 목적
- ESG(Environment, Social, Governance) 보고서를 작성하고 관리하기 위한 전문 문서 에디터
- Notion, Confluence 스타일의 블록 기반 에디터
- GRI(Global Reporting Initiative) 표준 준수

### 1.2 핵심 목표
- ✅ 직관적인 블록 기반 편집
- ✅ 실시간 협업 (향후 Yjs 통합)
- ✅ ESG 지표 관리
- ✅ 버전 관리 및 이력 추적
- ✅ PDF/Word 내보내기 (향후)

### 1.3 개발 현황
| Phase | 기능 | 상태 |
|-------|------|------|
| Phase 1 | 데이터 모델 설계 | ✅ 완료 |
| Phase 2 | 3-Panel 레이아웃 | ✅ 완료 |
| Phase 3 | Command System | ✅ 완료 |
| Phase 4 | 고급 편집 기능 | ✅ 완료 |
| Phase 5 | 실시간 협업 (Yjs) | 🔜 예정 |
| Phase 6 | 백엔드 연동 | 🔜 예정 |

---

## 2. 기술 스택

### 2.1 Core
- **프레임워크**: Next.js 15.x (App Router)
- **언어**: TypeScript 5.x
- **스타일링**: Tailwind CSS 4.x
- **애니메이션**: Framer Motion 12.x

### 2.2 상태 관리
- **Zustand 5.0.8**: 경량 상태 관리
  - `editorStore`: 문서 데이터, 편집 상태
  - `uiStore`: UI 상태, 사이드바, 드로어

### 2.3 에디터 기능
- **드래그 앤 드롭**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **가상화**: @tanstack/react-virtual (향후)
- **협업**: Yjs + y-websocket (향후)

### 2.4 UI 라이브러리
- **아이콘**: lucide-react
- **유틸리티**: clsx, tailwind-merge

### 2.5 의존성 목록
```json
{
  "dependencies": {
    "next": "^15.5.3",
    "react": "^19.1.0",
    "typescript": "^5",
    "zustand": "^5.0.8",
    "framer-motion": "^12.23.23",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "lucide-react": "^0.544.0",
    "tailwindcss": "^4"
  }
}
```

---

## 3. 아키텍처 설계

### 3.1 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                        TopBar                           │
│  [← 뒤로] [문서제목] [저장상태] [협업] [버전] [공유]    │
└─────────────────────────────────────────────────────────┘
┌──────────┬───────────────────────────────┬──────────────┐
│          │                               │              │
│ Sidebar  │         Canvas                │   Sidebar    │
│  Left    │      (Editor Area)            │    Right     │
│          │                               │              │
│ [섹션 1] │  ┌──────────────────────┐     │  [댓글 1]   │
│  ├ 1.1   │  │ Section 1            │     │   └ 답글    │
│  └ 1.2   │  │  - Block 1           │     │              │
│          │  │  - Block 2           │     │  [댓글 2]   │
│ [섹션 2] │  │  [+ 블록 추가]       │     │              │
│  ├ 2.1   │  └──────────────────────┘     │              │
│  └ 2.2   │                               │              │
│          │  ┌──────────────────────┐     │              │
│ [토글]   │  │ Section 2            │     │  [필터]     │
│          │  │  - Block 1           │     │  □ 해결됨   │
│          │  │  - Block 2           │     │  ☑ 미해결   │
└──────────┴───────────────────────────────┴──────────────┘
```

### 3.2 컴포넌트 계층 구조

```
EditorShell (메인 레이아웃)
├── TopBar (상단 네비게이션)
│   ├── DocumentTitle (편집 가능)
│   ├── SaveStatus (자동 저장 상태)
│   ├── Collaborators (협업자 아바타)
│   └── Actions (버전, 공유, Undo/Redo)
│
├── SidebarLeft (섹션 네비게이션)
│   ├── SectionTree (섹션 트리)
│   └── CategoryBadges (ESG 카테고리)
│  │       ├── SortableBlock (드래그 가능)
│   │       │   ├── BlockActions (호버 메뉴)
│   │       │   └── BlockContent
│   │       │       ├── ParagraphBlock
│   │       │       ├── HeadingBlock
│   │       │       ├── ListBlock
│   │       │       ├── QuoteBlock
│   │       │       ├── TableBlock ✨ 새로 구현
│   │       │       ├── ImageBlock ✨ 새로 구현
│   │       │       ├── ChartBlock (예정)
│   │       │       └── ESGMetricBlock (예정)
│   │       └── AddBlockButton
│   ├── FloatingToolbar (텍스트 포맷팅)
│   └── BlockTypeMenu (블록 타입 선택)
│
└── SidebarRight (댓글/활동)
    ├── CommentList
    └── ActivityFeed

Overlays (전역 레이어)
├── VersionDrawer (버전 이력)
├── PermissionDrawer (공유 설정)
└── CommandDebugger (개발 모드)
```

### 3.3 폴더 구조

```
frontend/
├── src/
│   ├── app/
│   │   └── esgreport-editor/
│   │       └── page.tsx                    # 에디터 페이지
│   │
│   ├── components/
│   │   └── esgeditor/
│   │       ├── EditorShell.tsx             # 메인 레이아웃
│   │       ├── TopBar.tsx                  # 상단 바
│   │       ├── SidebarLeft.tsx             # 왼쪽 사이드바
│   │       ├── SidebarRight.tsx            # 오른쪽 사이드바
│   │       ├── Canvas.tsx                  # 에디터 캔버스
│   │       ├── InlineRenderer.tsx          # 인라인 텍스트 렌더링
│   │       ├── FloatingToolbar.tsx         # 플로팅 툴바
│   │       ├── BlockTypeMenu.tsx           # 블록 타입 메뉴
│   │       ├── BlockActions.tsx            # 블록 액션
│   │       ├── AddBlockButton.tsx          # 블록 추가 버튼
│   │       ├── SortableBlock.tsx           # 드래그 가능 블록
│   │       ├── TableBlock.tsx              # 표 블록
│   │       ├── ImageBlock.tsx              # 이미지 블록
│   │       └── CommandDebugger.tsx         # 디버거
│   │
│   ├── types/
│   │   ├── documentSchema.ts               # 문서 스키마
│   │   ├── sectionSchema.ts                # 섹션 스키마
│   │   ├── blockSchema.ts                  # 블록 스키마
│   │   ├── inlineSchema.ts                 # 인라인 스키마
│   │   ├── esgBlock.ts                     # ESG 지표 스키마
│   │   └── commands.ts                     # Command 인터페이스
│   │
│   ├── store/
│   │   ├── editorStore.ts                  # 에디터 상태
│   │   └── uiStore.ts                      # UI 상태
│   │
│   ├── commands/
│   │   ├── InsertBlockCommand.ts           # 블록 추가
│   │   ├── UpdateBlockContentCommand.ts    # 블록 수정
│   │   ├── DeleteBlockCommand.ts           # 블록 삭제
│   │   ├── MoveBlockCommand.ts             # 블록 이동
│   │   ├── ApplyMarkCommand.ts             # 포맷 적용
│   │   └── index.ts                        # 통합 export
│   │
│   ├── hooks/
│   │   └── useCommand.ts                   # Command 훅
│   │
│   └── lib/
│       └── mockData.ts                     # 테스트 데이터
│
└── docs/
    ├── ESG_EDITOR_ARCHITECTURE.md          # 본 문서
    └── ESG_EDITOR_UI_UX_GUIDE.md           # UI/UX 가이드
```
├── Canvas (에디터 영역)
│   ├── SectionRenderer
│   │   ├── SectionHeader
│   │   └── BlockList
│ 

---

## 4. 데이터 모델

### 4.1 핵심 개념

ESG Report Editor는 **4단계 계층 구조**를 사용합니다:

```
Document (문서)
└── Section[] (섹션)
    └── Block[] (블록)
        └── InlineNode[] (인라인 텍스트)
```

### 4.2 DocumentNode

**파일**: `src/types/documentSchema.ts`

```typescript
interface DocumentNode {
  id: string;
  title: string;
  metadata: {
    authorId: string;
    createdAt: string;
    lastModified: string;
    version: number;
    status: 'draft' | 'in_review' | 'approved' | 'published';
    reportingYear: number;
    organization: {
      name: string;
      industry: string;
    };
    framework: 'GRI' | 'SASB' | 'TCFD' | 'CUSTOM';
  };
  pageSetup: {
    pageSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number; };
  };
  sections: SectionNode[];
}
```

**주요 특징**:
- 문서 메타데이터 관리 (작성자, 버전, 상태)
- ESG 리포팅 프레임워크 지정 (GRI, SASB, TCFD)
- 페이지 레이아웃 설정

### 4.3 SectionNode

**파일**: `src/types/sectionSchema.ts`

```typescript
interface SectionNode {
  id: string;
  type: 'section';
  title: string;
  description?: string;
  griReference?: string;           // GRI 표준 참조 (예: "GRI 102-1")
  metadata?: {
    category?: 'environmental' | 'social' | 'governance';
    materiality?: 'high' | 'medium' | 'low';
    stakeholders?: string[];
  };
  blocks: BlockNode[];
}
```

**주요 특징**:
- GRI 표준 매핑
- ESG 카테고리 분류
- 중요도(Materiality) 표시

### 4.4 BlockNode

**파일**: `src/types/blockSchema.ts`

```typescript
enum BlockType {
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  LIST = 'list',
  QUOTE = 'quote',
  TABLE = 'table',
  IMAGE = 'image',
  CHART = 'chart',
  ESG_METRIC = 'esgMetric',
}

interface BlockNode {
  id: string;
  type: BlockType;
  content: InlineNode[];
  attributes?: BlockAttributes;
}

interface BlockAttributes {
  level?: number;              // 제목 레벨 (1-6)
  listStyle?: 'bullet' | 'number' | 'checkbox';
  align?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  
  // 표 전용
  tableData?: {
    rows: number;
    cols: number;
    cells: string[][];
  };
  
  // 이미지 전용
  src?: string;
  alt?: string;
  width?: string;
  
  // 차트 전용
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  chartData?: any;
  
  // ESG 지표 전용
  esgMetric?: ESGMetricBlock;
}
```

**지원 블록 타입**:
| 타입 | 설명 | 단축키 |
|------|------|--------|
| `paragraph` | 일반 텍스트 | `/p` |
| `heading` | 제목 (레벨 1-3) | `/h1`, `/h2`, `/h3` |
| `list` | 목록 (글머리, 번호) | `/ul`, `/ol` |
| `quote` | 인용구 | `/quote` |
| `table` | 표 | `/table` |
| `image` | 이미지 | `/img` |
| `chart` | 차트 | `/chart` |
| `esgMetric` | ESG 지표 | `/esg` |

### 4.5 InlineNode

**파일**: `src/types/inlineSchema.ts`

```typescript
type TextMark = 'bold' | 'italic' | 'underline' | 'strikethrough' 
              | 'code' | 'highlight' | 'superscript' | 'subscript';

interface InlineNode {
  text: string;
  marks?: TextMark[];
  link?: {
    href: string;
    title?: string;
  };
}
```

**텍스트 포맷팅**:
- **굵게** (bold): `Ctrl+B`
- *기울임* (italic): `Ctrl+I`
- <u>밑줄</u> (underline): `Ctrl+U`
- `코드` (code): `Ctrl+E`
- ==하이라이트== (highlight)

### 4.6 ESGMetricBlock

**파일**: `src/types/esgBlock.ts`

```typescript
interface ESGMetricBlock {
  metricName: string;
  category: 'environmental' | 'social' | 'governance';
  value: number | string;
  unit: string;
  period: {
    start: string;
    end: string;
  };
  target?: {
    value: number | string;
    year: number;
  };
  griReference?: string;
  dataSource?: string;
  verified: boolean;
}
```

**사용 예시**:
- 탄소 배출량 (tCO2e)
- 에너지 소비량 (MWh)
- 여성 임원 비율 (%)
- 윤리 교육 이수율 (%)

---

## 5. 상태 관리

### 5.1 editorStore (문서 상태)

**파일**: `src/store/editorStore.ts`

```typescript
interface EditorState {
  // 문서 데이터
  document: DocumentNode | null;
  
  // 편집 상태
  focusedBlockId: string | null;
  isEditing: boolean;
  
  // 선택 영역
  selection: {
    anchorBlockId: string | null;
    anchorOffset: number;
    focusBlockId: string | null;
    focusOffset: number;
  } | null;
}

interface EditorActions {
  setDocument: (document: DocumentNode) => void;
  updateDocument: (updates: Partial<DocumentNode>) => void;
  
  // 블록 조작 (Command Pattern 사용)
  insertBlock: (sectionId: string, position: number, block: BlockNode) => void;
  updateBlockContent: (sectionId: string, blockId: string, content: InlineNode[]) => void;
  deleteBlock: (sectionId: string, blockId: string) => void;
  
  // 포커스 관리
  setFocusedBlock: (blockId: string | null) => void;
  setIsEditing: (editing: boolean) => void;
  
  // Undo/Redo (Command Stack)
  undo: () => void;
  redo: () => void;
}
```

**사용 예시**:
```typescript
const { document, insertBlock } = useEditorStore();

const handleAddParagraph = () => {
  insertBlock('section-1', 0, {
    id: generateId(),
    type: 'paragraph',
    content: [{ text: '', marks: [] }],
  });
};
```

### 5.2 uiStore (UI 상태)

**파일**: `src/store/uiStore.ts`

```typescript
interface UIState {
  // 사이드바 토글
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  
  // 드로어 토글
  isVersionDrawerOpen: boolean;
  isPermissionDrawerOpen: boolean;
  
  // 저장 상태
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline';
  lastSaved: Date | null;
  isDirty: boolean;
}

interface UIActions {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleVersionDrawer: () => void;
  togglePermissionDrawer: () => void;
  
  setSaveStatus: (status: SaveStatus) => void;
  setLastSaved: (date: Date) => void;
  setIsDirty: (dirty: boolean) => void;
}
```

---

## 6. Command Pattern

### 6.1 개념

**모든 편집 작업을 Command 객체로 캡슐화**하여:
- ✅ Undo/Redo 구현
- ✅ 편집 히스토리 추적
- ✅ 협업 시 작업 동기화 (향후)
- ✅ 일관된 상태 관리

### 6.2 EditorCommand 인터페이스

**파일**: `src/types/commands.ts`

```typescript
interface EditorCommand {
  type: string;
  execute(document: DocumentNode): DocumentNode;
  undo(document: DocumentNode): DocumentNode;
  describe(): string;
}
```

### 6.3 구현된 Command 클래스

| Command | 기능 | 파일 |
|---------|------|------|
| `InsertBlockCommand` | 블록 추가 | `commands/InsertBlockCommand.ts` |
| `UpdateBlockContentCommand` | 블록 내용 수정 | `commands/UpdateBlockContentCommand.ts` |
| `DeleteBlockCommand` | 블록 삭제 | `commands/DeleteBlockCommand.ts` |
| `MoveBlockCommand` | 블록 이동 | `commands/MoveBlockCommand.ts` |
| `ApplyMarkCommand` | 텍스트 포맷 적용 | `commands/ApplyMarkCommand.ts` |

### 6.4 사용 예시

```typescript
// 1. Command 생성
const command = new InsertBlockCommand({
  sectionId: 'section-1',
  position: 0,
  block: newBlock,
});

// 2. Command 실행
const { execute } = useCommand();
execute(command);

// 3. Undo/Redo
const { undo, redo, canUndo, canRedo } = useCommand();
if (canUndo) undo();
if (canRedo) redo();
```

### 6.5 Command Stack 구조

```typescript
interface CommandState {
  past: EditorCommand[];      // Undo 스택
  future: EditorCommand[];     // Redo 스택
  canUndo: boolean;
  canRedo: boolean;
}

// 예시 히스토리
past: [
  InsertBlockCommand,        // 가장 오래된 작업
  UpdateBlockContentCommand,
  ApplyMarkCommand,          // 마지막 Undo 대상
]
future: [
  DeleteBlockCommand,        // 다음 Redo 대상
]
```

---

## 7. 컴포넌트 구조

### 7.1 EditorShell (메인 레이아웃)

**파일**: `src/components/esgeditor/EditorShell.tsx`

**역할**:
- 3-Panel 레이아웃 구성
- 전역 상태 초기화
- 사이드바 토글 버튼

**Props**:
```typescript
interface EditorShellProps {
  documentId: string;
  initialContent?: DocumentNode;
  onContentChange?: (document: DocumentNode) => void;
  onBack?: () => void;
}
```

### 7.2 TopBar (상단 네비게이션)

**파일**: `src/components/esgeditor/TopBar.tsx`

**기능**:
- 문서 제목 편집 (인라인)
- 저장 상태 표시 (실시간)
- 협업자 아바타 (Mock)
- Undo/Redo 버튼
- 버전 이력/공유 드로어 토글

**저장 상태 표시**:
```typescript
'idle'    → 아이콘 없음
'saving'  → 🔄 저장 중...
'saved'   → ✅ 저장됨
'error'   → ❌ 저장 실패
'offline' → 📴 오프라인
```

### 7.3 SidebarLeft (섹션 네비게이션)

**파일**: `src/components/esgeditor/SidebarLeft.tsx`

**기능**:
- 섹션 트리 표시
- ESG 카테고리 뱃지
- 블록 개수 표시
- 섹션 클릭 시 스크롤

**UI 구조**:
```
┌─ 📄 Executive Summary
│   ├─ 🌍 Environmental (5블록)
│   └─ 👥 Social (3블록)
│
└─ 📄 Performance Data
    └─ 📊 Governance (7블록)
```

### 7.4 Canvas (에디터 영역)

**파일**: `src/components/esgeditor/Canvas.tsx`

**핵심 기능**:
- `contentEditable` 기반 텍스트 편집
- 블록 렌더링 (타입별 분기)
- 플로팅 툴바 (텍스트 선택 시)
- 블록 타입 메뉴 (+ 버튼 / 슬래시 커맨드)
- 블록 액션 (호버 시 표시)
- 키보드 단축키 처리

**블록 렌더링 로직**:
```typescript
const renderBlock = (block: BlockNode) => {
  switch (block.type) {
    case 'paragraph':
      return <p contentEditable suppressContentEditableWarning>
        <InlineRenderer content={block.content} />
      </p>;
    
    case 'heading':
      const HeadingTag = `h${block.attributes?.level || 1}`;
      return <HeadingTag contentEditable suppressContentEditableWarning>
        <InlineRenderer content={block.content} />
      </HeadingTag>;
    
    case 'table':
      return <TableBlock block={block} readOnly={false} />;
    
    case 'image':
      return <ImageBlock block={block} readOnly={false} />;
    
    // ... 기타 블록 타입
  }
};
```

### 7.5 TableBlock (표 블록)

**파일**: `src/components/esgeditor/TableBlock.tsx`

**기능**:
- 동적 행/열 추가/삭제
- 셀 인라인 편집
- 헤더 행 스타일
- 최소 1x1 크기 유지

**UI 구조**:
```
┌─────────┬─────────┬─────────┐
│ Header1 │ Header2 │ Header3 │ ← 헤더 행 (배경색)
├─────────┼─────────┼─────────┤
│ Cell 1  │ Cell 2  │ Cell 3  │ ← 호버 시 🗑️ 버튼
├─────────┼─────────┼─────────┤
│ Cell 4  │ Cell 5  │ Cell 6  │
└─────────┴─────────┴─────────┘
    ↑         ↑         ↑
    └─ 호버 시 "N번 열 삭제" 버튼

[➕ 행 추가] [➕ 열 추가]
```

### 7.6 ImageBlock (이미지 블록)

**파일**: `src/components/esgeditor/ImageBlock.tsx`

**기능**:
- URL 입력 / 파일 업로드
- 3가지 정렬 (왼쪽/가운데/오른쪽)
- 너비 조절 (20-100%)
- 이미지 툴바 (호버 시)
- 로드 실패 처리

**UI 구조**:
```
┌─────────────────────────────────┐
│  [이미지 URL 입력 또는 업로드]   │
│                                 │
│  ┌───────────────────────┐      │
│  │                       │      │ ← 호버 시 툴바
│  │      [이미지]         │      │ [◀ ▣ ▶] [🔗] [🗑️]
│  │                       │      │
│  └───────────────────────┘      │
│                                 │
│  너비: ━━━━━●━━━━ 80%            │
└─────────────────────────────────┘
```

### 7.7 BlockTypeMenu (블록 타입 선택)

**파일**: `src/components/esgeditor/BlockTypeMenu.tsx`

**기능**:
- 11가지 블록 타입 선택
- 검색 기능
- 키보드 네비게이션 (↑↓, Enter, Esc)
- 슬래시 커맨드 지원

**UI 구조**:
```
┌────────────────────────────┐
│ 🔍 [블록 검색...] [✕]      │
├────────────────────────────┤
│ 📝 본문      /p            │
│    일반 텍스트 단락         │
│                            │
│ 📄 제목 1    /h1           │ ← 선택됨 (파란 배경)
│    가장 큰 제목            │
│                            │
│ 📊 표        /table        │
│    데이터를 표 형태로 정리  │
└────────────────────────────┘
```

### 7.8 BlockActions (블록 액션)

**파일**: `src/components/esgeditor/BlockActions.tsx`

**기능**:
- 드래그 핸들 (🔲)
- 블록 추가 (➕)
- 더보기 메뉴 (⋮)
  - 위로/아래로 이동
  - 복제
  - 삭제

**표시 조건**:
- 블록 호버 시에만 표시
- `opacity-0 group-hover:opacity-100`

---

## 8. 주요 기능

### 8.1 블록 추가 (3가지 방법)

#### 방법 1: + 버튼 (블록 액션)
```typescript
// BlockActions.tsx
<button onClick={onAddBelow}>
  <Plus size={16} />
</button>

// Canvas.tsx
const handleAddBlock = () => {
  openBlockTypeMenu();
};
```

#### 방법 2: 섹션 끝 버튼
```typescript
// Canvas.tsx
<AddBlockButton onClick={() => openBlockTypeMenu()} />
```

#### 방법 3: 슬래시 커맨드
```typescript
// Canvas.tsx
const handleKeyPress = (e: React.KeyboardEvent, blockId: string) => {
  if (e.key === '/' && isBlockEmpty(blockId)) {
    e.preventDefault();
    setSlashCommandBlock(blockId);
    openBlockTypeMenu();
  }
};
```

### 8.2 텍스트 포맷팅

**플로팅 툴바** (텍스트 선택 시):
```
┌─────────────────────────────────┐
│ [B] [I] [U] [H] [Code] [Link]  │
└─────────────────────────────────┘
```

**키보드 단축키**:
- `Ctrl+B`: 굵게
- `Ctrl+I`: 기울임
- `Ctrl+U`: 밑줄
- `Ctrl+E`: 코드
- `Ctrl+Shift+H`: 하이라이트

**구현**:
```typescript
const applyFormat = (mark: TextMark) => {
  const selection = window.getSelection();
  // ... 선택 영역 파싱
  
  const command = new ApplyMarkCommand({
    sectionId,
    blockId,
    inlineNodeId,
    mark,
    startOffset,
    endOffset,
  });
  
  execute(command);
};
```

### 8.3 Undo/Redo

**키보드 단축키**:
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z`: Redo

**UI 버튼** (TopBar):
```typescript
<button onClick={undo} disabled={!canUndo}>
  <Undo2 size={18} />
</button>
<button onClick={redo} disabled={!canRedo}>
  <Redo2 size={18} />
</button>
```

**Command Stack 로직**:
```typescript
// Undo 실행
const commandToUndo = past[past.length - 1];
const newDocument = commandToUndo.undo(currentDocument);
setState({
  past: past.slice(0, -1),
  future: [commandToUndo, ...future],
});

// Redo 실행
const commandToRedo = future[0];
const newDocument = commandToRedo.execute(currentDocument);
setState({
  past: [...past, commandToRedo],
  future: future.slice(1),
});
```

### 8.4 드래그 앤 드롭

**패키지**: `@dnd-kit/core`, `@dnd-kit/sortable`

**구현 상태**:
- ✅ SortableBlock 래퍼 생성
- ✅ 드래그 핸들 UI
- 🔜 DndContext 통합 (향후)

**예정 구조**:
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={blockIds}>
    {blocks.map(block => (
      <SortableBlock key={block.id} id={block.id}>
        {renderBlock(block)}
      </SortableBlock>
    ))}
  </SortableContext>
</DndContext>
```

### 8.5 표 블록 편집

**행 추가**:
```typescript
const handleAddRow = () => {
  const newRow = Array(cols).fill('');
  const updatedCells = [...cells, newRow];
  updateTableData(updatedCells);
};
```

**셀 편집**:
```typescript
<td
  contentEditable
  suppressContentEditableWarning
  onBlur={(e) => handleCellEdit(rowIndex, colIndex, e.currentTarget.textContent)}
>
  {cell}
</td>
```

### 8.6 이미지 블록 관리

**URL 입력**:
```typescript
<input
  type="text"
  placeholder="이미지 URL 입력"
  value={imageUrl}
  onChange={(e) => setImageUrl(e.target.value)}
/>
```

**파일 업로드** (백엔드 필요):
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  setImageUrl(url);
};
```

---

## 9. UI/UX 설계 원칙

### 9.1 디자인 시스템

**색상 팔레트**:
```css
/* 주요 색상 */
--primary: #3b82f6;        /* 파란색 - 버튼, 링크 */
--success: #10b981;        /* 초록색 - 저장 완료 */
--error: #ef4444;          /* 빨간색 - 에러, 삭제 */
--warning: #f59e0b;        /* 노란색 - 경고 */

/* 중립 색상 */
--gray-50: #f9fafb;        /* 배경 */
--gray-100: #f3f4f6;       /* 호버 배경 */
--gray-200: #e5e7eb;       /* 경계선 */
--gray-500: #6b7280;       /* 부가 텍스트 */
--gray-800: #1f2937;       /* 주요 텍스트 */

/* ESG 카테고리 */
--env-color: #10b981;      /* 환경 - 초록 */
--social-color: #3b82f6;   /* 사회 - 파랑 */
--gov-color: #8b5cf6;      /* 거버넌스 - 보라 */
```

**타이포그래피**:
```css
/* 제목 */
h1: 32px / 600 / 1.2
h2: 24px / 600 / 1.3
h3: 20px / 600 / 1.4

/* 본문 */
body: 16px / 400 / 1.6
small: 14px / 400 / 1.5
```

**간격 시스템** (Tailwind):
```
space-1: 0.25rem (4px)
space-2: 0.5rem  (8px)
space-3: 0.75rem (12px)
space-4: 1rem    (16px)
space-6: 1.5rem  (24px)
space-8: 2rem    (32px)
```

### 9.2 인터랙션 원칙

#### 1. 즉각적인 피드백
- 버튼 클릭 → 즉시 상태 변경
- 저장 작업 → 로딩 인디케이터 표시
- 에러 발생 → Toast 알림

#### 2. 점진적 공개
- 기본: 필수 기능만 표시
- 호버: 추가 액션 표시 (BlockActions)
- 클릭: 상세 설정 패널 열기

#### 3. 일관된 경험
- 모든 블록 타입에 동일한 액션 제공
- 키보드 단축키 표준화
- 애니메이션 일관성 (Framer Motion)

#### 4. 실수 방지
- 삭제 전 확인 (향후)
- Undo/Redo 항상 가능
- 자동 저장

### 9.3 접근성 (A11y)

**키보드 네비게이션**:
```typescript
// Tab: 블록 간 이동
// Enter: 블록 편집 모드
// Esc: 편집 취소
// Ctrl+Z/Shift+Z: Undo/Redo
```

**ARIA 속성**:
```typescript
<button
  aria-label="블록 삭제"
  aria-keyshortcuts="Delete"
  role="button"
>
  <Trash2 />
</button>
```

**포커스 관리**:
```typescript
// 블록 추가 후 자동 포커스
const newBlockRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (newBlockId === block.id) {
    newBlockRef.current?.focus();
  }
}, [newBlockId]);
```

### 9.4 반응형 디자인

**브레이크포인트**:
```css
/* 모바일 */
sm: 640px

/* 태블릿 */
md: 768px

/* 데스크톱 */
lg: 1024px

/* 대형 화면 */
xl: 1280px
```

**레이아웃 조정**:
```typescript
// 모바일: 사이드바 숨김
<div className="hidden lg:block">
  <SidebarLeft />
</div>

// 태블릿: 사이드바 토글
<button onClick={toggleLeftSidebar} className="lg:hidden">
  <Menu />
</button>
```

---

## 10. 개발 가이드

### 10.1 개발 환경 설정

```bash
# 1. 의존성 설치
cd frontend
pnpm install

# 2. 개발 서버 실행
pnpm dev

# 3. 브라우저에서 접속
http://localhost:3000/esgreport-editor
```

### 10.2 새로운 블록 타입 추가

#### Step 1: 타입 정의
```typescript
// src/types/blockSchema.ts
export enum BlockType {
  // ... 기존 타입
  CALLOUT = 'callout',  // 새로운 타입
}

interface BlockAttributes {
  // ... 기존 속성
  calloutType?: 'info' | 'warning' | 'success' | 'error';
}
```

#### Step 2: 컴포넌트 생성
```typescript
// src/components/esgeditor/CalloutBlock.tsx
interface CalloutBlockProps {
  block: BlockNode;
  readOnly: boolean;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block, readOnly }) => {
  const type = block.attributes?.calloutType || 'info';
  
  return (
    <div className={`callout callout-${type}`}>
      <InlineRenderer content={block.content} />
    </div>
  );
};
```

#### Step 3: Canvas에 통합
```typescript
// src/components/esgeditor/Canvas.tsx
import { CalloutBlock } from './CalloutBlock';

const renderBlock = (block: BlockNode) => {
  switch (block.type) {
    // ... 기존 케이스
    case 'callout':
      return <CalloutBlock block={block} readOnly={false} />;
  }
};
```

#### Step 4: BlockTypeMenu에 추가
```typescript
// src/components/esgeditor/BlockTypeMenu.tsx
const blockTypes: BlockTypeMenuItem[] = [
  // ... 기존 타입
  { 
    type: 'callout', 
    label: '콜아웃', 
    icon: <AlertCircle size={18} />, 
    description: '중요한 정보 강조',
    shortcut: '/callout',
  },
];
```

### 10.3 새로운 Command 추가

```typescript
// src/commands/DuplicateBlockCommand.ts
import { EditorCommand } from '@/types/commands';
import { DocumentNode, BlockNode } from '@/types/documentSchema';

interface DuplicateBlockPayload {
  sectionId: string;
  blockId: string;
}

export class DuplicateBlockCommand implements EditorCommand {
  type = 'DUPLICATE_BLOCK';
  private payload: DuplicateBlockPayload;
  private duplicatedBlockId: string | null = null;

  constructor(payload: DuplicateBlockPayload) {
    this.payload = payload;
  }

  execute(document: DocumentNode): DocumentNode {
    const section = document.sections.find(s => s.id === this.payload.sectionId);
    if (!section) return document;

    const blockIndex = section.blocks.findIndex(b => b.id === this.payload.blockId);
    if (blockIndex === -1) return document;

    const originalBlock = section.blocks[blockIndex];
    const duplicatedBlock = {
      ...originalBlock,
      id: `block-${Date.now()}`,
    };
    this.duplicatedBlockId = duplicatedBlock.id;

    const newBlocks = [
      ...section.blocks.slice(0, blockIndex + 1),
      duplicatedBlock,
      ...section.blocks.slice(blockIndex + 1),
    ];

    return {
      ...document,
      sections: document.sections.map(s =>
        s.id === this.payload.sectionId
          ? { ...s, blocks: newBlocks }
          : s
      ),
    };
  }

  undo(document: DocumentNode): DocumentNode {
    if (!this.duplicatedBlockId) return document;

    const section = document.sections.find(s => s.id === this.payload.sectionId);
    if (!section) return document;

    return {
      ...document,
      sections: document.sections.map(s =>
        s.id === this.payload.sectionId
          ? { ...s, blocks: s.blocks.filter(b => b.id !== this.duplicatedBlockId) }
          : s
      ),
    };
  }

  describe(): string {
    return `복제: ${this.payload.blockId}`;
  }
}
```

### 10.4 테스트 데이터 추가

```typescript
// src/lib/mockData.ts
export const mockDocument: DocumentNode = {
  id: 'doc-001',
  title: '2024 ESG 보고서',
  metadata: {
    authorId: 'user-001',
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-10-10T00:00:00Z',
    version: 5,
    status: 'draft',
    reportingYear: 2024,
    organization: {
      name: '테크 컴퍼니',
      industry: 'IT',
    },
    framework: 'GRI',
  },
  pageSetup: {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 2.54, right: 2.54, bottom: 2.54, left: 2.54 },
  },
  sections: [
    {
      id: 'section-1',
      type: 'section',
      title: 'Executive Summary',
      description: '경영진 요약',
      griReference: 'GRI 102-14',
      metadata: {
        category: 'governance',
        materiality: 'high',
      },
      blocks: [
        {
          id: 'block-1',
          type: 'paragraph',
          content: [
            { text: '2024년 우리 회사의 ', marks: [] },
            { text: 'ESG 성과', marks: ['bold'] },
            { text: '를 보고합니다.', marks: [] },
          ],
        },
      ],
    },
  ],
};
```

### 10.5 디버깅 팁

#### CommandDebugger 사용
```typescript
// 개발 모드에서 자동으로 표시됨
// frontend/src/components/esgeditor/CommandDebugger.tsx

- History Size: 5개
- Can Undo: Yes
- Can Redo: No

[Insert Block] [Update First Block] [Delete First Block]
[Undo] [Redo]
```

#### Zustand DevTools
```typescript
// src/store/editorStore.ts
import { devtools } from 'zustand/middleware';

export const useEditorStore = create(
  devtools((set) => ({
    // ... store 정의
  }), { name: 'EditorStore' })
);
```

#### React DevTools Profiler
```bash
# Chrome Extension 설치
# Components 탭에서 상태 확인
# Profiler 탭에서 렌더링 성능 확인
```

### 10.6 성능 최적화

#### React.memo 활용
```typescript
export const BlockRenderer = React.memo<BlockRendererProps>(
  ({ block, sectionId }) => {
    // ... 렌더링 로직
  },
  (prevProps, nextProps) => {
    // 블록 ID와 content가 같으면 리렌더링 스킵
    return prevProps.block.id === nextProps.block.id
      && JSON.stringify(prevProps.block.content) === JSON.stringify(nextProps.block.content);
  }
);
```

#### useMemo로 계산 캐싱
```typescript
const blockIds = useMemo(() => {
  return section.blocks.map(b => b.id);
}, [section.blocks]);
```

#### useCallback으로 함수 메모이제이션
```typescript
const handleBlockUpdate = useCallback((blockId: string, content: InlineNode[]) => {
  execute(new UpdateBlockContentCommand({ sectionId, blockId, content }));
}, [sectionId, execute]);
```

### 10.7 코드 스타일 가이드

**네이밍 규칙**:
```typescript
// 컴포넌트: PascalCase
export const EditorCanvas: React.FC = () => {};

// 함수/변수: camelCase
const handleBlockInsert = () => {};
const isEditing = true;

// 상수: UPPER_SNAKE_CASE
const MAX_UNDO_HISTORY = 100;

// 타입/인터페이스: PascalCase
interface DocumentNode {}
type BlockType = 'paragraph' | 'heading';

// CSS 클래스: kebab-case (Tailwind)
className="block-wrapper hover:bg-gray-100"
```

**파일 구조**:
```typescript
// 1. 외부 라이브러리 임포트
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. 내부 타입 임포트
import { DocumentNode } from '@/types/documentSchema';

// 3. 컴포넌트 임포트
import { BlockActions } from './BlockActions';

// 4. 유틸리티 임포트
import { generateId } from '@/lib/utils';

// 5. 타입 정의
interface Props {
  // ...
}

// 6. 컴포넌트 정의
export const Component: React.FC<Props> = (props) => {
  // ...
};
```

---

## 📝 변경 이력

| 버전 | 날짜 | 변경 내역 |
|------|------|-----------|
| 1.0.0 | 2025-10-10 | 초기 문서 작성 (Phase 4 완료 기준) |

---

## 🔗 관련 문서

- [UI/UX 디자인 가이드](./ESG_EDITOR_UI_UX_GUIDE.md)
- [PRD 문서](../../public/docs/ESGReport.md)
- [Developer Handoff](../../public/docs/Developer%20Handoff.md)

---

## 📧 문의

기술적 질문이나 개선 제안은 프로젝트 저장소의 Issues를 통해 남겨주세요.

