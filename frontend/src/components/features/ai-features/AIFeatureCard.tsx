'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  BarChart3, 
  Network, 
  Leaf, 
  Scale, 
  MessageCircle, 
  ShieldCheck, 
  Target, 
  RefreshCw, 
  Presentation, 
  TrendingUp, 
  Globe,
  ArrowRight,
  ExternalLink,
  LucideIcon
} from 'lucide-react';
import type { AIFeature } from '@/types/ai-features';

interface AIFeatureCardProps {
  feature: AIFeature;
}

// 아이콘 매핑
const ICON_MAP: Record<string, LucideIcon> = {
  'FileText': FileText,
  'BarChart3': BarChart3,
  'Network': Network,
  'Leaf': Leaf,
  'Scale': Scale,
  'MessageCircle': MessageCircle,
  'ShieldCheck': ShieldCheck,
  'Target': Target,
  'RefreshCw': RefreshCw,
  'Presentation': Presentation,
  'TrendingUp': TrendingUp,
  'Globe': Globe,
};

/**
 * AI Feature 카드 컴포넌트 (심플한 디자인)
 * - 아이콘, 제목, 간단 설명, 하단 버튼
 * - 텍스트 최소화
 * - 상태/카테고리 표시 제거
 */
export const AIFeatureCard: React.FC<AIFeatureCardProps> = ({ feature }) => {
  const IconComponent = ICON_MAP[feature.icon] || FileText;

  // 버튼 텍스트 결정
  const getButtonText = () => {
    switch (feature.status) {
      case 'implemented': return '사용하기';
      case 'beta': return 'Beta 체험하기';
      case 'research': return '자세히 보기';
      default: return '알림 받기';
    }
  };

  // 카드 내부 컨텐츠 (버튼 제외)
  const cardContent = (
    <div className="flex flex-col gap-4 flex-1">
      {/* 아이콘 영역 - 녹색 그라데이션 효과와 유사하게 심플한 아이콘 배치 */}
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-50 text-green-600">
        <IconComponent size={24} strokeWidth={1.5} />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex flex-col gap-1 items-start">
        <div className="w-full">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {feature.title}
          </h3>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );

  // 하단 버튼
  const actionButton = (
    <div className="mt-4 pt-4 border-t border-gray-100 w-full">
      <button className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        <span>{getButtonText()}</span>
        {feature.status === 'implemented' || feature.status === 'beta' ? (
          <ArrowRight size={14} />
        ) : feature.externalLink ? (
          <ExternalLink size={14} />
        ) : null}
      </button>
    </div>
  );

  // 래퍼 클래스
  const wrapperClass = "group flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full cursor-pointer";

  // 링크 처리
  if (feature.link) {
    if (feature.externalLink) {
      return (
        <a 
          href={feature.link}
          target="_blank"
          rel="noopener noreferrer"
          className={wrapperClass}
        >
          {cardContent}
          {actionButton}
        </a>
      );
    }
    
    return (
      <Link href={feature.link} className={wrapperClass}>
        {cardContent}
        {actionButton}
      </Link>
    );
  }

  // 링크가 없는 경우
  return (
    <div className={wrapperClass}>
      {cardContent}
      {actionButton}
    </div>
  );
};
