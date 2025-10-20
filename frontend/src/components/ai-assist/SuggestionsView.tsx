/**
 * Suggestions View - 내용 확장 결과 표시
 * 
 * 원본 vs 제안 텍스트 Diff 뷰
 * 적용하기 버튼으로 블록 내용 업데이트
 */

'use client';

import React, { useState } from 'react';
import { useAIAssistStore } from '@/store/aiAssistStore';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { 
  FileText, 
  Check, 
  X, 
  Copy,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp
} from 'lucide-react';
import { ContentExpansionResponse } from '@/types/ai-assist';

// ============================================
// SuggestionsView 컴포넌트
// ============================================

export default function SuggestionsView() {
  // ========== Store ==========
  const { contentExpansionResult, clearResult, selectedBlockId } = useAIAssistStore();
  const { setSaveStatus } = useUIStore();
  const { currentSection, updateBlockTextContent } = useEditorStore();
  
  // ========== State ==========
  const [isApplied, setIsApplied] = useState(false);
  
  // ========== Handlers ==========
  
  const handleApply = () => {
    if (!contentExpansionResult || !selectedBlockId || !currentSection) {
      console.warn('블록 또는 섹션이 선택되지 않았습니다.');
      return;
    }
    
    // 블록 텍스트 내용 업데이트
    updateBlockTextContent(selectedBlockId, currentSection, contentExpansionResult.suggestion);
    
    setIsApplied(true);
    
    // Autosave 트리거
    setSaveStatus('edited');
    
    console.log('적용됨:', contentExpansionResult.suggestion);
  };
  
  const handleCopy = async () => {
    if (!contentExpansionResult) return;
    
    try {
      await navigator.clipboard.writeText(contentExpansionResult.suggestion);
      // TODO: 토스트 알림
      console.log('복사 완료');
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };
  
  const handleReject = () => {
    clearResult();
    setIsApplied(false);
  };
  
  // ========== Render Empty State ==========
  if (!contentExpansionResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">
          내용 확장 결과 없음
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          블록을 선택하고 "내용 확장하기" 버튼을 클릭하면 AI가 생성한 제안이 여기에 표시됩니다.
        </p>
      </div>
    );
  }
  
  // ========== Render Results ==========
  return (
    <div className="flex flex-col h-full">
      {/* Header - Metadata */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          내용 확장 제안
        </h3>
        
        {contentExpansionResult.explanation && (
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {contentExpansionResult.explanation}
          </p>
        )}
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <MetadataItem
            icon={<FileText className="h-3 w-3" />}
            label="원본"
            value={`${contentExpansionResult.metadata.original_length}자`}
          />
          <MetadataItem
            icon={<TrendingUp className="h-3 w-3" />}
            label="제안"
            value={`${contentExpansionResult.metadata.suggestion_length}자`}
          />
          <MetadataItem
            icon={<ArrowRight className="h-3 w-3" />}
            label="확장 비율"
            value={`${(contentExpansionResult.metadata.expansion_ratio * 100).toFixed(0)}%`}
          />
          <MetadataItem
            icon={<Clock className="h-3 w-3" />}
            label="처리 시간"
            value={`${contentExpansionResult.metadata.processing_time.toFixed(2)}초`}
          />
        </div>
      </div>
      
      {/* Diff View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Original Text */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">원본 텍스트</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
              {contentExpansionResult.original}
            </p>
          </div>
        </div>
        
        {/* Suggested Text */}
        <div className="rounded-lg border border-indigo-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-indigo-200 bg-indigo-50 px-4 py-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">AI 제안 텍스트</span>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
              {contentExpansionResult.suggestion}
            </p>
          </div>
        </div>
        
        {/* Changes Summary */}
        {contentExpansionResult.changes.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              변경 사항 ({contentExpansionResult.changes.length})
            </h4>
            <div className="space-y-2">
              {contentExpansionResult.changes.slice(0, 5).map((change, idx) => (
                <ChangeItem key={idx} change={change} />
              ))}
              {contentExpansionResult.changes.length > 5 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{contentExpansionResult.changes.length - 5}개 변경사항 더 보기
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Actions Footer */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center gap-2">
        {!isApplied ? (
          <>
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              적용하기
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleReject}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
            <Check className="h-4 w-4" />
            적용 완료
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MetadataItem 컴포넌트
// ============================================

interface MetadataItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function MetadataItem({ icon, label, value }: MetadataItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-gray-600">
      {icon}
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ============================================
// ChangeItem 컴포넌트
// ============================================

interface ChangeItemProps {
  change: {
    type: 'addition' | 'deletion' | 'modification';
    start: number;
    end: number;
    original: string;
    suggested: string;
  };
}

function ChangeItem({ change }: ChangeItemProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'addition':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'deletion':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'modification':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'addition':
        return '추가';
      case 'deletion':
        return '삭제';
      case 'modification':
        return '수정';
      default:
        return '변경';
    }
  };
  
  return (
    <div className={`rounded-md border p-2 ${getChangeColor(change.type)}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold">
          {getChangeLabel(change.type)}
        </span>
        <span className="text-xs opacity-75">
          ({change.start}-{change.end})
        </span>
      </div>
      {change.type !== 'addition' && change.original && (
        <p className="text-xs opacity-75 line-through mb-1">
          {change.original.slice(0, 50)}
          {change.original.length > 50 && '...'}
        </p>
      )}
      {change.type !== 'deletion' && change.suggested && (
        <p className="text-xs font-medium">
          {change.suggested.slice(0, 50)}
          {change.suggested.length > 50 && '...'}
        </p>
      )}
    </div>
  );
}

