'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCommand } from '@/hooks/useCommand';
import { DocumentNode } from '@/types/editor/document';
import { BlockType, BlockNode, createEmptyBlock } from '@/types/editor/block';
import { InlineNode } from '@/types/editor/inline';
import { BlockTypeMenu } from '@/components/features/report-editor/toolbar/BlockTypeMenu';
import { AddBlockButton } from '@/components/features/report-editor/toolbar/AddBlockButton';
import { Block } from '@/components/features/report-editor/canvas/Block';
import { 
  UpdateBlockContentCommand,
  InsertBlockCommand,
  DeleteBlockCommand,
  MoveBlockCommand,
} from '@/commands';
import { Bold, Italic, Underline, Link, Highlighter, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CanvasProps {
  documentId: string;
  initialContent: DocumentNode;
  readOnly?: boolean;
  onContentChange?: (content: DocumentNode) => void;
}

/**
 * 에디터 캔버스 컴포넌트
 * 
 * 기능:
 * - 문서 렌더링 (섹션 → 블록 → 인라인)
 * - contentEditable 기반 텍스트 편집
 * - 플로팅 툴바를 통한 포맷팅
 * - Zustand로 상태 관리
 */
export const Canvas: React.FC<CanvasProps> = ({
  documentId,
  initialContent,
  readOnly = false,
  onContentChange,
}) => {
  const {
    document,
    setDocument,
    focusedBlockId,
    setFocusedBlock,
    isEditing,
    setEditing,
  } = useEditorStore();
  
  const { execute, undo, redo, canUndo, canRedo } = useCommand();

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [showBlockTypeMenu, setShowBlockTypeMenu] = useState(false);
  const [blockTypeMenuPosition, setBlockTypeMenuPosition] = useState({ top: 0, left: 0 });
  const [targetBlockPosition, setTargetBlockPosition] = useState<{
    sectionId: string;
    position: number;
  } | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [slashCommandBlock, setSlashCommandBlock] = useState<{
    blockId: string;
    sectionId: string;
  } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // 초기 문서 로드
  useEffect(() => {
    setDocument(initialContent);
  }, [initialContent, setDocument]);

  // 문서 변경 콜백
  useEffect(() => {
    if (document && onContentChange) {
      onContentChange(document);
    }
  }, [document, onContentChange]);

  // 블록 포커스 처리
  const handleBlockFocus = useCallback(
    (blockId: string, sectionId: string) => {
      if (readOnly) return;
      setFocusedBlock(blockId);
      setCurrentSectionId(sectionId);
      setEditing(true);
    },
    [readOnly, setFocusedBlock, setEditing]
  );

  // 블록 블러 처리
  const handleBlockBlur = useCallback((blockId: string, sectionId: string) => {
    setShowToolbar(false);
  }, []);

  // 텍스트 선택 처리 (툴바 표시)
  const handleTextSelection = useCallback(() => {
    if (readOnly) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().length === 0) {
      setShowToolbar(false);
      return;
    }

    // 선택 영역의 위치 계산
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setToolbarPosition({
      top: rect.top - 50 + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
    setShowToolbar(true);
  }, [readOnly]);

  // 포맷 적용 함수
  const applyFormat = useCallback(
    (mark: 'bold' | 'italic' | 'underline' | 'highlight' | 'code') => {
      if (!focusedBlockId || !currentSectionId) return;

      // 현재 블록 찾기
      const section = document?.sections.find((s) => s.id === currentSectionId);
      const block = section?.blocks.find((b: BlockNode) => b.id === focusedBlockId);

      if (!block || !block.content) return;

      // 선택된 텍스트 범위 가져오기
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString();

      // 간단한 구현: 전체 content에 mark 적용 (실제로는 선택된 부분만 적용해야 함)
      // TODO: 실제 선택 범위에만 mark 적용하는 로직 구현 필요
      const newContent: InlineNode[] = block.content.map((inline: InlineNode) => {
        if (inline.text.includes(selectedText)) {
          const marks = inline.marks || [];
          const hasmark = marks.includes(mark);

          return {
            ...inline,
            marks: hasmark
              ? marks.filter((m: string) => m !== mark) // 토글: 이미 있으면 제거
              : [...marks, mark], // 없으면 추가
          };
        }
        return inline;
      });

      // Command Pattern으로 실행
      const command = new UpdateBlockContentCommand({
        sectionId: currentSectionId,
        blockId: focusedBlockId,
        content: newContent,
      });
      
      execute(command);
      setShowToolbar(false);
    },
    [focusedBlockId, currentSectionId, document, execute]
  );

  // 블록 타입 메뉴 열기
  const openBlockTypeMenu = useCallback((sectionId: string, position: number, event?: React.MouseEvent) => {
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setBlockTypeMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    
    setTargetBlockPosition({ sectionId, position });
    setShowBlockTypeMenu(true);
  }, []);

  // 블록 추가 (타입 선택 후)
  const handleAddBlock = useCallback((type: BlockType, level?: number) => {
    // 슬래시 커맨드로 블록 변환
    if (slashCommandBlock) {
      const section = document?.sections.find((s) => s.id === slashCommandBlock.sectionId);
      const block = section?.blocks.find((b: BlockNode) => b.id === slashCommandBlock.blockId);
      
      if (block && section) {
        const blockIndex = section.blocks.findIndex((b: BlockNode) => b.id === slashCommandBlock.blockId);
        
        // 기존 블록 삭제
        const deleteCommand = new DeleteBlockCommand({
          sectionId: slashCommandBlock.sectionId,
          blockId: slashCommandBlock.blockId,
        });
        execute(deleteCommand);
        
        // 새 타입의 블록 추가
        const newBlock = createEmptyBlock(type);
        // heading의 경우 level 설정
        if (type === 'heading' && level) {
          newBlock.attributes = { 
            ...newBlock.attributes, 
            level: level as 1 | 2 | 3 | 4 | 5 | 6 
          };
        }
        
        const insertCommand = new InsertBlockCommand({
          sectionId: slashCommandBlock.sectionId,
          position: blockIndex,
          block: newBlock,
        });
        execute(insertCommand);
      }
      
      setSlashCommandBlock(null);
      setShowBlockTypeMenu(false);
      return;
    }
    
    // 일반 블록 추가
    if (!targetBlockPosition) return;

    const newBlock = createEmptyBlock(type);
    // heading의 경우 level 설정
    if (type === 'heading' && level) {
      newBlock.attributes = { 
        ...newBlock.attributes, 
        level: level as 1 | 2 | 3 | 4 | 5 | 6 
      };
    }

    const command = new InsertBlockCommand({
      sectionId: targetBlockPosition.sectionId,
      position: targetBlockPosition.position,
      block: newBlock,
    });

    execute(command);
    setShowBlockTypeMenu(false);
    setTargetBlockPosition(null);
  }, [targetBlockPosition, slashCommandBlock, document, execute]);

  // 블록 콘텐츠 업데이트
  const handleUpdateContent = useCallback(
    (blockId: string, newContent: InlineNode[]) => {
      if (!currentSectionId) return;

      const command = new UpdateBlockContentCommand({
        sectionId: currentSectionId,
        blockId,
        content: newContent,
      });

      execute(command);
    },
    [currentSectionId, execute]
  );

  // 블록 삭제
  const handleDeleteBlock = useCallback((blockId: string, sectionId: string) => {
    const command = new DeleteBlockCommand({
      sectionId,
      blockId,
    });
    execute(command);
  }, [execute]);

  // 블록 복제
  const handleDuplicateBlock = useCallback((blockId: string, sectionId: string) => {
    const section = document?.sections.find((s) => s.id === sectionId);
    const block = section?.blocks.find((b: BlockNode) => b.id === blockId);
    if (!block || !section) return;

    const blockIndex = section.blocks.findIndex((b: BlockNode) => b.id === blockId);
    const duplicatedBlock: BlockNode = {
      ...block,
      id: `block-${Date.now()}`,
    };

    const command = new InsertBlockCommand({
      sectionId,
      position: blockIndex + 1,
      block: duplicatedBlock,
    });

    execute(command);
  }, [document, execute]);

  // 블록 이동 (위/아래)
  const handleMoveBlock = useCallback((blockId: string, sectionId: string, direction: 'up' | 'down') => {
    const section = document?.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const blockIndex = section.blocks.findIndex((b: BlockNode) => b.id === blockId);
    if (blockIndex === -1) return;

    const newPosition = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newPosition < 0 || newPosition >= section.blocks.length) return;

    const command = new MoveBlockCommand({
      sourceSectionId: sectionId,
      targetSectionId: sectionId,
      blockId,
      fromPosition: blockIndex,
      toPosition: newPosition,
    });

    execute(command);
  }, [document, execute]);

  // 슬래시 커맨드 감지
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, blockId: string, sectionId: string) => {
      if (e.key === '/' && !showBlockTypeMenu) {
        const target = e.currentTarget as HTMLElement;
        const text = target.textContent || '';
        
        // 빈 블록이거나 맨 앞에서 / 입력 시
        if (text.length === 0 || text === '/') {
          e.preventDefault();
          
          // 커서 위치 기준으로 메뉴 표시
          const rect = target.getBoundingClientRect();
          setBlockTypeMenuPosition({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
          });
          
          setSlashCommandBlock({ blockId, sectionId });
          setShowBlockTypeMenu(true);
        }
      }
    },
    [showBlockTypeMenu]
  );

  // 키보드 단축키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blockId: string, sectionId: string) => {
      // Cmd/Ctrl + B: Bold
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
      }
      // Cmd/Ctrl + I: Italic
      else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      }
      // Cmd/Ctrl + U: Underline
      else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        applyFormat('underline');
      }
      // Cmd/Ctrl + Z: Undo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }
      // Cmd/Ctrl + Shift + Z: Redo
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
      // ESC: 슬래시 커맨드 취소
      else if (e.key === 'Escape' && showBlockTypeMenu && slashCommandBlock) {
        e.preventDefault();
        setShowBlockTypeMenu(false);
        setSlashCommandBlock(null);
      }
    },
    [applyFormat, undo, redo, canUndo, canRedo, showBlockTypeMenu, slashCommandBlock]
  );

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

      if (!over || active.id === over.id) return;

      // 블록 ID는 "sectionId-blockId" 형식
      const activeId = String(active.id);
      const overId = String(over.id);

      // sectionId 추출 (첫 번째 '-' 이전)
      const activeSectionId = activeId.split('-')[0];
      const overSectionId = overId.split('-')[0];

      // 같은 섹션 내에서만 이동 허용
      if (activeSectionId !== overSectionId) return;

      const section = document?.sections.find((s) => s.id === activeSectionId);
      if (!section) return;

      // 블록 인덱스 찾기
      const oldIndex = section.blocks.findIndex((b: BlockNode) => 
        `${activeSectionId}-${b.id}` === activeId
      );
      const newIndex = section.blocks.findIndex((b: BlockNode) => 
        `${overSectionId}-${b.id}` === overId
      );

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // MoveBlockCommand 실행
      const blockId = activeId.split('-').slice(1).join('-'); // "sectionId-" 제거
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

  // 블록 렌더링 (SortableBlock으로 감싸서 드래그 가능하게)
  const renderBlock = (block: BlockNode, sectionId: string, blockIndex: number, totalBlocks: number) => {
    const isFocused = focusedBlockId === block.id;
    const isHovered = hoveredBlockId === block.id;
    
    // Drag & Drop을 위한 고유 ID (섹션 포함)
    const sortableId = `${sectionId}-${block.id}`;

    return (
      <Block
        key={block.id}
        sortableId={sortableId}
        block={block}
        sectionId={sectionId}
        blockIndex={blockIndex}
        totalBlocks={totalBlocks}
        isFocused={isFocused}
        isHovered={isHovered}
        isReadOnly={readOnly}
        onFocus={() => handleBlockFocus(block.id, sectionId)}
        onBlur={() => handleBlockBlur(block.id, sectionId)}
        onMouseUp={handleTextSelection}
        onKeyPress={(e) => handleKeyPress(e, block.id, sectionId)}
        onKeyDown={(e) => handleKeyDown(e, block.id, sectionId)}
        onMouseEnter={() => setHoveredBlockId(block.id)}
        onMouseLeave={() => setHoveredBlockId(null)}
        onUpdateContent={handleUpdateContent}
        onAddBelow={() => openBlockTypeMenu(sectionId, blockIndex + 1)}
        onDelete={() => handleDeleteBlock(block.id, sectionId)}
        onDuplicate={() => handleDuplicateBlock(block.id, sectionId)}
        onMoveUp={() => handleMoveBlock(block.id, sectionId, 'up')}
        onMoveDown={() => handleMoveBlock(block.id, sectionId, 'down')}
      />
    );
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">문서를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="editor-canvas-wrapper relative w-full h-full bg-gray-100">
        {/* 플로팅 툴바 */}
        <AnimatePresence>
          {showToolbar && !readOnly && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 bg-white shadow-lg rounded-lg border border-gray-200 px-2 py-1 flex gap-1"
              style={{
                top: toolbarPosition.top,
                left: toolbarPosition.left,
                transform: 'translateX(-50%)',
              }}
            >
              <ToolbarButton
                icon={<Bold size={16} />}
                onClick={() => applyFormat('bold')}
                title="굵게 (Ctrl+B)"
              />
              <ToolbarButton
                icon={<Italic size={16} />}
                onClick={() => applyFormat('italic')}
                title="기울임 (Ctrl+I)"
              />
              <ToolbarButton
                icon={<Underline size={16} />}
                onClick={() => applyFormat('underline')}
                title="밑줄 (Ctrl+U)"
              />
              <ToolbarButton
                icon={<Highlighter size={16} />}
                onClick={() => applyFormat('highlight')}
                title="형광펜"
              />
              <ToolbarButton
                icon={<Code size={16} />}
                onClick={() => applyFormat('code')}
                title="코드"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 에디터 캔버스 */}
        <div
          ref={editorRef}
          className="editor-canvas max-w-4xl mx-auto bg-white shadow-xl min-h-screen p-12"
        >
          {/* 문서 제목 */}
          <h1 className="text-5xl font-bold mb-2 text-gray-900 border-b-4 border-gray-200 pb-4">
            {document.title}
          </h1>

          {/* 문서 메타데이터 */}
          <div className="text-sm text-gray-500 mb-8 flex gap-4">
            <span>버전: {document.metadata.version}</span>
            <span>상태: {document.metadata.status}</span>
            <span>
              최종 수정: {new Date(document.metadata.updatedAt).toLocaleString('ko-KR')}
            </span>
          </div>

          {/* 섹션 렌더링 */}
          {document.sections.map((section) => {
            // SortableContext를 위한 블록 ID 배열
            const blockIds = section.blocks.map((block: BlockNode) => `${section.id}-${block.id}`);
            
            return (
              <section 
                key={section.id} 
                id={`section-${section.id}`}
                className="section-wrapper mb-12 scroll-mt-8"
              >
                {/* 섹션 헤더 */}
                <div className="section-header mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600 text-sm">{section.description}</p>
                  )}
                  {section.metadata?.category && (
                    <span
                      className={`
                        inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          section.metadata.category === 'E'
                            ? 'bg-green-100 text-green-800'
                            : section.metadata.category === 'S'
                            ? 'bg-blue-100 text-blue-800'
                            : section.metadata.category === 'G'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-purple-100 text-purple-800'
                        }
                      `}
                    >
                      {section.metadata.category === 'E'
                        ? '🌱 Environmental'
                        : section.metadata.category === 'S'
                        ? '👥 Social'
                        : section.metadata.category === 'G'
                        ? '⚖️ Governance'
                        : '📄 General'}
                    </span>
                  )}
                </div>

                {/* 블록 렌더링 (SortableContext로 감싸기) */}
                <SortableContext
                  items={blockIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="section-content space-y-4">
                    {section.blocks.map((block: BlockNode, index: number) => 
                      renderBlock(block, section.id, index, section.blocks.length)
                    )}
                    
                    {/* 섹션 끝에 블록 추가 버튼 */}
                    {!readOnly && (
                      <AddBlockButton
                        onClick={() => openBlockTypeMenu(section.id, section.blocks.length)}
                      />
                    )}
                  </div>
                </SortableContext>
              </section>
            );
          })}

          {/* 블록 타입 메뉴 */}
          <AnimatePresence>
            {showBlockTypeMenu && (
              <BlockTypeMenu
                onSelect={handleAddBlock}
                onClose={() => {
                  setShowBlockTypeMenu(false);
                  setTargetBlockPosition(null);
                  setSlashCommandBlock(null);
                }}
                position={blockTypeMenuPosition}
              />
            )}
          </AnimatePresence>

          {/* 읽기 전용 표시 */}
          {readOnly && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
              🔒 읽기 전용 모드
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

/**
 * 툴바 버튼 컴포넌트
 */
interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, onClick, title }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 hover:bg-gray-100 rounded transition-colors"
      onMouseDown={(e) => e.preventDefault()} // contentEditable blur 방지
    >
      {icon}
    </button>
  );
};
