# 🎯 Drag & Drop 구현 문서

## 📋 개요

ESG Report Editor에 **@dnd-kit** 라이브러리를 사용한 Drag & Drop 기능을 구현했습니다.  
블록을 드래그하여 같은 섹션 내에서 순서를 변경할 수 있습니다.

---

## 🏗️ 아키텍처

### **컴포넌트 계층 구조**

```
Canvas (DndContext Provider)
├── Section 1
│   └── SortableContext (items: section1의 블록 ID 배열)
│       ├── SortableBlock (id: "section1-block1")
│       │   └── Block (프레젠터)
│       │       ├── BlockActions (드래그 핸들 포함)
│       │       └── ParagraphBlock (실제 컨텐츠)
│       └── SortableBlock (id: "section1-block2")
│           └── Block
│               └── HeadingBlock
└── Section 2
    └── SortableContext (items: section2의 블록 ID 배열)
        └── ...
```

---

## 🔑 핵심 구성 요소

### 1️⃣ **Canvas.tsx** (DndContext Provider)

#### **역할**
- 전체 Drag & Drop 컨텍스트 제공
- Drag 이벤트 처리 (`onDragEnd`)
- 섹션별 `SortableContext` 생성

#### **주요 코드**

```tsx
import { DndContext, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Drag & Drop 센서 설정
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

// Drag 종료 핸들러
const handleDragEnd = useCallback(
  (event: DragEndEvent) => {
    const { active, over } = event;
    
    // 블록 ID는 "sectionId-blockId" 형식
    const activeId = String(active.id);
    const overId = String(over.id);
    
    // 같은 섹션 내에서만 이동 허용
    const activeSectionId = activeId.split('-')[0];
    const overSectionId = overId.split('-')[0];
    
    if (activeSectionId !== overSectionId) return;
    
    // MoveBlockCommand 실행
    const command = new MoveBlockCommand({
      sourceSectionId: activeSectionId,
      targetSectionId: activeSectionId,
      blockId,
      fromPosition: oldIndex,
      toPosition: newIndex,
    });
    
    execute(command);
  },
  [document, execute]
);

// JSX
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  {document.sections.map((section) => {
    const blockIds = section.blocks.map((block) => `${section.id}-${block.id}`);
    
    return (
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        {/* 블록 렌더링 */}
      </SortableContext>
    );
  })}
</DndContext>
```

#### **주요 개념**

- **Sensors**: 드래그 입력을 감지하는 방법
  - `PointerSensor`: 마우스/터치 드래그
  - `KeyboardSensor`: 키보드로 드래그 (접근성)
  - `activationConstraint.distance: 8`: 8px 이동 후 드래그 시작 (실수 방지)

- **Block ID 형식**: `"sectionId-blockId"`
  - 예: `"intro-block-123"`, `"esg-e-block-456"`
  - 이유: 섹션 간 이동 제한 및 블록 식별

---

### 2️⃣ **SortableBlock.tsx** (드래그 래퍼)

#### **역할**
- `useSortable` hook으로 드래그 기능 제공
- 드래그 중 시각적 피드백 (투명도, 그림자)
- `DragHandleContext` 제공으로 자식 컴포넌트에서 드래그 핸들 접근 가능

#### **주요 코드**

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Context: 드래그 핸들 props 전달
const DragHandleContext = createContext<DragHandleContextValue | null>(null);

export const useDragHandle = () => {
  const context = useContext(DragHandleContext);
  if (!context) {
    throw new Error('useDragHandle must be used within SortableBlock');
  }
  return context;
};

export const SortableBlock: React.FC<SortableBlockProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DragHandleContext.Provider value={{ listeners, attributes }}>
      <div
        ref={setNodeRef}
        style={style}
        className={`sortable-block ${isDragging ? 'dragging shadow-2xl' : ''}`}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  );
};
```

#### **주요 개념**

- **`useSortable`**: @dnd-kit의 핵심 hook
  - `listeners`: 드래그 이벤트 핸들러
  - `attributes`: aria 속성 (접근성)
  - `setNodeRef`: DOM 참조 설정
  - `transform`, `transition`: 애니메이션 스타일
  - `isDragging`: 드래그 중 상태

- **Context 패턴**: 
  - `listeners`를 자식 컴포넌트로 전달
  - `BlockActions`에서 드래그 핸들에 연결

---

### 3️⃣ **Block.tsx** (프레젠터)

#### **역할**
- `SortableBlock`으로 감싸기
- `sortableId` prop 추가
- `BlockActions`와 실제 블록 컴포넌트 렌더링

#### **주요 코드**

```tsx
interface BlockProps {
  sortableId: string; // "sectionId-blockId"
  block: BlockNode;
  // ... 기타 props
}

export const Block: React.FC<BlockProps> = ({ sortableId, block, ... }) => {
  const BlockComponent = useBlockRender(block.blockType);

  return (
    <SortableBlock id={sortableId}>
      <div className="relative group">
        {/* 호버 시 액션 버튼 표시 */}
        {!isReadOnly && <BlockActions {...} />}
        
        {/* 실제 블록 컨텐츠 */}
        <BlockComponent {...} />
      </div>
    </SortableBlock>
  );
};
```

#### **주요 개념**

- **`group` 클래스**: Tailwind의 `group-hover:` 기능 사용
  - 부모에 `group` 추가
  - 자식에 `group-hover:opacity-100` 적용
  - 호버 시 액션 버튼 표시

---

### 4️⃣ **BlockActions.tsx** (드래그 핸들)

#### **역할**
- 드래그 핸들 제공 (`⋮⋮` 아이콘)
- `useDragHandle` hook으로 드래그 이벤트 연결
- 기타 블록 액션 버튼 (추가, 이동, 복제, 삭제)

#### **주요 코드**

```tsx
import { useDragHandle } from '../SortableBlock';

export const BlockActions: React.FC<BlockActionsProps> = ({ ... }) => {
  const { listeners, attributes } = useDragHandle();

  return (
    <div className="block-actions absolute left-0 top-0 ... opacity-0 group-hover:opacity-100">
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
        title="드래그하여 이동"
      >
        <GripVertical size={16} />
      </button>
      
      {/* 기타 액션 버튼 */}
      <button onClick={onAddBelow}>
        <Plus />
      </button>
      {/* ... */}
    </div>
  );
};
```

#### **주요 개념**

- **드래그 핸들 패턴**: 
  - 전체 블록이 아닌 특정 버튼만 드래그 가능
  - 이유: `contentEditable`과 충돌 방지, 명확한 UX

- **Cursor 스타일**:
  - `cursor-grab`: 드래그 가능 상태
  - `active:cursor-grabbing`: 드래그 중

---

## 🎨 UX 디자인

### **1. 드래그 시작**
- 8px 이동 후 드래그 시작 (실수 클릭 방지)
- 커서가 `grab` → `grabbing`으로 변경

### **2. 드래그 중**
- 원본 블록: 투명도 50% (`opacity: 0.5`)
- 그림자 효과 추가 (`shadow-2xl`)
- 다른 블록들이 자동으로 재배치 (애니메이션)

### **3. 드롭**
- `MoveBlockCommand` 실행으로 상태 업데이트
- Undo/Redo 지원
- 부드러운 트랜지션

### **4. 호버 피드백**
- 블록에 호버 시 드래그 핸들 표시
- `⋮⋮` 아이콘으로 드래그 가능함을 시각적으로 표시

---

## 🚀 사용 방법

### **블록 드래그하기**

1. 블록에 마우스 호버
2. 왼쪽에 나타나는 `⋮⋮` 아이콘을 클릭하고 드래그
3. 원하는 위치로 이동 후 드롭

### **키보드로 드래그하기** (접근성)

1. Tab 키로 드래그 핸들에 포커스
2. Space 또는 Enter로 드래그 시작
3. 화살표 키로 이동
4. Space 또는 Enter로 드롭

---

## 🔒 제약 사항

### **1. 같은 섹션 내에서만 이동 가능**
```typescript
// handleDragEnd에서 체크
if (activeSectionId !== overSectionId) return;
```

**이유:**
- ESG 리포트는 섹션별 구조가 중요
- 섹션 간 이동은 실수로 이어질 수 있음
- 추후 필요시 확장 가능

### **2. 읽기 전용 모드에서는 드래그 불가**
```tsx
{!isReadOnly && <BlockActions />}
```

---

## 📊 Command Pattern 통합

### **MoveBlockCommand**

드래그 앤 드롭은 `MoveBlockCommand`를 통해 실행되므로:
- ✅ Undo/Redo 지원
- ✅ 상태 변경 추적
- ✅ 일관된 상태 관리

```typescript
const command = new MoveBlockCommand({
  sourceSectionId: 'intro',
  targetSectionId: 'intro',
  blockId: 'block-123',
  fromPosition: 2,
  toPosition: 4,
});

execute(command); // 실행
undo(); // 되돌리기
redo(); // 다시 실행
```

---

## 🐛 알려진 이슈 및 해결 방법

### **1. 드래그 중 contentEditable 텍스트 선택 문제**

**해결 방법**: 드래그 핸들 패턴 사용
- 전체 블록이 아닌 `⋮⋮` 버튼만 드래그 가능
- `contentEditable` 영역과 분리

### **2. 드래그 중 포커스 손실**

**해결 방법**: `activationConstraint.distance: 8`
- 8px 이동 후 드래그 시작
- 클릭과 드래그 구분

---

## 🔮 향후 개선 사항

### **Phase 1 (현재)**: ✅ 완료
- [x] 같은 섹션 내 블록 이동
- [x] 드래그 핸들
- [x] Command Pattern 통합
- [x] 키보드 접근성

### **Phase 2 (미래)**:
- [ ] 섹션 간 블록 이동
- [ ] 여러 블록 동시 선택 및 이동
- [ ] 드래그 중 미리보기
- [ ] 터치 디바이스 최적화

---

## 📚 참고 자료

- [@dnd-kit 공식 문서](https://docs.dndkit.com/)
- [Command Pattern 구현](./IMPLEMENTATION_STATUS.md)
- [에디터 아키텍처](./ESG_EDITOR_ARCHITECTURE.md)

---

## 🎉 완료!

Drag & Drop 기능이 성공적으로 구현되었습니다!  
이제 블록을 자유롭게 드래그하여 순서를 변경할 수 있습니다. 🚀

