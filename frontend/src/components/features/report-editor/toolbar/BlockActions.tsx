'use client';

import React from 'react';
import { 
  GripVertical, 
  Copy, 
  Trash2, 
  ChevronUp,
  ChevronDown,
  Sparkles,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDragHandle } from '../SortableBlock';
import { useAIAssistStore } from '@/store/aiAssistStore';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { isValidTextForAI } from '@/utils/blockUtils';
import { toast } from 'sonner';

interface BlockActionsProps {
  blockId: string;
  sectionId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddBelow: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  blockContent?: string; // AI Assist 용
}

/**
 * 블록 액션 버튼들
 * 블록에 호버할 때 왼쪽에 표시되는 액션 메뉴
 * 
 * 기능:
 * - 드래그 핸들 (짧은 클릭: 기본 메뉴 / 길게 누르기: 드래그)
 * - AI 버튼 (Sparkles): 프레임워크 매핑, 내용 확장
 * 
 * 변경사항 (2025-10-20):
 * - Plus 버튼 제거 (/ 키보드 입력으로 대체)
 * - MoreHorizontal(3점) 제거 (드래그 핸들에 통합)
 * - 아이콘 개수: 3개 → 2개 (시각적 노이즈 감소)
 */
export const BlockActions: React.FC<BlockActionsProps> = ({
  blockId,
  sectionId,
  canMoveUp,
  canMoveDown,
  onAddBelow,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  blockContent,
}) => {
  const [showBasicMenu, setShowBasicMenu] = React.useState(false);
  const [showAIMenu, setShowAIMenu] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<'top' | 'bottom'>('bottom');
  const dragTimeoutRef = React.useRef<number | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const aiButtonRef = React.useRef<HTMLButtonElement>(null);  // AI 버튼용 ref
  const { listeners, attributes } = useDragHandle();
  
  // ========== Stores ==========
  const { mapESG, expandContent, setSelectedBlockId, setPersistedBlockId, status } = useAIAssistStore();
  const { document } = useEditorStore();
  const { setSaveStatus } = useUIStore();
  
  // documentId 가져오기 (string -> number 변환)
  const documentId = document?.id ? parseInt(document.id, 10) : undefined;
  
  // ========== 메뉴 위치 계산 ==========
  
  const calculateMenuPosition = React.useCallback(() => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // 메뉴 예상 높이 (기본 메뉴: ~200px, AI 메뉴: ~100px)
    const menuHeight = 220;
    
    // 버튼 아래에 메뉴를 표시할 공간이 충분한지 확인
    const spaceBelow = viewportHeight - rect.bottom;
    const shouldShowBelow = spaceBelow >= menuHeight;
    
    // 디버깅 로그
    console.log('🔍 Menu Position Debug:', {
      buttonBottom: rect.bottom,
      viewportHeight,
      spaceBelow,
      menuHeight,
      shouldShowBelow,
      finalPosition: shouldShowBelow ? 'bottom' : 'top'
    });
    
    setMenuPosition(shouldShowBelow ? 'bottom' : 'top');
  }, []);
  
  // ========== 드래그 핸들 (짧은 클릭 vs 길게 누르기) ==========
  
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
      calculateMenuPosition(); // 메뉴 위치 계산
      setShowBasicMenu(!showBasicMenu);
      setShowAIMenu(false); // AI 메뉴는 닫기
    }
    
    setIsDragging(false);
  };
  
  const handleDragHandleMouseLeave = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
  };
  
  // ========== AI Assist Handlers ==========
  
  const handleESGMapping = async () => {
    // 동시 호출 차단
    if (status === 'loading') {
      toast.warning('이미 AI 작업이 진행 중입니다', {
        description: '현재 작업이 완료될 때까지 기다려주세요.',
      });
      return;
    }
    
    if (!blockContent || !isValidTextForAI(blockContent)) {
      toast.error('블록 내용이 비어있거나 너무 짧습니다', {
        description: '최소 10자 이상의 텍스트가 필요합니다.',
      });
      return;
    }
    
    if (!documentId) {
      toast.error('문서 ID를 찾을 수 없습니다', {
        description: '문서를 다시 불러와주세요.',
      });
      return;
    }
    
    // 로딩 토스트 (ID 저장)
    const toastId = toast.loading('ESG 프레임워크 매핑 중...', {
      description: 'AI가 관련 ESG 표준을 찾고 있습니다.',
    });
    
    try {
      // 블록 선택 및 유지
      setSelectedBlockId(blockId);
      setPersistedBlockId(blockId);
      
      // ESG 매핑 요청
      await mapESG(blockContent, documentId!, blockId, {
        frameworks: ['GRI', 'SASB', 'TCFD', 'ESRS'],
        maxResults: 5,
        minConfidence: 0.5,
      });
      
      // 같은 ID로 성공 토스트 갱신 (UX 일관성)
      toast.success('ESG 매핑 완료!', {
        id: toastId,
        description: '우측 사이드바에서 결과를 확인하세요.',
      });
      
      console.log('✅ ESG 매핑 완료:', blockId);
    } catch (error) {
      // 같은 ID로 에러 토스트 갱신
      toast.error('ESG 매핑 실패', {
        id: toastId,
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      });
      console.error('❌ ESG 매핑 실패:', error);
    } finally {
      setShowAIMenu(false);
    }
  };
  
  const handleContentExpansion = async () => {
    // 동시 호출 차단
    if (status === 'loading') {
      toast.warning('이미 AI 작업이 진행 중입니다', {
        description: '현재 작업이 완료될 때까지 기다려주세요.',
      });
      return;
    }
    
    if (!blockContent || !isValidTextForAI(blockContent)) {
      toast.error('블록 내용이 비어있거나 너무 짧습니다', {
        description: '최소 10자 이상의 텍스트가 필요합니다.',
      });
      return;
    }
    
    if (!documentId) {
      toast.error('문서 ID를 찾을 수 없습니다', {
        description: '문서를 다시 불러와주세요.',
      });
      return;
    }
    
    // 로딩 토스트 (ID 저장)
    const toastId = toast.loading('내용 확장 중...', {
      description: 'AI가 전문적인 텍스트를 생성하고 있습니다.',
    });
    
    try {
      // 블록 선택 및 유지
      setSelectedBlockId(blockId);
      setPersistedBlockId(blockId);
      
      // 내용 확장 요청
      await expandContent(blockContent, documentId!, blockId, {
        mode: 'expand',
        tone: 'professional',
      });
      
      // 같은 ID로 성공 토스트 갱신 (UX 일관성)
      toast.success('내용 확장 완료!', {
        id: toastId,
        description: '우측 사이드바에서 결과를 확인하세요.',
      });
      
      console.log('✅ 내용 확장 완료:', blockId);
    } catch (error) {
      // 같은 ID로 에러 토스트 갱신
      toast.error('내용 확장 실패', {
        id: toastId,
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      });
      console.error('❌ 내용 확장 실패:', error);
    } finally {
      setShowAIMenu(false);
    }
  };

  return (
    <>
      <div className="block-actions absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full pr-2">
        {/* 드래그 핸들 (짧은 클릭: 기본 메뉴 / 길게 누르기: 드래그) */}
        <button
          ref={buttonRef}
          {...listeners}
          {...attributes}
          onMouseDown={handleDragHandleMouseDown}
          onMouseUp={handleDragHandleMouseUp}
          onMouseLeave={handleDragHandleMouseLeave}
          className="p-1.5 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
          title="클릭: 메뉴 / 길게 누르기: 드래그"
          type="button"
        >
          <GripVertical size={16} className="text-gray-400" />
        </button>

        {/* AI 전용 버튼 (Sparkles) */}
        <button
          ref={aiButtonRef}
          onClick={() => {
            calculateMenuPosition(); // 메뉴 위치 계산
            setShowAIMenu(!showAIMenu);
            setShowBasicMenu(false); // 기본 메뉴는 닫기
          }}
          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors relative z-10"
          title="AI 기능"
          type="button"
        >
          <Sparkles size={16} className="text-indigo-500" />
        </button>
      </div>

      {/* 기본 메뉴 드롭다운 (fixed 위치로!) */}
      {showBasicMenu && buttonRef.current && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowBasicMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'fixed',
                left: `${buttonRef.current.getBoundingClientRect().left}px`,
                top: menuPosition === 'bottom' 
                  ? `${buttonRef.current.getBoundingClientRect().bottom + 4}px`
                  : 'auto',
                bottom: menuPosition === 'top'
                  ? `${window.innerHeight - buttonRef.current.getBoundingClientRect().top + 4}px`
                  : 'auto',
              }}
              className="z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40"
            >
              {/* 위로 이동 */}
              <button
                onClick={() => {
                  onMoveUp();
                  setShowBasicMenu(false);
                }}
                disabled={!canMoveUp}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp size={14} />
                위로 이동
              </button>

              {/* 아래로 이동 */}
              <button
                onClick={() => {
                  onMoveDown();
                  setShowBasicMenu(false);
                }}
                disabled={!canMoveDown}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown size={14} />
                아래로 이동
              </button>

              <div className="my-1 border-t border-gray-200" />

              {/* 복제 */}
              <button
                onClick={() => {
                  onDuplicate();
                  setShowBasicMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Copy size={14} />
                복제
              </button>

              <div className="my-1 border-t border-gray-200" />

              {/* 삭제 */}
              <button
                onClick={() => {
                  if (confirm('이 블록을 삭제하시겠습니까?')) {
                    onDelete();
                    setShowBasicMenu(false);
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                삭제
              </button>
            </motion.div>
          </>
        )}

      {/* AI 메뉴 드롭다운 (fixed 위치로!) */}
      {showAIMenu && aiButtonRef.current && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowAIMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'fixed',
                left: `${aiButtonRef.current.getBoundingClientRect().left}px`,
                top: menuPosition === 'bottom' 
                  ? `${aiButtonRef.current.getBoundingClientRect().bottom + 4}px`
                  : 'auto',
                bottom: menuPosition === 'top'
                  ? `${window.innerHeight - aiButtonRef.current.getBoundingClientRect().top + 4}px`
                  : 'auto',
              }}
              className="z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-44"
            >
              {/* AI Assist: 프레임워크 매핑 */}
              <button
                onClick={handleESGMapping}
                disabled={status === 'loading' || !blockContent || !isValidTextForAI(blockContent) || !documentId}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  status === 'loading'
                    ? 'AI 작업이 진행 중입니다'
                    : !blockContent 
                    ? '블록 내용이 비어있습니다' 
                    : !isValidTextForAI(blockContent)
                    ? '최소 10자 이상 필요합니다'
                    : !documentId
                    ? '문서 ID를 찾을 수 없습니다'
                    : 'ESG 표준과 매핑합니다'
                }
              >
                <Sparkles size={14} />
                프레임워크 매핑
              </button>

              {/* AI Assist: 내용 확장 */}
              <button
                onClick={handleContentExpansion}
                disabled={status === 'loading' || !blockContent || !isValidTextForAI(blockContent) || !documentId}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  status === 'loading'
                    ? 'AI 작업이 진행 중입니다'
                    : !blockContent 
                    ? '블록 내용이 비어있습니다' 
                    : !isValidTextForAI(blockContent)
                    ? '최소 10자 이상 필요합니다'
                    : !documentId
                    ? '문서 ID를 찾을 수 없습니다'
                    : '내용을 확장합니다'
                }
              >
                <FileText size={14} />
                내용 확장하기
              </button>
            </motion.div>
          </>
        )}
    </>
  );
};

