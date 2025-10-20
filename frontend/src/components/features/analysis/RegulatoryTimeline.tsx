'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import type { RegulatoryEvent } from '@/types/analysis';
import Link from 'next/link';

const CATEGORY_COLORS = {
  CBAM: 'bg-red-100 text-red-700 border-red-200',
  'K-IFRS': 'bg-blue-100 text-blue-700 border-blue-200',
  'EU-CSRD': 'bg-purple-100 text-purple-700 border-purple-200',
  'K-ESG': 'bg-green-100 text-green-700 border-green-200',
  ISSB: 'bg-orange-100 text-orange-700 border-orange-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function RegulatoryTimeline() {
  const [events, setEvents] = useState<RegulatoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const response = await fetch('/data/analysis/regulatory-timeline.json');
        const data = await response.json();
        // 날짜 기준 내림차순 정렬 (최신이 위)
        const sorted = data.sort(
          (a: RegulatoryEvent, b: RegulatoryEvent) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(sorted);
      } catch (error) {
        console.error('Failed to load regulatory timeline:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTimeline();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">타임라인 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            ESG 규제 타임라인
          </h3>
        </div>
        <Link
          href="/market-insight"
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          시장 인사이트 보기
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* 타임라인 */}
      <div className="relative">
        {/* 세로선 */}
        <div className="absolute left-[31px] top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {events.map((event, idx) => {
            const date = new Date(event.date);
            const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
            const isPast = date < new Date();

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* 타임라인 포인트 */}
                <div
                  className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center text-xs font-bold ${
                    isPast
                      ? 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-white border-green-500 text-green-700'
                  }`}
                >
                  {dateStr.split('년')[0]}
                </div>

                {/* 이벤트 카드 */}
                <div className="flex-1 pb-6">
                  <div
                    className={`p-5 border rounded-lg transition-all ${
                      isPast
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-300 hover:border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded mb-2 border ${
                            CATEGORY_COLORS[event.category]
                          }`}
                        >
                          {event.category}
                        </span>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">{dateStr}</p>
                      </div>
                      {isPast && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                          시행 중
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notion Calendar 링크 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">
          📅 ESG 일정 캘린더
        </p>
        <p className="text-sm text-blue-700 mb-3">
          더 자세한 ESG 관련 일정을 Notion Calendar에서 확인하세요.
        </p>
        <a
          href="https://www.notion.so"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Notion Calendar 열기
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

