# 메뉴 위치 자동 조정 구현 (2025-10-20)

## 📅 작업 일자
**2025-10-20**

---

## 🔍 문제 발견

### 사용자 리포트
> "드래그 앤 드롭과 AI 모두 메뉴가 블록 아래에 나타나고 있습니다. 
> "+"와 '/'로 생기는 블록 생성 버튼 메뉴는 블록 위로 잘 나타나고 있는데..."

### 원인 분석

#### ❌ BlockActions (수정 전)
```typescript
// 항상 아래로 표시
<motion.div className="absolute left-0 top-full mt-1 ...">
```

#### ✅ Canvas.tsx의 BlockTypeMenu (올바른 구현)
```typescript
// 공간에 따라 동적으로 위/아래 결정
const spaceBelow = viewportHeight - rect.bottom;
const shouldShowBelow = spaceBelow >= menuHeight;

setBlockTypeMenuPosition({
  top: shouldShowBelow 
    ? rect.bottom + window.scrollY + 8      // 아래 공간 충분
    : rect.top + window.scrollY - menuHeight - 8,  // 위로 표시
  left: rect.left + window.scrollX,
});
```

**결론**: BlockActions는 **항상 아래**에만 표시되어 화면 하단에서 메뉴가 잘림!

---

## ✅ 해결 방법

### 1. Canvas.tsx 로직 적용

BlockTypeMenu의 위치 계산 알고리즘을 BlockActions에 동일하게 적용.

### 2. 구현 단계

#### Step 1: State 추가
```typescript
const [menuPosition, setMenuPosition] = React.useState<'top' | 'bottom'>('bottom');
const buttonRef = React.useRef<HTMLButtonElement>(null);
```

#### Step 2: 위치 계산 함수
```typescript
const calculateMenuPosition = React.useCallback(() => {
  if (!buttonRef.current) return;
  
  const rect = buttonRef.current.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // 메뉴 예상 높이 (기본 메뉴: ~200px, AI 메뉴: ~100px)
  const menuHeight = 220;
  
  // 버튼 아래에 메뉴를 표시할 공간이 충분한지 확인
  const spaceBelow = viewportHeight - rect.bottom;
  const shouldShowBelow = spaceBelow >= menuHeight;
  
  setMenuPosition(shouldShowBelow ? 'bottom' : 'top');
}, []);
```

#### Step 3: 버튼에 ref 연결
```typescript
<button
  ref={buttonRef}  // ← 추가
  onMouseUp={handleDragHandleMouseUp}
  onClick={() => {
    calculateMenuPosition(); // ← 메뉴 열기 전 계산
    setShowAIMenu(!showAIMenu);
  }}
>
```

#### Step 4: CSS 클래스 동적 적용
```typescript
<motion.div
  className={`absolute left-0 z-20 bg-white ... ${
    menuPosition === 'bottom' 
      ? 'top-full mt-1'   // 아래로 표시 (기본값)
      : 'bottom-full mb-1' // 위로 표시 (공간 부족)
  }`}
>
```

---

## 🎯 동작 방식

### 시나리오 A: 블록이 화면 상단/중간
```
┌──────────────────────┐
│                      │
│  [블록]              │ ← 버튼 위치
│  ┌──────────────┐    │
│  │ 메뉴 (아래)  │    │ ← spaceBelow >= 220px
│  └──────────────┘    │
│                      │
└──────────────────────┘
```

### 시나리오 B: 블록이 화면 하단
```
┌──────────────────────┐
│                      │
│  ┌──────────────┐    │
│  │ 메뉴 (위)    │    │ ← spaceBelow < 220px
│  └──────────────┘    │
│  [블록]              │ ← 버튼 위치
│                      │
└──────────────────────┘
```

---

## 📊 변경 내역

### 수정된 파일
**`frontend/src/components/features/report-editor/toolbar/BlockActions.tsx`**

### 추가된 코드
- **State**: `menuPosition`, `buttonRef` (2줄)
- **함수**: `calculateMenuPosition` (~12줄)
- **호출**: 메뉴 열기 전 위치 계산 (2곳)
- **CSS**: 동적 클래스 적용 (2곳)

### 총 변경량
- **추가**: ~18 줄
- **수정**: ~4 줄

---

## 🧪 테스트 체크리스트

### 기본 동작
- [ ] 블록이 화면 **상단**에 있을 때: 메뉴가 **아래**에 표시
- [ ] 블록이 화면 **중간**에 있을 때: 메뉴가 **아래**에 표시
- [ ] 블록이 화면 **하단**에 있을 때: 메뉴가 **위**에 표시

### 경계 케이스
- [ ] 스크롤 후 메뉴 열기: 올바른 위치 계산
- [ ] 브라우저 창 크기 조절 후: 올바른 위치 계산
- [ ] 메뉴가 잘리지 않음 (화면 밖으로 나가지 않음)

### 양쪽 메뉴 검증
- [ ] **기본 메뉴** (드래그 핸들): 위치 자동 조정
- [ ] **AI 메뉴** (Sparkles): 위치 자동 조정

---

## 📐 기술적 세부사항

### 메뉴 높이 설정
```typescript
const menuHeight = 220; // px
```

**근거**:
- 기본 메뉴: 4개 항목 × 40px + 구분선 + 패딩 = ~200px
- AI 메뉴: 2개 항목 × 40px + 패딩 = ~100px
- 여유 공간 포함 → **220px**

### Tailwind CSS 클래스
```typescript
// 아래로 표시
'top-full mt-1'      // top: 100%, margin-top: 0.25rem

// 위로 표시
'bottom-full mb-1'   // bottom: 100%, margin-bottom: 0.25rem
```

### React.useCallback 사용 이유
- 메뉴 열릴 때마다 함수 재생성 방지
- 성능 최적화
- 의존성 배열 비어있음 (순수 계산 로직)

---

## 🎨 UX 개선 효과

### Before (수정 전)
```
문제:
❌ 화면 하단 블록 → 메뉴가 화면 밖으로 잘림
❌ 사용자가 스크롤해야 메뉴 볼 수 있음
❌ 불편한 사용 경험
```

### After (수정 후)
```
해결:
✅ 화면 하단 블록 → 메뉴가 위로 표시
✅ 항상 화면 내에서 메뉴 확인 가능
✅ 원활한 사용 경험
```

---

## 🔗 참고한 코드

### Canvas.tsx의 BlockTypeMenu (Line 208-230)
```typescript
const openBlockTypeMenu = useCallback((sectionId: string, position: number, targetElement?: HTMLElement) => {
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // BlockTypeMenu 예상 높이 (최대 높이 약 450px)
    const menuHeight = 450;
    
    // 블록 아래에 메뉴를 표시할 공간이 충분한지 확인
    const spaceBelow = viewportHeight - rect.bottom;
    const shouldShowBelow = spaceBelow >= menuHeight;
    
    setBlockTypeMenuPosition({
      top: shouldShowBelow 
        ? rect.bottom + window.scrollY + 8
        : rect.top + window.scrollY - menuHeight - 8,
      left: rect.left + window.scrollX,
    });
  }
  
  setTargetBlockPosition({ sectionId, position });
  setShowBlockTypeMenu(true);
}, []);
```

**학습**: 동일한 패턴을 BlockActions에 적용 ✅

---

## 🎓 배운 점

### 1. 일관성의 중요성
- 같은 프로젝트 내에서 유사한 UI 요소는 **동일한 로직** 사용
- Canvas의 BlockTypeMenu가 이미 올바르게 구현되어 있었음
- 기존 코드를 참고하여 일관성 유지

### 2. UX 테스트의 중요성
- 개발 중에는 화면 상단에서만 테스트하기 쉬움
- 실제 사용자는 **화면 하단**에서도 작업함
- 다양한 시나리오 테스트 필요

### 3. getBoundingClientRect 활용
- 요소의 실시간 화면 위치 계산
- viewport 기준 좌표 제공
- 동적 UI 배치에 필수적

---

## ✅ 완료 체크리스트

- [x] Canvas.tsx 로직 분석
- [x] BlockActions에 동일 로직 적용
- [x] 기본 메뉴 위치 자동 조정
- [x] AI 메뉴 위치 자동 조정
- [x] TypeScript 타입 에러 해결
- [x] Linter 검증 통과
- [x] 문서 업데이트

---

## 🚀 다음 단계

1. **E2E 테스트**
   - 화면 상단 블록 테스트
   - 화면 하단 블록 테스트
   - 스크롤 후 테스트

2. **사용자 피드백**
   - 메뉴 위치가 자연스러운지
   - 예상한 곳에 나타나는지

3. **추가 최적화**
   - 메뉴 높이를 동적으로 계산 (현재는 하드코딩 220px)
   - 애니메이션 방향 추가 (위로 열릴 때는 아래→위)

---

## 📚 관련 문서
- [UI_REFINEMENT_BLOCK_ACTIONS.md](./UI_REFINEMENT_BLOCK_ACTIONS.md)
- [AI_ASSIST_COMPLETE_INTEGRATION.md](./AI_ASSIST_COMPLETE_INTEGRATION.md)

---

**작성자**: AI Assistant  
**프로젝트**: ESG Gen v1 - AI Assist System  
**최종 업데이트**: 2025-10-20  
**상태**: ✅ 구현 완료 - E2E 테스트 대기

