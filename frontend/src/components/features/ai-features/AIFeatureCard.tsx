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
import { cn } from '@/lib/utils';

interface AIFeatureCardProps {
  feature: AIFeature;
}

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

export const AIFeatureCard: React.FC<AIFeatureCardProps> = ({ feature }) => {
  const IconComponent = ICON_MAP[feature.icon] || FileText;

  // 버튼 텍스트 & 아이콘 결정
  const getButtonContent = () => {
    switch (feature.status) {
      case 'implemented': 
        return { text: '사용하기', icon: ArrowRight };
      case 'beta': 
        return { text: 'Beta 체험', icon: ArrowRight };
      default: 
        return { text: '자세히 보기', icon: feature.externalLink ? ExternalLink : ArrowRight };
    }
  };

  const { text: btnText, icon: BtnIcon } = getButtonContent();

  // 카드 내부 컨텐츠
  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Header: Icon & Title */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
          "bg-green-50 text-green-600 group-hover:bg-green-100"
        )}>
          <IconComponent size={20} strokeWidth={2} />
        </div>
        
        {/* Status Badge (Optional) */}
        {feature.status === 'beta' && (
          <span className="px-2 py-0.5 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-full border border-purple-100 uppercase tracking-wide">
            Beta
          </span>
        )}
      </div>

      {/* Body: Text */}
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {feature.description}
        </p>
      </div>

      {/* Footer: Action Button (Fake Button look) */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm font-medium text-gray-600 group-hover:text-green-700 transition-colors">
          <span>{btnText}</span>
          <BtnIcon size={16} className="ml-1.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );

  // 래퍼 클래스
  const wrapperClass = "group block p-5 bg-white border border-gray-200 rounded-xl hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 h-full cursor-pointer relative overflow-hidden";

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
        </a>
      );
    }
    
    return (
      <Link href={feature.link} className={wrapperClass}>
        {cardContent}
      </Link>
    );
  }

  // 링크가 없는 경우 (준비 중 등)
  return (
    <div className={cn(wrapperClass, "cursor-default hover:shadow-none hover:border-gray-200")}>
      {cardContent}
    </div>
  );
};