'use client';

import React from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import { EventCard } from './EventCard';
import type { Event } from '@/types/api';

interface EventListProps {
  events: Event[];
  selectedDate?: string;
  onEventClick?: (event: Event) => void;
  isLoading?: boolean;
  title?: string;
  className?: string;
  compact?: boolean;
}

export function EventList({ 
  events, 
  selectedDate, 
  onEventClick, 
  isLoading = false,
  title,
  className = '',
  compact = false
}: EventListProps) {
  
  // 날짜 포맷팅
  const formatSelectedDate = (dateStr?: string) => {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 카테고리별 그룹핑
  const groupedEvents = events.reduce((groups, event) => {
    const category = event.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  // 카테고리 순서 정의 (중요도 순)
  const categoryOrder = ['공시마감', '지원사업', '정책발표', '컨퍼런스'];

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {title || (selectedDate ? formatSelectedDate(selectedDate) : 'ESG 일정을 선택해주세요')}
        </h3>
        {events.length > 0 && (
          <div className="text-sm font-medium text-gray-500">
            {events.length}개 일정
          </div>
        )}
      </div>

      {/* 이벤트 목록 */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {selectedDate ? '해당 날짜에 일정이 없습니다' : '등록된 일정이 없습니다'}
          </h4>
          <p className="text-gray-600">
            {selectedDate 
              ? '다른 날짜를 선택해보세요.' 
              : 'ESG 관련 중요 일정들이 이곳에 표시됩니다.'
            }
          </p>
        </div>
      ) : compact ? (
        <div className="grid gap-3">
          {events
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
                compact
              />
            ))
          }
        </div>
      ) : (
        <div className="space-y-4">
          {events
            .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
            .map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onEventClick?.(event)}>
                {/* 카테고리 아이콘 */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  event.category === '지원사업' ? 'bg-blue-100' :
                  event.category === '공시마감' ? 'bg-red-100' :
                  event.category === '정책발표' ? 'bg-green-100' :
                  'bg-gray-100'
                }`}>
                  <CalendarDays className={`w-4 h-4 ${
                    event.category === '지원사업' ? 'text-blue-600' :
                    event.category === '공시마감' ? 'text-red-600' :
                    event.category === '정책발표' ? 'text-green-600' :
                    'text-gray-600'
                  }`} />
                </div>
                
                {/* 이벤트 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-medium text-gray-900 truncate" title={event.title}>
                      {event.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      event.category === '지원사업' ? 'bg-blue-50 text-blue-700' :
                      event.category === '공시마감' ? 'bg-red-50 text-red-700' :
                      event.category === '정책발표' ? 'bg-green-50 text-green-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.start_date).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                    {event.end_date && event.start_date !== event.end_date && (
                      <> ~ {new Date(event.end_date).toLocaleDateString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric'
                      })}</>
                    )}
                  </div>
                </div>

                {/* D-Day */}
                <div className="text-right">
                  {(() => {
                    const today = new Date();
                    const eventDate = new Date(event.start_date);
                    today.setHours(0, 0, 0, 0);
                    eventDate.setHours(0, 0, 0, 0);
                    
                    const diffTime = eventDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    const dDay = diffDays === 0 ? 'D-Day' : 
                                diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                    const isUrgent = dDay.startsWith('D-') && parseInt(dDay.substring(2)) <= 7;
                    
                    return (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {dDay}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
