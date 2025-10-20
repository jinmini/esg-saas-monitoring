'use client';

import React from 'react';
import { 
  Plus, 
  GripVertical, 
  Copy, 
  Trash2, 
  MoreHorizontal,
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
 * - 드래그 핸들 (useDragHandle hook으로 드래그 가능)
 * - 블록 추가 (+)
 * - 위/아래 이동
 * - 복제
 * - 삭제
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
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const { listeners, attributes } = useDragHandle();
  
  // ========== Stores ==========
  const { mapESG, expandContent, setSelectedBlockId, setPersistedBlockId, status } = useAIAssistStore();
  const { document } = useEditorStore();
  const { setSaveStatus } = useUIStore();
  
  // documentId 가져오기
  const documentId = document?.id;
  
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
      await mapESG(blockContent, documentId, blockId, {
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
      setShowMoreMenu(false);
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
      await expandContent(blockContent, documentId, blockId, {
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
      setShowMoreMenu(false);
    }
  };

  return (
    <div className="block-actions absolute left-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full pr-2">
      {/* 드래그 핸들 */}
      <button
        {...listeners}
        {...attributes}
        className="p-1.5 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
        title="드래그하여 이동"
        type="button"
      >
        <GripVertical size={16} className="text-gray-400" />
      </button>

      {/* 추가 버튼 */}
      <button
        onClick={onAddBelow}
        className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
        title="아래에 블록 추가"
      >
        <Plus size={16} />
      </button>

      {/* 더보기 메뉴 */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="더보기"
        >
          <MoreHorizontal size={16} />
        </button>

        {/* 드롭다운 메뉴 */}
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMoreMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40"
            >
              {/* 위로 이동 */}
              <button
                onClick={() => {
                  onMoveUp();
                  setShowMoreMenu(false);
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
                  setShowMoreMenu(false);
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
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Copy size={14} />
                복제
              </button>

              <div className="my-1 border-t border-gray-200" />

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

              <div className="my-1 border-t border-gray-200" />

              {/* 삭제 */}
              <button
                onClick={() => {
                  if (confirm('이 블록을 삭제하시겠습니까?')) {
                    onDelete();
                    setShowMoreMenu(false);
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
      </div>
    </div>
  );
};

