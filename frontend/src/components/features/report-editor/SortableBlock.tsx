import React, { createContext, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
}

/**
 * Drag Handle Context
 * BlockActions에서 드래그 핸들 props에 접근할 수 있도록 제공
 */
interface DragHandleContextValue {
  listeners: ReturnType<typeof useSortable>['listeners'];
  attributes: ReturnType<typeof useSortable>['attributes'];
}

const DragHandleContext = createContext<DragHandleContextValue | null>(null);

export const useDragHandle = () => {
  const context = useContext(DragHandleContext);
  if (!context) {
    throw new Error('useDragHandle must be used within SortableBlock');
  }
  return context;
};

/**
 * 드래그 가능한 블록 래퍼
 * 
 * 역할:
 * - @dnd-kit/sortable의 useSortable hook 사용
 * - 드래그 중 시각적 피드백 (투명도, 그림자)
 * - DragHandleContext 제공으로 자식 컴포넌트에서 드래그 핸들 구현 가능
 */
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

