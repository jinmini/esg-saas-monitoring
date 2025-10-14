'use client';

import React from 'react';
import { BlockType } from '@/types/editor/block';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Table,
  Image,
  Quote,
  LineChart,
  Leaf,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockTypeOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
  shortcut?: string;
}

const blockTypeOptions: BlockTypeOption[] = [
  {
    type: 'paragraph',
    label: '본문',
    icon: <Type size={18} />,
    description: '일반 텍스트 문단',
    shortcut: 'p',
  },
  {
    type: 'heading',
    label: '제목 1',
    icon: <Heading1 size={18} />,
    description: '큰 제목',
    shortcut: 'h1',
  },
  {
    type: 'heading',
    label: '제목 2',
    icon: <Heading2 size={18} />,
    description: '중간 제목',
    shortcut: 'h2',
  },
  {
    type: 'heading',
    label: '제목 3',
    icon: <Heading3 size={18} />,
    description: '작은 제목',
    shortcut: 'h3',
  },
  {
    type: 'list',
    label: '글머리 기호 목록',
    icon: <List size={18} />,
    description: '• 항목 목록',
    shortcut: 'ul',
  },
  {
    type: 'list',
    label: '번호 매기기 목록',
    icon: <ListOrdered size={18} />,
    description: '1. 순서 있는 목록',
    shortcut: 'ol',
  },
  {
    type: 'quote',
    label: '인용',
    icon: <Quote size={18} />,
    description: '인용구 또는 강조',
    shortcut: 'quote',
  },
  {
    type: 'table',
    label: '표',
    icon: <Table size={18} />,
    description: '데이터 표',
    shortcut: 'table',
  },
  {
    type: 'image',
    label: '이미지',
    icon: <Image size={18} />,
    description: '이미지 삽입',
    shortcut: 'img',
  },
  {
    type: 'chart',
    label: '차트',
    icon: <LineChart size={18} />,
    description: '데이터 시각화',
    shortcut: 'chart',
  },
  {
    type: 'esgMetric',
    label: 'ESG 지표',
    icon: <Leaf size={18} />,
    description: 'ESG 성과 지표',
    shortcut: 'esg',
  },
];

interface BlockTypeMenuProps {
  onSelect: (type: BlockType, level?: number) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

/**
 * 블록 타입 선택 메뉴
 * + 버튼 또는 / 슬래시 커맨드로 트리거
 */
export const BlockTypeMenu: React.FC<BlockTypeMenuProps> = ({
  onSelect,
  onClose,
  position,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 필터링된 옵션
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return blockTypeOptions;
    
    const query = searchQuery.toLowerCase();
    return blockTypeOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.description.toLowerCase().includes(query) ||
        option.shortcut?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 키보드 단축키
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          Math.min(prev + 1, filteredOptions.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          handleSelect(filteredOptions[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredOptions, onClose]);

  // 자동 포커스
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelect = (option: BlockTypeOption) => {
    // 헤딩 타입은 level 정보 추가
    if (option.type === 'heading') {
      const level = option.label.includes('1') ? 1 : 
                    option.label.includes('2') ? 2 : 3;
      onSelect(option.type, level);
    } else {
      onSelect(option.type);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-80"
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      {/* 헤더 */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="블록 타입 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 옵션 목록 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          <div className="p-2">
            {filteredOptions.map((option, index) => (
              <button
                key={`${option.type}-${option.label}`}
                onClick={() => handleSelect(option)}
                className={`
                  w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left
                  transition-colors
                  ${index === selectedIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="mt-0.5">{option.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.shortcut && (
                      <span className="text-xs text-gray-400 font-mono">
                        /{option.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>

      {/* 푸터 힌트 */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>↑↓ 이동</span>
          <span>Enter 선택</span>
          <span>Esc 닫기</span>
        </div>
      </div>
    </motion.div>
  );
};

