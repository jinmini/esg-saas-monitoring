'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { 
  MessageSquare, 
  Send, 
  Check, 
  MoreHorizontal,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AssistPanel from '@/components/ai-assist/AssistPanel';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  resolved: boolean;
  replies?: Comment[];
}

interface SidebarRightProps {
  // 추후 댓글 시스템 구현 시 Props 확장
}

type SidebarTab = 'comments' | 'ai-assist';

/**
 * 우측 사이드바 - 댓글/AI Assist 패널
 * - 문서 내 댓글 표시
 * - AI Assist 기능 (ESG 매핑, 내용 확장)
 * - 탭 전환 UI
 */
export const SidebarRight: React.FC<SidebarRightProps> = () => {
  const { isSidebarRightOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<SidebarTab>('ai-assist');
  const [filter, setFilter] = React.useState<'all' | 'unresolved' | 'mine'>('all');

  // Mock 댓글 데이터
  const mockComments: Comment[] = [
    {
      id: 'comment-1',
      authorId: 'user-1',
      authorName: '김철수',
      content: '이 부분은 좀 더 구체적인 수치를 넣으면 좋을 것 같습니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      resolved: false,
      replies: [
        {
          id: 'reply-1',
          authorId: 'user-2',
          authorName: '이영희',
          content: '동의합니다. 2023년 기준 데이터를 추가하겠습니다.',
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
          resolved: false,
        },
      ],
    },
    {
      id: 'comment-2',
      authorId: 'user-3',
      authorName: '박민수',
      content: '표현이 명확하지 않아요. 다시 작성 부탁드립니다.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      resolved: true,
    },
  ];

  if (!isSidebarRightOpen) return null;

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      exit={{ x: 300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sidebar-right w-80 bg-white border-l border-gray-200 flex flex-col h-full"
    >
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-200">
        <TabButton
          icon={<Sparkles size={16} />}
          label="AI Assist"
          active={activeTab === 'ai-assist'}
          onClick={() => setActiveTab('ai-assist')}
        />
        <TabButton
          icon={<MessageSquare size={16} />}
          label="댓글"
          active={activeTab === 'comments'}
          onClick={() => setActiveTab('comments')}
          badge={mockComments.length}
        />
      </div>

      {/* AI Assist 탭 */}
      {activeTab === 'ai-assist' && (
        <div className="flex-1 overflow-hidden">
          <AssistPanel onClose={() => setActiveTab('comments')} />
        </div>
      )}

      {/* 댓글 탭 */}
      {activeTab === 'comments' && (
        <>
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase flex items-center gap-2">
                <MessageSquare size={16} />
                댓글
              </h2>
              <span className="text-xs text-gray-500">
                {mockComments.length}개
              </span>
            </div>

            {/* 필터 버튼 */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label="전체"
              />
              <FilterButton
                active={filter === 'unresolved'}
                onClick={() => setFilter('unresolved')}
                label="미해결"
                count={mockComments.filter(c => !c.resolved).length}
              />
              <FilterButton
                active={filter === 'mine'}
                onClick={() => setFilter('mine')}
                label="내 댓글"
              />
            </div>
          </div>

          {/* 댓글 목록 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockComments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} />
            ))}

            {/* 빈 상태 */}
            {mockComments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <MessageSquare size={48} className="mb-2 opacity-50" />
                <p className="text-sm">아직 댓글이 없습니다</p>
                <p className="text-xs mt-1">텍스트를 선택하고 댓글을 작성해보세요</p>
              </div>
            )}
          </div>

          {/* 푸터 - 새 댓글 입력 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="새 댓글 작성... (구현 예정)"
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                disabled
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

/**
 * 탭 버튼 컴포넌트
 */
interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, active, onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
        border-b-2 transition-colors relative
        ${active
          ? 'border-indigo-600 text-indigo-600 bg-white'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
};

/**
 * 필터 버튼 컴포넌트
 */
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label, count }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors
        ${active 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
        }
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1 text-xs">({count})</span>
      )}
    </button>
  );
};

/**
 * 댓글 스레드 컴포넌트
 */
interface CommentThreadProps {
  comment: Comment;
}

const CommentThread: React.FC<CommentThreadProps> = ({ comment }) => {
  return (
    <div className={`
      comment-thread p-3 rounded-lg border
      ${comment.resolved 
        ? 'bg-green-50 border-green-200' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* 댓글 헤더 */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={10} />
              {formatTimeAgo(comment.createdAt)}
            </p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* 댓글 내용 */}
      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 text-xs">
        {comment.resolved ? (
          <span className="flex items-center gap-1 text-green-700 font-medium">
            <Check size={12} />
            해결됨
          </span>
        ) : (
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
            <Check size={12} />
            해결
          </button>
        )}
        <button className="text-gray-600 hover:text-gray-700">답글</button>
      </div>

      {/* 답글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <p className="font-medium text-gray-900">{reply.authorName}</p>
              <p className="text-gray-700 mt-0.5">{reply.content}</p>
              <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(reply.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 시간 포맷팅 함수
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

