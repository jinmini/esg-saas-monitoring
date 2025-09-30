'use client';

import React from 'react';
import { ExternalLink, Calendar, Clock } from 'lucide-react';
import type { Event, EventCategory } from '@/types/api';
import { EVENT_CATEGORY_COLORS } from '@/types/api';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function EventCard({ event, onClick, className = '', compact = false }: EventCardProps) {
  const colors = EVENT_CATEGORY_COLORS[event.category];

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 날짜 범위 표시
  const getDateRange = () => {
    if (!event.end_date || event.start_date === event.end_date) {
      return formatDate(event.start_date);
    }
    
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (startDate.getFullYear() === endDate.getFullYear() && 
        startDate.getMonth() === endDate.getMonth()) {
      // 같은 월인 경우
      return `${startDate.getDate()}일 - ${endDate.getDate()}일 ${endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}`;
    } else {
      // 다른 월인 경우
      return `${formatDate(event.start_date)} - ${formatDate(event.end_date)}`;
    }
  };

  // D-Day 계산
  const getDDay = () => {
    const today = new Date();
    const eventDate = new Date(event.start_date);
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const dDay = getDDay();
  const isUrgent = dDay.startsWith('D-') && parseInt(dDay.substring(2)) <= 7; // 7일 이내

  if (compact) {
    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${colors.bg} ${colors.border} ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
              <span className={`text-xs font-medium ${colors.text}`}>{event.category}</span>
              {isUrgent && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                  {dDay}
                </span>
              )}
            </div>
            <h4 className={`font-medium text-sm ${colors.text} line-clamp-2`}>
              {event.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(event.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
          {event.source_url && (
            <ExternalLink className="w-3 h-3 text-gray-400" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${colors.bg} ${colors.border} ${className}`}
      onClick={onClick}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
          <span className={`text-sm font-medium ${colors.text}`}>{event.category}</span>
        </div>
        {isUrgent && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            {dDay}
          </span>
        )}
      </div>

      {/* 제목 */}
      <h3 className={`font-semibold text-lg mb-2 ${colors.text} line-clamp-2`}>
        {event.title}
      </h3>

      {/* 설명 */}
      {event.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {event.description}
        </p>
      )}

      {/* 날짜 정보 */}
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{getDateRange()}</span>
        </div>
        {!isUrgent && (
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{dDay}</span>
          </div>
        )}
      </div>

      {/* 원문 링크 */}
      {event.source_url && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">원문 링크 있음</span>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}
