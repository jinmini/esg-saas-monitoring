import React, { createContext, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
}

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
    transition: isDragging ? 'none' : transition, // ✅ dragging 중에는 transition 제거
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <DragHandleContext.Provider value={{ listeners, attributes }}>
      <div
        key={id} // ✅ React key 안정화
        ref={setNodeRef}
        style={style}
        className={`sortable-block ${isDragging ? 'dragging shadow-2xl' : ''}`}
      >
        {children}
      </div>
    </DragHandleContext.Provider>
  );
};
