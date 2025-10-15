# ESG Report Editor - 구현 현황

> **최종 업데이트**: 2025-10-10  
> **현재 Phase**: Phase 4 완료  
> **진행률**: 70%

---

## 📊 전체 진행 상황

```
Phase 1: 데이터 모델 설계     ████████████████████ 100%
Phase 2: 3-Panel 레이아웃      ████████████████████ 100%
Phase 3: Command System       ████████████████████ 100%
Phase 4: 고급 편집 기능        ████████████████████ 100%
Phase 5: 실시간 협업 (Yjs)    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 6: 백엔드 연동          ░░░░░░░░░░░░░░░░░░░░   0%
Phase 7: PDF/Word 내보내기    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 8: 고급 분석/AI         ░░░░░░░░░░░░░░░░░░░░   0%

전체 진행률: ██████████████░░░░░░ 70%
```

---

## ✅ Phase 1: 데이터 모델 설계 (완료)

### 구현 내용
- ✅ `DocumentNode` 스키마 정의
- ✅ `SectionNode` 스키마 정의
- ✅ `BlockNode` 스키마 정의 (8가지 블록 타입)
- ✅ `InlineNode` 스키마 정의 (텍스트 포맷팅)
- ✅ `ESGMetricBlock` 스키마 정의

### 파일 목록
```
src/types/
├── documentSchema.ts
├── sectionSchema.ts
├── blockSchema.ts
├── inlineSchema.ts
└── esgBlock.ts
```

### 지원 블록 타입
| 타입 | 상태 | 단축키 |
|------|------|--------|
| `paragraph` | ✅ 완료 | `/p` |
| `heading` | ✅ 완료 | `/h1`, `/h2`, `/h3` |
| `list` | ✅ 완료 | `/ul`, `/ol` |
| `quote` | ✅ 완료 | `/quote` |
| `table` | ✅ 완료 | `/table` |
| `image` | ✅ 완료 | `/img` |
| `chart` | 🔜 예정 | `/chart` |
| `esgMetric` | 🔜 예정 | `/esg` |

---

## ✅ Phase 2: 3-Panel 레이아웃 (완료)

### 구현 내용
- ✅ `EditorShell` 메인 레이아웃
- ✅ `TopBar` 상단 네비게이션
- ✅ `SidebarLeft` 섹션 네비게이션
- ✅ `SidebarRight` 댓글/활동 피드
- ✅ `Canvas` 에디터 영역
- ✅ 사이드바 토글 기능
- ✅ 반응형 레이아웃 (기본 구조)

### 파일 목록
```
src/components/esgeditor/
├── EditorShell.tsx       ✅
├── TopBar.tsx            ✅
├── SidebarLeft.tsx       ✅
├── SidebarRight.tsx      ✅
└── Canvas.tsx            ✅
```

### UI 상태 관리
```typescript
// src/store/uiStore.ts
- isLeftSidebarOpen       ✅
- isRightSidebarOpen      ✅
- isVersionDrawerOpen     ✅
- isPermissionDrawerOpen  ✅
- saveStatus              ✅
- lastSaved               ✅
- isDirty                 ✅
```

---

## ✅ Phase 3: Command System (완료)

### 구현 내용
- ✅ `EditorCommand` 인터페이스 정의
- ✅ `InsertBlockCommand` 구현
- ✅ `UpdateBlockContentCommand` 구현
- ✅ `DeleteBlockCommand` 구현
- ✅ `MoveBlockCommand` 구현
- ✅ `ApplyMarkCommand` 구현
- ✅ `useCommand` 훅 구현
- ✅ Undo/Redo 스택 관리
- ✅ Command Stack 디버거

### 파일 목록
```
src/commands/
├── InsertBlockCommand.ts         ✅
├── UpdateBlockContentCommand.ts  ✅
├── DeleteBlockCommand.ts         ✅
├── MoveBlockCommand.ts           ✅
├── ApplyMarkCommand.ts           ✅
└── index.ts                      ✅

src/hooks/
└── useCommand.ts                 ✅

src/types/
└── commands.ts                   ✅

src/components/esgeditor/
└── CommandDebugger.tsx           ✅
```

### Command 실행 흐름
```
1. 사용자 액션 발생
2. Command 객체 생성
3. execute(command) 호출
4. past 스택에 푸시
5. 문서 상태 업데이트
6. Undo/Redo 버튼 활성화
```

### Undo/Redo 지원
- ✅ `Ctrl+Z`: Undo
- ✅ `Ctrl+Shift+Z`: Redo
- ✅ TopBar 버튼 UI
- ✅ 히스토리 무한 추적

---

## ✅ Phase 4: 고급 편집 기능 (완료)

### 4.1 블록 추가 시스템 ✅

#### 구현 내용
- ✅ `BlockTypeMenu` 컴포넌트
- ✅ `AddBlockButton` 컴포넌트
- ✅ 슬래시 커맨드 (`/`) 구현
- ✅ 검색 기능
- ✅ 키보드 네비게이션

#### 파일 목록
```
src/components/esgeditor/
├── BlockTypeMenu.tsx     ✅
└── AddBlockButton.tsx    ✅
```

#### 블록 추가 방법 (3가지)
1. ✅ **+ 버튼**: 블록 호버 → [+] 클릭
2. ✅ **섹션 끝 버튼**: [+ 블록 추가] 클릭
3. ✅ **슬래시 커맨드**: `/` 입력 → 블록 타입 선택

### 4.2 블록 액션 ✅

#### 구현 내용
- ✅ `BlockActions` 컴포넌트
- ✅ 드래그 핸들 UI
- ✅ 블록 추가 버튼
- ✅ 더보기 메뉴 (위로/아래로 이동, 복제, 삭제)
- ✅ 호버 시 표시/숨김

#### 파일 목록
```
src/components/esgeditor/
└── BlockActions.tsx      ✅
```

#### 지원 액션
| 액션 | 상태 | Command |
|------|------|---------|
| 위로 이동 | ✅ | `MoveBlockCommand` |
| 아래로 이동 | ✅ | `MoveBlockCommand` |
| 복제 | ✅ | `InsertBlockCommand` |
| 삭제 | ✅ | `DeleteBlockCommand` |
| 블록 추가 | ✅ | `InsertBlockCommand` |

### 4.3 텍스트 포맷팅 ✅

#### 구현 내용
- ✅ `FloatingToolbar` 컴포넌트
- ✅ `InlineRenderer` 컴포넌트
- ✅ 텍스트 선택 감지
- ✅ 포맷 적용/제거
- ✅ 키보드 단축키

#### 지원 포맷
| 포맷 | 상태 | 단축키 |
|------|------|--------|
| 굵게 | ✅ | `Ctrl+B` |
| 기울임 | ✅ | `Ctrl+I` |
| 밑줄 | ✅ | `Ctrl+U` |
| 코드 | ✅ | `Ctrl+E` |
| 하이라이트 | ✅ | `Ctrl+Shift+H` |
| 링크 | 🔜 | `Ctrl+K` |

### 4.4 드래그 앤 드롭 (부분 완료)

#### 구현 내용
- ✅ `@dnd-kit` 패키지 설치
- ✅ `SortableBlock` 래퍼 생성
- ✅ 드래그 핸들 UI
- 🔜 `DndContext` 통합 (향후)
- 🔜 섹션 간 드래그 (향후)

#### 파일 목록
```
src/components/esgeditor/
└── SortableBlock.tsx     ✅ (준비 완료)
```

### 4.5 표 블록 ✅

#### 구현 내용
- ✅ `TableBlock` 컴포넌트
- ✅ 동적 행/열 추가
- ✅ 동적 행/열 삭제
- ✅ 셀 인라인 편집
- ✅ 헤더 행 스타일
- ✅ 최소 1x1 크기 유지

#### 파일 목록
```
src/components/esgeditor/
└── TableBlock.tsx        ✅
```

#### 기능
- ✅ 기본 3x3 표 생성
- ✅ 행 추가/삭제
- ✅ 열 추가/삭제
- ✅ 셀 편집 (contentEditable)
- ✅ 호버 시 액션 버튼 표시

### 4.6 이미지 블록 ✅

#### 구현 내용
- ✅ `ImageBlock` 컴포넌트
- ✅ URL 입력 방식
- ✅ 파일 업로드 UI (백엔드 필요)
- ✅ 3가지 정렬 (왼쪽/가운데/오른쪽)
- ✅ 너비 조절 (20-100%)
- ✅ 이미지 툴바 (호버 시)
- ✅ 로드 실패 처리

#### 파일 목록
```
src/components/esgeditor/
└── ImageBlock.tsx        ✅
```

#### 기능
- ✅ 이미지 URL 입력
- ✅ 파일 업로드 UI (API 연동 대기)
- ✅ 정렬: 왼쪽/가운데/오른쪽
- ✅ 너비 슬라이더 (20-100%)
- ✅ 호버 툴바 (정렬, 링크, 삭제)

---

## 🔜 Phase 5: 실시간 협업 (Yjs) - 예정

### 계획된 기능
- [ ] Yjs + y-websocket 통합
- [ ] 문서 동기화
- [ ] 커서 위치 공유
- [ ] 사용자 아바타 표시
- [ ] 변경 사항 하이라이트
- [ ] 충돌 해결

### 필요 패키지
```bash
pnpm add yjs y-websocket y-protocols
```

### 예상 구조
```typescript
// src/lib/yjs.ts
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider(
  'ws://localhost:1234', 
  'esg-report-room', 
  ydoc
);

const yContent = ydoc.getMap('content');
```

---

## 🔜 Phase 6: 백엔드 연동 - 예정

### 계획된 API
- [ ] `POST /api/documents` - 문서 생성
- [ ] `GET /api/documents/:id` - 문서 조회
- [ ] `PUT /api/documents/:id` - 문서 수정
- [ ] `DELETE /api/documents/:id` - 문서 삭제
- [ ] `POST /api/documents/:id/versions` - 버전 저장
- [ ] `GET /api/documents/:id/versions` - 버전 목록
- [ ] `POST /api/upload` - 이미지 업로드
- [ ] `POST /api/comments` - 댓글 작성
- [ ] `GET /api/comments?documentId=` - 댓글 조회

### 자동 저장 로직
```typescript
const debouncedSave = useDebouncedCallback(
  async (document: DocumentNode) => {
    setSaveStatus('saving');
    
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(document),
      });
      
      if (response.ok) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        setIsDirty(false);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      setSaveStatus('offline');
    }
  },
  3000
);
```

---

## 🔜 Phase 7: PDF/Word 내보내기 - 예정

### 계획된 기능
- [ ] PDF 내보내기 (jsPDF + html2canvas)
- [ ] Word 내보내기 (docx.js)
- [ ] 커스텀 템플릿
- [ ] 페이지 레이아웃 설정
- [ ] 헤더/푸터 커스터마이징
- [ ] 목차 자동 생성

### 필요 패키지
```bash
pnpm add jspdf html2canvas docx
```

---

## 🔜 Phase 8: 고급 분석/AI - 예정

### 계획된 기능
- [ ] ESG 점수 자동 계산
- [ ] GRI 표준 매칭 추천
- [ ] AI 작성 지원 (GPT 통합)
- [ ] 유사 보고서 비교
- [ ] 누락 항목 자동 감지
- [ ] 데이터 시각화 추천

---

## 📦 현재 의존성

### Core
```json
{
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x"
}
```

### 상태 관리
```json
{
  "zustand": "^5.0.8"
}
```

### UI/애니메이션
```json
{
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

### 드래그 앤 드롭
```json
{
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x"
}
```

---

## 🐛 알려진 이슈

### 1. 드래그 앤 드롭 미완성
**현재 상태**: `SortableBlock` 컴포넌트만 생성됨  
**필요 작업**: `DndContext` 통합, 드롭 핸들러 구현  
**우선순위**: 중간

### 2. 차트 블록 미구현
**현재 상태**: 스키마만 정의됨  
**필요 작업**: `ChartBlock` 컴포넌트 생성, 차트 라이브러리 통합 (Recharts or Chart.js)  
**우선순위**: 낮음

### 3. ESG 지표 블록 미구현
**현재 상태**: 스키마만 정의됨  
**필요 작업**: `ESGMetricBlock` 컴포넌트 생성, 지표 입력 폼  
**우선순위**: 중간

### 4. 링크 삽입 기능 미완성
**현재 상태**: UI만 있음  
**필요 작업**: 링크 다이얼로그, URL 검증, 커서 위치 삽입  
**우선순위**: 낮음

### 5. 이미지 업로드 백엔드 연동 필요
**현재 상태**: 파일 선택 UI만 있음  
**필요 작업**: `/api/upload` 엔드포인트 구현, FormData 전송  
**우선순위**: 중간

---

## 📈 다음 마일스톤

### Sprint 5 (예정)
**목표**: 실시간 협업 기능 (Yjs)  
**기간**: 2주  
**작업**:
1. Yjs + WebSocket 서버 구축
2. 문서 동기화 구현
3. 커서 위치 공유
4. 사용자 아바타 표시
5. 충돌 해결 로직

### Sprint 6 (예정)
**목표**: 백엔드 연동  
**기간**: 2주  
**작업**:
1. REST API 구현 (FastAPI 또는 Next.js API Routes)
2. 자동 저장 로직
3. 버전 관리 시스템
4. 댓글 시스템
5. 이미지 업로드

### Sprint 7 (예정)
**목표**: PDF/Word 내보내기  
**기간**: 1주  
**작업**:
1. PDF 생성 (jsPDF)
2. Word 생성 (docx.js)
3. 템플릿 시스템
4. 내보내기 설정 UI

---

## 🎯 성능 최적화 계획

### 1. 가상화 (Virtualization)
- **현재**: 모든 블록 렌더링
- **개선**: `@tanstack/react-virtual` 사용
- **효과**: 1000+ 블록 문서도 부드럽게

### 2. 코드 스플리팅
- **현재**: 모든 블록 컴포넌트 한 번에 로드
- **개선**: 동적 import (React.lazy)
- **효과**: 초기 로딩 시간 50% 단축

### 3. 메모이제이션
- **현재**: 일부 컴포넌트에만 적용
- **개선**: React.memo, useMemo, useCallback 전면 적용
- **효과**: 불필요한 리렌더링 제거

---

## 🔗 관련 문서

- [아키텍처 설계 문서](./ESG_EDITOR_ARCHITECTURE.md)
- [UI/UX 디자인 가이드](./ESG_EDITOR_UI_UX_GUIDE.md)
- [PRD 문서](../../public/docs/ESGReport.md)
- [Developer Handoff](../../public/docs/Developer%20Handoff.md)

---

## 📞 문의 및 피드백

프로젝트에 대한 질문이나 제안사항은 GitHub Issues를 통해 남겨주세요.

**현재 진행 상태**: Phase 4 완료 (70%)  
**다음 목표**: Phase 5 - 실시간 협업 (Yjs)

