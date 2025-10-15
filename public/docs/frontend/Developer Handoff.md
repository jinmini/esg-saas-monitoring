# 🧾 ESG Report Editor — Developer Handoff Document

**버전:** v1.0
**작성일:** 2025-10-10
**프로젝트명:** ESG Report Editor — *The Collaborative Canvas*
**목표:**
기업의 ESG 담당자, 컨설턴트, 임원이 실시간으로 협업하며 ESG 보고서를 작성·검토·게시할 수 있는 웹 기반 리포트 에디터 구축.

---

## 🔧 1. 시스템 개요

| 구분                | 기술 스택                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Frontend**      | Next.js (React 19, App Router), Tailwind + shadcn/ui, Zustand, React Query, Framer Motion |
| **Backend**       | FastAPI (Python 3.11), PostgreSQL, Redis, WebSocket (Yjs Provider), JWT Auth              |
| **Infra**         | Docker Compose, Railway (backend), Vercel (frontend)                                      |
| **Data Format**   | JSON (Document Schema 기반), OpenAPI 3.1 Contract                                           |
| **Design System** | ESG Theme (E/S/G 색상 체계), Atomic Design, A11y 준수                                           |
| **Collaboration** | CRDT (Yjs), Awareness (Presence), Version Snapshot Sync Layer                             |
| **RBAC**          | Role-Based Access Control (owner, admin, editor, commenter, viewer)                       |

---

## 📄 2. OpenAPI Contract 요약

| 리소스             | 주요 Endpoint                     | 설명         |
| --------------- | ------------------------------- | ---------- |
| **Auth**        | `/auth/login`                   | JWT 로그인    |
| **Documents**   | `/documents`, `/documents/{id}` | 생성·조회·수정   |
| **Sections**    | `/sections/{id}`                | 섹션 업데이트·삭제 |
| **Blocks**      | `/blocks/{id}`                  | 블록 수정·삭제   |
| **Comments**    | `/comments`                     | 댓글 CRUD    |
| **Versions**    | `/versions`                     | 스냅샷 저장·조회  |
| **Permissions** | `/permissions/{document_id}`    | 권한 관리      |

> 모든 API는 `Authorization: Bearer <token>` 헤더 사용.
> 프론트엔드 타입 자동 생성:
>
> ```bash
> npx openapi-typescript schema.yaml --output src/types/api.ts
> ```

---

## 📦 3. 데이터 스키마 (요약)

### **DocumentNode**

```ts
interface DocumentNode {
  id: string;
  type: 'document';
  title: string;
  metadata: DocumentMetadata;
  pageSetup: PageSetup;
  sections: SectionNode[];
}
```

### **SectionNode**

```ts
interface SectionNode {
  id: string;
  title: string;
  description?: string;
  blocks: BlockNode[];
}
```

### **BlockNode**

```ts
interface BlockNode {
  id: string;
  type: 'paragraph' | 'heading' | 'table' | 'chart' | 'image' | 'esgMetric';
  content: InlineNode[];
  attributes?: BlockAttributes;
  data?: Record<string, any>;
}
```

### **InlineNode**

```ts
interface InlineNode {
  text: string;
  marks?: ('bold' | 'italic' | 'underline' | 'strike' | 'code')[];
}
```

---

## 🧭 4. 프론트엔드 아키텍처 계층

```
src/
├─ app/
│   └─ editor/[documentId]/page.tsx
├─ components/
│   ├─ editor/
│   │   ├─ EditorShell.tsx
│   │   ├─ Canvas.tsx
│   │   ├─ SidebarLeft.tsx
│   │   ├─ SidebarRight.tsx
│   │   └─ BlockItem.tsx
│   ├─ toolbar/
│   ├─ version/
│   ├─ permission/
│   └─ common/
├─ hooks/
│   ├─ useEditorStore.ts
│   ├─ useCommand.ts
│   ├─ useAutosave.ts
│   ├─ usePresence.ts
│   └─ usePermission.ts
├─ services/
│   ├─ api.ts
│   ├─ websocket.ts
│   └─ snapshot.ts
├─ types/
│   ├─ documentSchema.ts
│   └─ api.ts
└─ mocks/
    ├─ handlers/
    ├─ data/
    └─ browser.ts
```

---

## ⚙️ 5. 핵심 상태 관리

### **Zustand Store 구조**

```ts
interface EditorState {
  document: DocumentNode;
  ui: {
    selectedSectionId?: string;
    selectedBlockId?: string;
    isDirty: boolean;
    status: 'saving' | 'saved' | 'error' | 'offline';
  };
  history: { past: DocumentNode[]; present: DocumentNode; future: DocumentNode[] };
  collab: { presence: Map<string, PresenceState> };
}

interface EditorActions {
  dispatch: (action: EditorAction) => void;
  undo: () => void;
  redo: () => void;
  autosave: () => Promise<void>;
}
```

---

## 🧠 6. Command System

| Command                | Payload                | 설명               |
| ---------------------- | ---------------------- | ---------------- |
| `INSERT_BLOCK`         | `{ sectionId, block }` | 새 블록 삽입          |
| `UPDATE_BLOCK_CONTENT` | `{ blockId, content }` | 텍스트 변경           |
| `APPLY_MARK`           | `{ inlineId, mark }`   | Bold/Italic 등 토글 |
| `MOVE_BLOCK`           | `{ from, to }`         | DnD 이동           |
| `UNDO/REDO`            | 없음                     | 상태 되돌리기          |
| `SAVE_SNAPSHOT`        | `{ versionLabel? }`    | 버전 저장            |
| `UPDATE_PERMISSION`    | `{ subject, role }`    | RBAC 변경          |

---

## 🧩 7. 주요 컴포넌트 API 명세

| 컴포넌트                   | Props                          | 주요 이벤트                         |
| ---------------------- | ------------------------------ | ------------------------------ |
| `<EditorShell />`      | `documentId`, `collabProvider` | onStatusChange                 |
| `<Canvas />`           | `sections`, `onBlockChange`    | onInsertBlock, onMoveBlock     |
| `<BlockItem />`        | `block`, `onUpdate`            | onContextMenu                  |
| `<SidebarLeft />`      | `sections`, `onSelectSection`  | onAddSection, onReorderSection |
| `<SidebarRight />`     | `threads`, `onAddComment`      | onResolve, onReopen            |
| `<TopBar />`           | `title`, `status`              | onTitleChange, onVersionClick  |
| `<VersionDrawer />`    | `versions`                     | onCompare, onRestore           |
| `<PermissionDrawer />` | `grants`                       | onGrantChange, onLinkGenerate  |

---

## 🎨 8. 디자인 시스템 (요약)

| 항목         | 구성                                     |
| ---------- | -------------------------------------- |
| **색상**     | ESG Theme (Green / Blue / Gray)        |
| **타이포그래피** | Inter / Noto Sans KR                   |
| **버튼 스타일** | Primary, Secondary, Destructive, Ghost |
| **상태 피드백** | Saving, Saved, Error, Offline          |
| **모션**     | Framer Motion: slide/fade/spring       |
| **접근성**    | ARIA, focus-visible, WCAG 2.1 AA       |
| **테마**     | Tailwind + `theme.ts` ESG 색상 토큰        |

---

## 💬 9. 협업·버전·권한 시스템 통합 구조

```
Y.Doc (CRDT)
   │
   ├─ Awareness (Presence)
   │     └─ peers { cursor, name, color }
   │
   └─ Snapshot Bridge
         ├─ trigger Autosave (local)
         ├─ send VersionSnapshot (API)
         └─ merge with Recovery System

RBAC Middleware
   ├─ onAction(cmd)
   └─ validate(permissionSet)
```

---

## 🧪 10. 테스트 및 품질 전략

| 범주                    | 도구                | 범위                     |
| --------------------- | ----------------- | ---------------------- |
| **Unit**              | Jest + RTL        | Reducer, Command, Hook |
| **Integration**       | Playwright        | 블록 편집, 코멘트, 버전         |
| **Contract**          | openapi-validator | Mock ↔ API 일치성         |
| **Mock**              | MSW               | API 시뮬레이션              |
| **A11y**              | Axe-core          | 접근성 검증                 |
| **Visual Regression** | Chromatic         | UI 변경 감지               |

---

## 🧰 11. 개발 프로세스 및 브랜치 전략

| 단계               | 브랜치                   | 설명                    |
| ---------------- | --------------------- | --------------------- |
| **설계 확정**        | `main`                | OpenAPI & Type Schema |
| **UI/UX 구축**     | `feature/ui-core`     | 컴포넌트/스토리북             |
| **상태관리/CRDT 연동** | `feature/editor-core` | Zustand + Yjs         |
| **API 연결 및 테스트** | `feature/integration` | API Mock 연결           |
| **배포 및 QA**      | `release/v1.0`        | Vercel Preview + E2E  |
| **운영 반영**        | `main`                | Production 배포         |

---

## 📈 12. 향후 확장 로드맵

| 분류                      | 기능                       | 우선순위 |
| ----------------------- | ------------------------ | ---- |
| **AI Assist**           | 문단 요약, ESG 기준 자동 매핑      | ★★★  |
| **Custom Block Plugin** | ESG Metric, Chart 확장 API | ★★★  |
| **Offline Mode**        | IndexedDB 기반 로컬 저장       | ★★☆  |
| **PDF Exporter**        | ESG 표준 레이아웃 PDF 출력       | ★★☆  |
| **Analytics**           | 편집 패턴/참여자 로그 시각화         | ★☆☆  |

---

## ✅ 13. 요약

| 항목           | 내용                                        |
| ------------ | ----------------------------------------- |
| **목표**       | ESG 보고서용 실시간 협업 문서 에디터                    |
| **핵심 기술**    | React + FastAPI + CRDT(Yjs)               |
| **데이터 구조**   | Document/Section/Block/Inline JSON Schema |
| **상태 관리**    | Command + Reducer + Undo/Redo + Autosave  |
| **UI/UX 패턴** | Atomic + MVU + ESG 테마 기반                  |
| **테스트 체계**   | Unit + Integration + Contract             |
| **출시 범위**    | 단일 사용자 안정화 → 협업 확장                        |




