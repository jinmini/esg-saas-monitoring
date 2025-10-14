'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useCommand } from '@/hooks/useCommand';
import { 
  Save, 
  Cloud, 
  CloudOff, 
  Clock, 
  Users, 
  History,
  Share2,
  MoreVertical,
  ChevronLeft,
  Undo2,
  Redo2,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TopBarProps {
  documentId: string;
  onBack?: () => void;
}

/**
 * 에디터 상단 바 컴포넌트
 * - 문서 제목 편집
 * - 저장 상태 표시
 * - 버전 히스토리 버튼
 * - 공유/권한 버튼
 */
export const TopBar: React.FC<TopBarProps> = ({ documentId, onBack }) => {
  const { document, updateDocument } = useEditorStore();
  const {
    saveStatus,
    lastSaved,
    isDirty,
    toggleVersionDrawer,
    togglePermissionDrawer,
  } = useUIStore();
  
  const { undo, redo, canUndo, canRedo } = useCommand();

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(document?.title || '');

  // 제목 변경 저장
  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== document?.title) {
      updateDocument({ title: titleValue });
    }
    setIsEditingTitle(false);
  };

  // 저장 상태 아이콘 및 텍스트
  const getSaveStatusInfo = () => {
    switch (saveStatus) {

      case 'edited':
        return {
          icon: <Save size={16} />,
          text: '저장 안 됨',
          color: 'text-yellow-600',
        };

      case 'saving':
        return {
          icon: <Cloud className="animate-pulse" size={16} />,
          text: '저장 중...',
          color: 'text-blue-600',
        };
      case 'saved':
        return {
          icon: <Cloud size={16} />,
          text: lastSaved
            ? `${formatTimeAgo(lastSaved)} 저장됨`
            : '저장됨',
          color: 'text-green-600',
        };
      case 'error':
        return {
          icon: <CloudOff size={16} />,
          text: '저장 실패',
          color: 'text-red-600',
        };
      case 'offline':
        return {
          icon: <CloudOff size={16} />,
          text: '오프라인',
          color: 'text-gray-500',
        };
      default:
        return {
          icon: <Clock size={16} />,
          text: '대기 중',
          color: 'text-gray-500',
        };
    }
  };

  const statusInfo = getSaveStatusInfo();

  return (
    <div className="top-bar h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* 왼쪽: 뒤로가기 + 제목 */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="뒤로가기"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {isEditingTitle ? (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') {
                setTitleValue(document?.title || '');
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="text-lg font-semibold px-2 py-1 border-2 border-blue-400 rounded focus:outline-none min-w-[300px]"
          />
        ) : (
          <h1
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded truncate"
            title="클릭하여 제목 편집"
          >
            {document?.title || '제목 없음'}
          </h1>
        )}
      </div>

      {/* 중앙: 저장 상태 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 ${statusInfo.color}`}
      >
        {statusInfo.icon}
        <span className="text-sm font-medium">{statusInfo.text}</span>
      </motion.div>

      {/* 오른쪽: 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo 버튼 */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded transition-colors ${
              canUndo
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded transition-colors ${
              canRedo
                ? 'hover:bg-gray-100 text-gray-700'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="다시 실행 (Ctrl+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>
        </div>
        
        {/* 협업자 표시 (Mock) */}
        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-lg">
          <Users size={16} className="text-gray-600" />
          <span className="text-sm text-gray-700">3명</span>
        </div>

        {/* 버전 히스토리 */}
        <button
          onClick={toggleVersionDrawer}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="버전 히스토리"
        >
          <History size={18} />
          <span className="text-sm font-medium hidden lg:inline">버전</span>
        </button>

        {/* 공유/권한 */}
        <button
          onClick={togglePermissionDrawer}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          title="공유"
        >
          <Share2 size={18} />
          <span className="text-sm">공유</span>
        </button>

        {/* 더보기 메뉴 */}
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="더보기"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
};

/**
 * 시간 포맷팅 (예: "3분 전")
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 10) return '방금';
  if (seconds < 60) return `${seconds}초 전`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

