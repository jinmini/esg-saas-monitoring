/**
 * AI Assist Panel - 메인 컨테이너
 * 
 * 3-탭 레이아웃 (제안 / 프레임워크 / 채팅)
 * Zustand Store와 연동
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAIAssistStore } from '@/store/aiAssistStore';
import { Sparkles, FileText, MessageSquare, X, AlertCircle, Loader2 } from 'lucide-react';
import FrameworksView from './FrameworksView';
import SuggestionsView from './SuggestionsView';

// ============================================
// 타입 정의
// ============================================

type TabType = 'suggestions' | 'frameworks' | 'chat';

interface AssistPanelProps {
  /** 패널 닫기 콜백 */
  onClose?: () => void;
  
  /** 초기 탭 */
  defaultTab?: TabType;
}

// ============================================
// AssistPanel 컴포넌트
// ============================================

export default function AssistPanel({ onClose, defaultTab = 'suggestions' }: AssistPanelProps) {
  // ========== State ==========
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  
  // ========== Store ==========
  const {
    status,
    error,
    esgMappingResult,
    contentExpansionResult,
    selectedBlockId,
    clearError,
  } = useAIAssistStore();
  
  // ========== Memoized Values ==========
  
  /**
   * 성능 최적화: 프레임워크 매핑 결과 개수
   */
  const hasFrameworks = useMemo(
    () => esgMappingResult?.suggestions.length ?? 0,
    [esgMappingResult]
  );
  
  /**
   * 성능 최적화: 내용 확장 결과 존재 여부
   */
  const hasContentExpansion = useMemo(
    () => contentExpansionResult !== null,
    [contentExpansionResult]
  );
  
  // ========== Effects ==========
  
  /**
   * ESG 매핑 결과가 있으면 Frameworks 탭으로 자동 전환
   */
  useEffect(() => {
    if (esgMappingResult && status === 'success') {
      setActiveTab('frameworks');
    }
  }, [esgMappingResult, status]);
  
  /**
   * 내용 확장 결과가 있으면 Suggestions 탭으로 자동 전환
   */
  useEffect(() => {
    if (contentExpansionResult && status === 'success') {
      setActiveTab('suggestions');
    }
  }, [contentExpansionResult, status]);
  
  /**
   * 새 요청 시작 시 자동으로 에러 초기화
   */
  useEffect(() => {
    if (status === 'loading') {
      clearError();
    }
  }, [status, clearError]);
  
  // ========== Handlers ==========
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    clearError();
  };
  
  // ========== Render ==========
  
  return (
    <div className="flex h-full flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">AI Assist</h2>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="패널 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50" role="tablist">
        <TabButton
          icon={<FileText className="h-4 w-4" />}
          label="제안"
          active={activeTab === 'suggestions'}
          onClick={() => handleTabChange('suggestions')}
          badge={hasContentExpansion ? 1 : undefined}
        />
        <TabButton
          icon={<Sparkles className="h-4 w-4" />}
          label="프레임워크"
          active={activeTab === 'frameworks'}
          onClick={() => handleTabChange('frameworks')}
          badge={hasFrameworks}
        />
        <TabButton
          icon={<MessageSquare className="h-4 w-4" />}
          label="채팅"
          active={activeTab === 'chat'}
          onClick={() => handleTabChange('chat')}
          disabled
        />
      </div>
      
      {/* Loading State */}
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm text-gray-600">AI가 분석 중입니다...</p>
          <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요</p>
        </div>
      )}
      
      {/* Error State */}
      {status === 'error' && error && (
        <div className="flex flex-col items-center justify-center flex-1 p-8">
          <div className="rounded-lg bg-red-50 p-4 w-full max-w-sm">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={clearError}
                  className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium"
                >
                  다시 시도하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content */}
      {status !== 'loading' && status !== 'error' && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'suggestions' && <SuggestionsView />}
          {activeTab === 'frameworks' && <FrameworksView />}
          {activeTab === 'chat' && <ChatViewPlaceholder />}
        </div>
      )}
      
      {/* Footer - Selected Block Info */}
      {selectedBlockId && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
          <p className="text-xs text-gray-500">
            선택된 블록: <span className="font-mono">{selectedBlockId.slice(0, 8)}...</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// TabButton 컴포넌트
// ============================================

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  disabled?: boolean;
}

function TabButton({ icon, label, active, onClick, badge, disabled }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="tab"
      aria-selected={active}
      aria-label={`${label} 탭${badge ? ` (${badge}개)` : ''}`}
      className={`
        flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
        border-b-2 transition-colors relative
        ${active
          ? 'border-indigo-600 text-indigo-600 bg-white'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {icon}
      <span>{label}</span>
      
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ============================================
// ChatViewPlaceholder 컴포넌트
// ============================================

function ChatViewPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-base font-medium text-gray-900 mb-2">
        채팅 기능 준비 중
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        AI와 대화하며 보고서를 작성할 수 있는 기능이 곧 추가됩니다.
      </p>
    </div>
  );
}

