# ESG Report Editor - 문서 목록

> **ESG 보고서 작성 전문 에디터**  
> Notion 스타일의 블록 기반 문서 편집기

---

## 📚 문서 구성

### 1. [아키텍처 설계 문서](./ESG_EDITOR_ARCHITECTURE.md)
**대상**: 백엔드/프론트엔드 개발자  
**내용**:
- 전체 아키텍처 구조
- 데이터 모델 상세 (DocumentNode, SectionNode, BlockNode)
- 상태 관리 (Zustand)
- Command Pattern 구현
- 컴포넌트 계층 구조
- 폴더 구조
- 개발 가이드

**주요 섹션**:
- 프로젝트 개요
- 기술 스택
- 데이터 모델
- Command System
- 컴포넌트 구조
- 개발 가이드 (새 블록 추가, 새 Command 추가)

---

### 2. [UI/UX 디자인 가이드](./ESG_EDITOR_UI_UX_GUIDE.md)
**대상**: UI/UX 디자이너, 프론트엔드 개발자  
**내용**:
- 디자인 철학
- 레이아웃 시스템
- 컴포넌트 디자인 스펙
- 인터랙션 패턴
- 애니메이션 가이드 (Framer Motion)
- 색상 시스템
- 타이포그래피
- 아이콘 가이드
- 반응형 디자인
- 접근성 (A11y)

**주요 섹션**:
- 3-Panel 레이아웃 디자인
- TopBar, SidebarLeft, SidebarRight, Canvas 디자인 스펙
- BlockActions, BlockTypeMenu, FloatingToolbar 디자인
- 애니메이션 Duration & Easing
- 색상 팔레트 (Primary, ESG Category, Semantic)
- 키보드 네비게이션 & ARIA 속성

---

### 3. [구현 현황](./IMPLEMENTATION_STATUS.md)
**대상**: 프로젝트 매니저, 개발자  
**내용**:
- Phase별 진행 상황 (1-8)
- 구현 완료 기능 체크리스트
- 알려진 이슈
- 다음 마일스톤
- 성능 최적화 계획

**현재 상태**:
- ✅ Phase 1: 데이터 모델 설계 (100%)
- ✅ Phase 2: 3-Panel 레이아웃 (100%)
- ✅ Phase 3: Command System (100%)
- ✅ Phase 4: 고급 편집 기능 (100%)
- 🔜 Phase 5: 실시간 협업 (0%)
- 🔜 Phase 6: 백엔드 연동 (0%)

---

## 🚀 빠른 시작

### 전제 조건
- Node.js 18+ 또는 20+
- pnpm 8+ (또는 npm, yarn)

### 설치 및 실행
```bash
# 1. 의존성 설치
cd frontend
pnpm install

# 2. 개발 서버 실행
pnpm dev

# 3. 브라우저에서 접속
# http://localhost:3000/esgreport-editor
```

### 프로젝트 구조
```
frontend/
├── src/
│   ├── app/
│   │   └── esgreport-editor/
│   │       └── page.tsx              # 에디터 페이지
│   │
│   ├── components/
│   │   └── esgeditor/                # 에디터 컴포넌트들
│   │       ├── EditorShell.tsx
│   │       ├── TopBar.tsx
│   │       ├── SidebarLeft.tsx
│   │       ├── SidebarRight.tsx
│   │       ├── Canvas.tsx
│   │       ├── BlockTypeMenu.tsx
│   │       ├── BlockActions.tsx
│   │       ├── TableBlock.tsx
│   │       ├── ImageBlock.tsx
│   │       └── ...
│   │
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── documentSchema.ts
│   │   ├── sectionSchema.ts
│   │   ├── blockSchema.ts
│   │   └── commands.ts
│   │
│   ├── store/                        # Zustand 상태 관리
│   │   ├── editorStore.ts
│   │   └── uiStore.ts
│   │
│   ├── commands/                     # Command Pattern 구현
│   │   ├── InsertBlockCommand.ts
│   │   ├── UpdateBlockContentCommand.ts
│   │   ├── DeleteBlockCommand.ts
│   │   └── ...
│   │
│   ├── hooks/                        # 커스텀 훅
│   │   └── useCommand.ts
│   │
│   └── lib/                          # 유틸리티
│       └── mockData.ts
│
└── docs/                             # 📚 프로젝트 문서
    ├── README.md                     # (본 문서)
    ├── ESG_EDITOR_ARCHITECTURE.md
    ├── ESG_EDITOR_UI_UX_GUIDE.md
    └── IMPLEMENTATION_STATUS.md
```

---

## 🎯 주요 기능

### ✅ 구현 완료
- **블록 기반 편집**: 8가지 블록 타입 지원 (단락, 제목, 목록, 인용, 표, 이미지, 차트, ESG 지표)
- **Command Pattern**: Undo/Redo 지원, 무한 히스토리
- **3-Panel 레이아웃**: TopBar, SidebarLeft, Canvas, SidebarRight
- **텍스트 포맷팅**: 굵게, 기울임, 밑줄, 코드, 하이라이트
- **슬래시 커맨드**: `/` 입력으로 빠른 블록 추가
- **블록 액션**: 이동, 복제, 삭제
- **표 블록**: 동적 행/열 추가/삭제, 셀 편집
- **이미지 블록**: URL 입력, 파일 업로드 UI, 정렬, 너비 조절
- **저장 상태 표시**: 실시간 저장 상태 (저장 중, 저장됨, 에러)
- **키보드 단축키**: Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), Ctrl+B (굵게) 등

### 🔜 개발 예정
- **실시간 협업**: Yjs 기반 동시 편집, 커서 공유
- **백엔드 연동**: 자동 저장, 버전 관리, 댓글 시스템
- **드래그 앤 드롭**: 블록 순서 변경
- **차트 블록**: 데이터 시각화 (Recharts)
- **ESG 지표 블록**: 정량 지표 입력 및 관리
- **PDF/Word 내보내기**: 보고서 배포
- **AI 작성 지원**: GPT 통합

---

## 🛠️ 기술 스택

### Core
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript 5**

### 상태 관리
- **Zustand 5.0.8**: 경량 상태 관리

### UI/애니메이션
- **Tailwind CSS 3**: 유틸리티 기반 스타일링
- **Framer Motion 11**: 애니메이션
- **lucide-react**: 아이콘

### 에디터 기능
- **@dnd-kit**: 드래그 앤 드롭
- **contentEditable**: 텍스트 편집

---

## 📖 문서 읽는 순서

### 1. 프로젝트를 처음 접하는 개발자
```
1. 본 README (전체 개요)
   ↓
2. IMPLEMENTATION_STATUS.md (현재 진행 상황)
   ↓
3. ESG_EDITOR_ARCHITECTURE.md (아키텍처 이해)
   ↓
4. 코드 탐색 시작
```

### 2. UI/UX 디자이너
```
1. 본 README (전체 개요)
   ↓
2. ESG_EDITOR_UI_UX_GUIDE.md (디자인 스펙)
   ↓
3. Figma/디자인 툴에서 프로토타이핑
```

### 3. 새로운 기능 추가
```
1. ESG_EDITOR_ARCHITECTURE.md > 개발 가이드
   ↓
2. 해당 섹션 코드 예시 참고
   ↓
3. 구현 후 IMPLEMENTATION_STATUS.md 업데이트
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 블록 추가 및 편집
1. 브라우저에서 `/esgreport-editor` 접속
2. 빈 블록에서 `/` 입력
3. "표" 선택
4. 3x3 표 생성 확인
5. 셀 내용 입력
6. 행/열 추가 버튼 클릭
7. Ctrl+Z로 Undo 테스트

### 시나리오 2: 텍스트 포맷팅
1. 단락 블록에 텍스트 입력
2. 텍스트 드래그 선택
3. 플로팅 툴바 표시 확인
4. [B] 버튼 클릭 → 굵게 적용
5. Ctrl+I → 기울임 적용
6. Ctrl+Z → Undo 테스트

### 시나리오 3: 이미지 삽입
1. `/` → "이미지" 선택
2. 이미지 URL 입력 (예: https://picsum.photos/800/400)
3. 이미지 표시 확인
4. 호버 → 툴바 표시 확인
5. 정렬 변경 (왼쪽/가운데/오른쪽)
6. 너비 슬라이더 조절

### 시나리오 4: 블록 관리
1. 블록에 호버
2. 왼쪽 액션 버튼 표시 확인
3. [+] 클릭 → 블록 추가
4. [⋮] 클릭 → 더보기 메뉴
5. "복제" 클릭 → 블록 복제 확인
6. "삭제" 클릭 → 블록 삭제 확인

---

## 🐛 이슈 리포팅

버그를 발견하셨나요? 다음 정보와 함께 이슈를 등록해주세요:

```markdown
### 환경
- OS: Windows 10 / macOS 14 / Ubuntu 22.04
- 브라우저: Chrome 120 / Firefox 121 / Safari 17
- Node.js: v20.10.0

### 재현 단계
1. ...
2. ...
3. ...

### 예상 동작
...

### 실제 동작
...

### 스크린샷 (선택)
...
```

---

## 🤝 기여 가이드

### 코드 스타일
- **TypeScript**: strict 모드 사용
- **네이밍**: 
  - 컴포넌트: PascalCase
  - 함수/변수: camelCase
  - 상수: UPPER_SNAKE_CASE
- **포맷팅**: Prettier 사용
- **린팅**: ESLint 규칙 준수

### 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드/설정 변경
```

### Pull Request
1. `feature/기능명` 브랜치 생성
2. 변경 사항 커밋
3. 테스트 확인
4. PR 생성 (상세한 설명 포함)
5. 리뷰 대기

---

## 📞 연락처

- **프로젝트 저장소**: [GitHub Repository]
- **이슈 트래커**: [GitHub Issues]
- **문서 업데이트 요청**: [GitHub Discussions]

---

## 📝 라이선스

이 프로젝트는 [MIT License](../LICENSE)를 따릅니다.

---

## 📚 참고 자료

### 외부 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Zustand 가이드](https://zustand-demo.pmnd.rs/)
- [Framer Motion API](https://www.framer.com/motion/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [GRI Standards](https://www.globalreporting.org/standards/)

### 영감을 받은 프로젝트
- [Notion](https://notion.so)
- [Confluence](https://www.atlassian.com/software/confluence)
- [Google Docs](https://docs.google.com)
- [Quip](https://quip.com)

---

**마지막 업데이트**: 2025-10-10  
**버전**: 1.0.0  
**개발 진행률**: 70%

