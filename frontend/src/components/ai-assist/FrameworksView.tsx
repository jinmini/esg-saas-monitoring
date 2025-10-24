/**
 * Frameworks View - ESG 매핑 결과 표시
 * 
 * ESG 프레임워크 매핑 결과를 카드 형태로 렌더링
 * 각 항목을 블록 메타데이터에 연결하는 기능 포함
 */

'use client';

import React, { useState } from 'react';
import { useAIAssistStore } from '@/store/aiAssistStore';
import { useEditorStore } from '@/store/editorStore';
import { 
  CheckCircle2, 
  Link2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import { ESGStandardMatch, ESG_CATEGORY_DISPLAY_MAP } from '@/types/ai-assist';

// ============================================
// FrameworksView 컴포넌트
// ============================================

export default function FrameworksView() {
  // ========== Store ==========
  const { esgMappingResult } = useAIAssistStore();
  
  // ========== Render Empty State ==========
  if (!esgMappingResult || esgMappingResult.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">
          ESG 표준 매핑 결과 없음
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          블록을 선택하고 "프레임워크 매핑" 버튼을 클릭하면 관련 ESG 표준이 여기에 표시됩니다.
        </p>
      </div>
    );
  }
  
  // ========== Render Results ==========
  return (
    <div className="flex flex-col h-full">
      {/* Summary Section */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          매핑 결과 요약
        </h3>
        
        {esgMappingResult.summary && (
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {esgMappingResult.summary}
          </p>
        )}
        
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <MetadataItem
            icon={<FileText className="h-3 w-3" />}
            label="매칭 수"
            value={`${esgMappingResult.suggestions.length}개`}
          />
          <MetadataItem
            icon={<Clock className="h-3 w-3" />}
            label="처리 시간"
            value={`${esgMappingResult.metadata.processing_time.toFixed(2)}초`}
          />
          <MetadataItem
            icon={<TrendingUp className="h-3 w-3" />}
            label="후보 수"
            value={`${esgMappingResult.metadata.candidate_count}개`}
          />
          <MetadataItem
            icon={<Sparkles className="h-3 w-3" />}
            label="모델"
            value={esgMappingResult.metadata.model_used?.split('-').pop() || 'AI'}
          />
        </div>
      </div>
      
      {/* Suggestions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {esgMappingResult.suggestions.map((suggestion, index) => (
          <FrameworkCard key={index} suggestion={suggestion} rank={index + 1} />
        ))}
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
// FrameworkCard 컴포넌트
// ============================================

interface FrameworkCardProps {
  suggestion: ESGStandardMatch;
  rank: number;
}

function FrameworkCard({ suggestion, rank }: FrameworkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  
  // ========== Store ==========
  const { selectedBlockId } = useAIAssistStore();
  const { currentSection, updateBlockMetadata } = useEditorStore();
  
  // ========== Handlers ==========
  
  const handleLinkToBlock = () => {
    if (!selectedBlockId || !currentSection) {
      console.warn('블록 또는 섹션이 선택되지 않았습니다.');
      return;
    }
    
    // 블록 메타데이터에 ESG 프레임워크 태그 추가
    updateBlockMetadata(selectedBlockId, currentSection, {
      frameworks: [
        {
          standard_id: suggestion.standard_id,
          framework: suggestion.framework,
          category: suggestion.category,
          confidence: suggestion.confidence,
          linkedAt: new Date().toISOString(),
        },
      ],
    });
    
    setIsLinked(true);
    console.log('연결됨:', suggestion.standard_id);
  };
  
  // ========== 카테고리 색상 ==========
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'E':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'S':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'G':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // ========== 신뢰도 색상 ==========
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };
  
  // ========== Render ==========
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          {/* Rank & Framework Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
              #{rank}
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 border border-gray-200">
              {suggestion.framework}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium border ${getCategoryColor(suggestion.category)}`}>
              {suggestion.category_display}
            </span>
          </div>
          
          {/* Confidence Score */}
          <div className="flex items-center gap-1">
            <span className={`text-sm font-semibold ${getConfidenceColor(suggestion.confidence)}`}>
              {(suggestion.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Standard ID & Title */}
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          {suggestion.standard_id}
        </h4>
        <p className="text-sm text-gray-700 mb-2">
          {suggestion.title}
        </p>
        
        {/* Topic - 값이 있을 때만 표시 */}
        {suggestion.topic && (
          <p className="text-xs text-gray-500 mb-3">
            <span className="font-medium">주제:</span> {suggestion.topic}
          </p>
        )}
        
        {/* Keywords */}
        {suggestion.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {suggestion.keywords.slice(0, 5).map((keyword, idx) => (
              <span
                key={idx}
                className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLinkToBlock}
            disabled={isLinked}
            className={`
              flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors
              ${isLinked
                ? 'bg-green-50 text-green-700 border border-green-200 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
            `}
          >
            {isLinked ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                연결됨
              </>
            ) : (
              <>
                <Link2 className="h-3 w-3" />
                연결하기
              </>
            )}
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                상세보기
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
          {/* Description */}
          <div>
            <h5 className="text-xs font-semibold text-gray-900 mb-1">설명</h5>
            <p className="text-xs text-gray-700 leading-relaxed">
              {suggestion.description}
            </p>
          </div>
          
          {/* Reasoning (LLM) */}
          <div>
            <h5 className="text-xs font-semibold text-gray-900 mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              AI 매칭 이유
            </h5>
            <p className="text-xs text-gray-700 leading-relaxed">
              {suggestion.reasoning}
            </p>
          </div>
          
          {/* Similarity Score - 백엔드 내부용이므로 사용자에게 표시하지 않음 */}
          {/* {suggestion.similarity_score > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">벡터 유사도</span>
              <span className="text-xs font-medium text-gray-900">
                {(suggestion.similarity_score * 100).toFixed(1)}%
              </span>
            </div>
          )} */}
          
          {/* External Link (placeholder) */}
          <a
            href={`#${suggestion.standard_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            표준 문서 보기
          </a>
        </div>
      )}
    </div>
  );
}

