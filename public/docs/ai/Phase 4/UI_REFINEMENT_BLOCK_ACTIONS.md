# BlockActions UI 개선 (2025-10-20)

## 📅 작업 일자
**2025-10-20**

---

## 🎯 개선 목표

블록 에디터의 시각적 노이즈를 최소화하고 AI 기능 접근성을 향상시키기 위한 UI 통폐합 작업.

### 기존 문제점
- **3개의 아이콘**: 드래그 핸들(6점), 추가 버튼(+), 더보기(3점) → 시각적 노이즈
- **AI 기능 접근성**: 더보기 메뉴 안에 숨겨져 있어 발견하기 어려움
- **중복 기능**: 추가 버튼은 `/` 키보드 입력과 중복

---

## ✅ 구현 사항

### 1. 아이콘 통폐합
```
Before: [GripVertical(6점)] [Plus] [MoreHorizontal(3점)]
After:  [GripVertical(6점)] [Sparkles(AI)]
```

**결과**: 3개 → 2개 아이콘 (33% 감소)

---

### 2. 드래그 핸들 기능 통합 (옵션 A)

#### 동작 방식
- **짧은 클릭** (< 200ms): 기본 메뉴 열기
- **길게 누르기** (≥ 200ms): 드래그 시작

#### 구현 코드
```typescript
const [isDragging, setIsDragging] = React.useState(false);
const dragTimeoutRef = React.useRef<number | null>(null);

const handleDragHandleMouseDown = (e: React.MouseEvent) => {
  // 길게 누르기 감지 (200ms 이상 = 드래그 시작)
  dragTimeoutRef.current = window.setTimeout(() => {
    setIsDragging(true);
  }, 200);
};

const handleDragHandleMouseUp = () => {
  if (dragTimeoutRef.current) {
    clearTimeout(dragTimeoutRef.current);
  }
  
  // 짧은 클릭이었다면 (드래그 안 함)
  if (!isDragging) {
    setShowBasicMenu(!showBasicMenu);
    setShowAIMenu(false); // AI 메뉴는 닫기
  }
  
  setIsDragging(false);
};
```

---

### 3. 메뉴 분리

#### 기본 메뉴 (드래그 핸들 클릭)
```
┌─────────────────────────────┐
│ ↑ 위로 이동                  │
│ ↓ 아래로 이동                │
├─────────────────────────────┤
│ 📄 복제                      │
├─────────────────────────────┤
│ 🗑️ 삭제                      │
└─────────────────────────────┘
```

#### AI 메뉴 (Sparkles 클릭)
```
┌─────────────────────────────┐
│ ✨ 프레임워크 매핑            │
│ 📝 내용 확장하기             │
└─────────────────────────────┘
```

---

### 4. 자동 메뉴 위치 조정 ✅

**Canvas.tsx의 BlockTypeMenu와 동일한 로직 적용**

#### 구현 원리
```typescript
const calculateMenuPosition = () => {
  const rect = buttonRef.current.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const menuHeight = 220;
  
  const spaceBelow = viewportHeight - rect.bottom;
  const shouldShowBelow = spaceBelow >= menuHeight;
  
  setMenuPosition(shouldShowBelow ? 'bottom' : 'top');
};
```

#### 동작 방식
- **공간 충분**: 버튼 **아래**에 메뉴 표시
- **공간 부족**: 버튼 **위**에 메뉴 표시
- 블록이 화면 하단에 있어도 메뉴가 잘림 방지

#### CSS 클래스
```typescript
className={`absolute left-0 z-20 bg-white ... ${
  menuPosition === 'bottom' 
    ? 'top-full mt-1'   // 아래로
    : 'bottom-full mb-1' // 위로
}`}
```

---

### 5. 제거된 기능
- ❌ **Plus 버튼**: `/` 키보드 입력과 블록 하단 + 버튼으로 대체
- ❌ **MoreHorizontal(3점)**: 드래그 핸들에 통합

---

## 📊 변경된 파일

### `frontend/src/components/features/report-editor/toolbar/BlockActions.tsx`

#### Import 제거
```diff
- import { Plus, MoreHorizontal } from 'lucide-react';
```

#### State 추가
```typescript
const [showBasicMenu, setShowBasicMenu] = React.useState(false);     // 기본 메뉴
const [showAIMenu, setShowAIMenu] = React.useState(false);           // AI 메뉴
const [isDragging, setIsDragging] = React.useState(false);           // 드래그 상태
const [menuPosition, setMenuPosition] = React.useState<'top' | 'bottom'>('bottom'); // 메뉴 위치
const dragTimeoutRef = React.useRef<number | null>(null);            // 타이머
const buttonRef = React.useRef<HTMLButtonElement>(null);             // 버튼 ref
```

#### 메뉴 위치 계산 함수
```typescript
const calculateMenuPosition = React.useCallback(() => {
  if (!buttonRef.current) return;
  
  const rect = buttonRef.current.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const menuHeight = 220; // 메뉴 예상 높이
  
  const spaceBelow = viewportHeight - rect.bottom;
  const shouldShowBelow = spaceBelow >= menuHeight;
  
  setMenuPosition(shouldShowBelow ? 'bottom' : 'top');
}, []);
```

#### UI 구조 변경
```tsx
<div className="block-actions ...">
  {/* 드래그 핸들 (짧은 클릭: 기본 메뉴 / 길게 누르기: 드래그) */}
  <div className="relative">
    <button
      ref={buttonRef}  // ← ref 추가
      {...listeners}
      {...attributes}
      onMouseDown={handleDragHandleMouseDown}
      onMouseUp={handleDragHandleMouseUp}
      onMouseLeave={handleDragHandleMouseLeave}
      title="클릭: 메뉴 / 길게 누르기: 드래그"
    >
      <GripVertical size={16} />
    </button>

    {/* 기본 메뉴 드롭다운 - 동적 위치 */}
    {showBasicMenu && (
      <motion.div
        className={`absolute left-0 z-20 ... ${
          menuPosition === 'bottom' 
            ? 'top-full mt-1'   // 아래로
            : 'bottom-full mb-1' // 위로
        }`}
      >
        {/* 위/아래 이동, 복제, 삭제 */}
      </motion.div>
    )}
  </div>

  {/* AI 전용 버튼 (Sparkles) */}
  <div className="relative">
    <button
      onClick={() => {
        calculateMenuPosition(); // ← 위치 계산
        setShowAIMenu(!showAIMenu);
        setShowBasicMenu(false);
      }}
      className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600"
      title="AI 기능"
    >
      <Sparkles size={16} className="text-indigo-500" />
    </button>

    {/* AI 메뉴 드롭다운 - 동적 위치 */}
    {showAIMenu && (
      <motion.div
        className={`absolute left-0 z-20 ... ${
          menuPosition === 'bottom' 
            ? 'top-full mt-1'   // 아래로
            : 'bottom-full mb-1' // 위로
        }`}
      >
        {/* 프레임워크 매핑, 내용 확장 */}
      </motion.div>
    )}
  </div>
</div>
```

#### 타입 수정
```typescript
// documentId 가져오기 (string -> number 변환)
const documentId = document?.id ? parseInt(document.id, 10) : undefined;

// API 호출 시
await mapESG(blockContent, documentId!, blockId, {...});
await expandContent(blockContent, documentId!, blockId, {...});
```

---

## 🎨 UX 개선 효과

### 시각적 노이즈 감소
- 아이콘 개수: **3개 → 2개** (33% 감소)
- 캔버스 영역 집중도 향상
- 더 깔끔한 인터페이스

### AI 기능 접근성 향상
- AI 전용 아이콘(Sparkles) 추가로 **즉시 인식 가능**
- 더보기 메뉴에서 찾을 필요 없음
- 색상 강조 (indigo)로 AI 기능 부각

### 기능 분리
- **기본 편집 기능**: 드래그 핸들 클릭
- **AI 기능**: Sparkles 클릭
- 명확한 기능 구분으로 혼란 감소

---

## 🔍 사용자 시나리오

### 시나리오 1: 블록 이동
1. 블록에 마우스 호버
2. 드래그 핸들(6점)을 **짧게 클릭**
3. "위로 이동" 또는 "아래로 이동" 선택

### 시나리오 2: 블록 드래그
1. 블록에 마우스 호버
2. 드래그 핸들(6점)을 **200ms 이상 길게 누르기**
3. 마우스를 움직여 원하는 위치로 드래그

### 시나리오 3: AI 매핑
1. 블록에 마우스 호버
2. Sparkles 아이콘 클릭
3. "프레임워크 매핑" 선택
4. 우측 사이드바에서 결과 확인

---

## 📝 기술적 세부사항

### 타이머 관리
- `window.setTimeout`으로 브라우저 타입 명시 (`number` 반환)
- `useRef`로 타이머 ID 저장
- `mouseLeave` 이벤트에서 타이머 정리 (메모리 누수 방지)

### 타입 변환
- `DocumentNode.id`는 `string` (에디터 내부)
- API는 `number` 기대
- `parseInt(document.id, 10)`으로 변환

### 메뉴 상태 관리
- 한 메뉴 열 때 다른 메뉴는 자동 닫기
- Backdrop 클릭 시 메뉴 닫기
- 메뉴 항목 클릭 후 자동 닫기

---

## ✅ 테스트 체크리스트

### 기본 동작
- [ ] 블록 호버 시 아이콘 2개 표시
- [ ] 드래그 핸들 짧은 클릭 → 기본 메뉴
- [ ] 드래그 핸들 길게 누르기 → 드래그 가능
- [ ] Sparkles 클릭 → AI 메뉴
- [ ] Backdrop 클릭 → 메뉴 닫힘

### 메뉴 기능
- [ ] 위/아래 이동 작동
- [ ] 복제 작동
- [ ] 삭제 작동 (확인 다이얼로그)
- [ ] 프레임워크 매핑 작동
- [ ] 내용 확장 작동

### 상태 관리
- [ ] 한 메뉴 열면 다른 메뉴 닫힘
- [ ] AI 작업 중 버튼 비활성화
- [ ] 동시 호출 차단 작동

---

## 🚀 다음 단계

### 단기
1. ✅ E2E 테스트 수행
2. ✅ 메뉴 위치 자동 조정 검증
3. ✅ 사용자 피드백 수집
4. ✅ 버그 수정

### 중기
- 키보드 단축키 추가 (⌘+M: 매핑, ⌘+E: 확장)
- 툴팁 개선 (더 자세한 설명)
- 모바일/터치 대응

### 장기
- AI 작업 히스토리
- 블록별 AI 추천
- 자동 매핑 제안

---

## 📚 관련 문서
- [AI_ASSIST_COMPLETE_INTEGRATION.md](./AI_ASSIST_COMPLETE_INTEGRATION.md)
- [AI_ASSIST_FINAL_IMPROVEMENTS.md](./AI_ASSIST_FINAL_IMPROVEMENTS.md)
- [AI_ASSIST_UI_REFINEMENT_AND_INTEGRATION.md](./AI_ASSIST_UI_REFINEMENT_AND_INTEGRATION.md)

---

**작성자**: AI Assistant  
**프로젝트**: ESG Gen v1 - AI Assist System  
**최종 업데이트**: 2025-10-20  
**상태**: ✅ 구현 완료 - E2E 테스트 대기

