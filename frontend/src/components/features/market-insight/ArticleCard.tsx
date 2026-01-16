import React, { useState } from 'react';
import { ExternalLink, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatDate, isValidUrl } from '@/lib/utils';
import type { Article } from '@/types/api';

// 기업별 배경색 매핑 (랜덤 대신 고정된 색상을 주어 일관성 유지)
const getCompanyColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
  ];
  // 이름 길이로 해시 비스무리하게 인덱스 선택
  const index = name.length % colors.length;
  return colors[index];
};

export function ArticleCard({ article }: { article: Article }) {
  const {
    title,
    company_name,
    article_url,
    published_at,
    crawled_at,
    summary,
    image_url,
  } = article;

  const [imageError, setImageError] = useState(false);
  const displayDate = published_at || crawled_at;
  const hasLink = isValidUrl(article_url);
  const colorClass = getCompanyColor(company_name);
  const hasImage = image_url && isValidUrl(image_url) && !imageError;

  return (
    <Card className="group relative flex flex-col h-full bg-white border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      
      {/* 1. Thumbnail Area (이미지 또는 기업 로고 대체) */}
      <div className={`h-32 w-full relative overflow-hidden border-b border-gray-100 ${!hasImage ? colorClass : ''}`}>
        {hasImage ? (
          <img
            src={image_url!}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <Building2 className="w-8 h-8 mb-2 opacity-50" />
            <span className="font-bold text-lg tracking-tight">
              {company_name}
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Date (Green Color - 참고한 디자인 반영) */}
        <div className="text-xs font-semibold text-[#3f621a] mb-2">
          {formatDate(displayDate)}
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-bold text-gray-900 leading-snug line-clamp-2 mb-3 min-h-[44px]">
          {hasLink ? (
            <a 
              href={article_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline decoration-blue-500 before:absolute before:inset-0"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {summary}
          </p>
        )}

        {/* Footer (기업명 + Read More) */}
        <div className="pt-3 mt-auto border-t border-gray-50 flex items-center justify-between">
          {/* 기업명 (왼쪽) */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>{company_name}</span>
          </div>

          <div className="flex items-center text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
            Read more <ExternalLink className="ml-1 w-3 h-3" />
          </div>
        </div>
      </div>
    </Card>
  );
}