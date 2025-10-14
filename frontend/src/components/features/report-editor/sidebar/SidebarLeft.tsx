'use client';

import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { SectionNode } from '@/types/editor/section';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Plus,
  Leaf,
  Users as UsersIcon,
  Scale,
  File,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarLeftProps {
  onSectionClick?: (sectionId: string) => void;
  onSectionAdd?: () => void;
}

/**
 * 좌측 사이드바 - 섹션 트리 네비게이션
 * - 섹션 목록 표시
 * - 섹션 선택/이동
 * - ESG 카테고리 표시
 */
export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  onSectionClick,
  onSectionAdd,
}) => {
  const { document } = useEditorStore();
  const { selectedSectionId, setSelectedSection, isSidebarLeftOpen } = useUIStore();
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  // 섹션 토글
  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // 섹션 클릭 핸들러
  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
    onSectionClick?.(sectionId);

    // 해당 섹션으로 스크롤
    const sectionElement = window.document.getElementById(`section-${sectionId}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ESG 카테고리 아이콘
  const getCategoryIcon = (category?: 'E' | 'S' | 'G' | 'General') => {
    switch (category) {
      case 'E':
        return <Leaf size={16} className="text-green-600" />;
      case 'S':
        return <UsersIcon size={16} className="text-blue-600" />;
      case 'G':
        return <Scale size={16} className="text-gray-600" />;
      default:
        return <File size={16} className="text-purple-600" />;
    }
  };

  if (!isSidebarLeftOpen) return null;

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sidebar-left w-64 bg-white border-r border-gray-200 flex flex-col h-full"
    >
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase">목차</h2>
          {onSectionAdd && (
            <button
              onClick={onSectionAdd}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="섹션 추가"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {document?.sections.length || 0}개의 섹션
        </p>
      </div>

      {/* 섹션 목록 */}
      <div className="flex-1 overflow-y-auto p-2">
        {document?.sections.map((section, index) => {
          const isSelected = selectedSectionId === section.id;
          const isCollapsed = collapsedSections.has(section.id);

          return (
            <div key={section.id} className="mb-1">
              {/* 섹션 아이템 */}
              <div
                onClick={() => handleSectionClick(section.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                {/* 확장/축소 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(section.id);
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  {isCollapsed ? (
                    <ChevronRight size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>

                {/* ESG 카테고리 아이콘 */}
                {getCategoryIcon(section.metadata?.category)}

                {/* 섹션 제목 */}
                <span className="text-sm flex-1 truncate">{section.title}</span>

                {/* 블록 개수 */}
                <span className="text-xs text-gray-400">
                  {section.blocks.length}
                </span>
              </div>

              {/* 하위 블록 목록 (축소되지 않았을 때) */}
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {section.blocks.map((block) => {
                    const getBlockLabel = (blockType: string): string => {
                      switch (blockType) {
                        case 'heading': return '제목';
                        case 'paragraph': return '본문';
                        case 'list': return '목록';
                        case 'quote': return '인용구';
                        case 'table': return '표';
                        case 'image': return '이미지';
                        case 'chart': return '차트';
                        case 'esgMetric': return 'ESG 지표';
                        default: return blockType;
                      }
                    };
                    
                    return (
                      <div
                        key={block.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <FileText size={12} />
                        <span className="truncate">{getBlockLabel(block.blockType)}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* 푸터 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>환경 (E): {document?.sections.filter(s => s.metadata?.category === 'E').length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>사회 (S): {document?.sections.filter(s => s.metadata?.category === 'S').length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span>지배구조 (G): {document?.sections.filter(s => s.metadata?.category === 'G').length || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

