import React from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, Building2, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, truncateText, isValidUrl } from '@/lib/utils';
import type { Article } from '@/types/api';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const {
    id,
    title,
    company_name,
    source_name,
    article_url,
    published_at,
    crawled_at,
    summary,
    is_verified,
    language,
  } = article;

  const displayDate = published_at || crawled_at;

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header with company info and verification */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {company_name}
              </span>
            </div>
            {is_verified && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {source_name && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                {source_name}
              </span>
            )}
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {language === 'ko' ? '한국어' : language.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Article title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
          <Link href={`/article/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Summary */}
        {summary && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {truncateText(summary, 150)}
          </p>
        )}

        {/* Footer with date and external link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <time dateTime={displayDate}>
              {formatDate(displayDate)}
            </time>
          </div>
          
          {isValidUrl(article_url) && (
            <a
              href={article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span>원문 보기</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
