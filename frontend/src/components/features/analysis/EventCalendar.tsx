'use client';

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
// FullCalendar CSS는 CDN으로 로드 (Tailwind v4/Turbopack 충돌 회피)
// Head에 주입해서 이 컴포넌트가 마운트될 때만 로드되도록 처리
import Head from 'next/head';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import type { Event, EventCategory, EventListParams } from '@/types/api';

interface EventCalendarProps {
  selectedCategory?: EventCategory;
  onEventClick?: (event: Event) => void;
  onDateSelect?: (date: string, events: Event[]) => void;
  onNewEventClick?: (date: string) => void;
  className?: string;
  onNavigate?: (date: Date) => void;
  navigationDate?: Date;
  currentView?: 'dayGridMonth' | 'dayGridWeek';
}

interface FullCalendarEvent {
  id: string;
  title: string;
  date: string;
  className: string;
  extendedProps: {
    originalEvent: Event;
  };
}

export function EventCalendar({
  selectedCategory,
  onEventClick,
  onDateSelect,
  onNewEventClick,
  className = '',
  onNavigate,
  navigationDate,
  currentView = 'dayGridMonth'
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(navigationDate || new Date());
  const [isUpdatingFromParent, setIsUpdatingFromParent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // 외부에서 날짜 변경 시 캘린더 업데이트 (무한 루프 방지 + flushSync 에러 방지)
  useEffect(() => {
    if (navigationDate && calendarRef.current && navigationDate.getTime() !== currentDate.getTime()) {
      console.log('Navigation date changed:', navigationDate.toISOString(), 'Current:', currentDate.toISOString());
      setIsUpdatingFromParent(true);
      
      // 비동기적으로 실행하여 렌더링 사이클과 충돌 방지
      setTimeout(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.gotoDate(navigationDate);
          setCurrentDate(navigationDate);
          
          // 업데이트 완료 후 플래그 해제
          setTimeout(() => setIsUpdatingFromParent(false), 100);
        }
      }, 0);
    }
  }, [navigationDate, currentDate]);

  // 뷰 변경 시 캘린더 업데이트 (flushSync 에러 방지)
  useEffect(() => {
    if (calendarRef.current) {
      // 비동기적으로 실행하여 렌더링 사이클과 충돌 방지
      setTimeout(() => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi();
          calendarApi.changeView(currentView);
          
          // 뷰 변경 완료
        }
      }, 0);
    }
  }, [currentView]);

  // + 버튼 클릭 이벤트 리스너 추가
  useEffect(() => {
    const handleAddEventClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('add-event-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const dateStr = target.getAttribute('data-date');
        if (dateStr && onNewEventClick) {
          onNewEventClick(dateStr);
        }
      }
    };

    document.addEventListener('click', handleAddEventClick);
    
    return () => {
      document.removeEventListener('click', handleAddEventClick);
    };
  }, [onNewEventClick]);

  // API 쿼리 파라미터
  const queryParams: EventListParams = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    category: selectedCategory
  };

  // 월별 이벤트 데이터 조회
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['events', 'calendar', queryParams],
    queryFn: () => eventsApi.getEventsByMonth(queryParams),
    staleTime: 5 * 60 * 1000, // 5분
  });

  // FullCalendar 형식으로 이벤트 변환
  const calendarEvents: FullCalendarEvent[] = eventData?.events?.map(event => ({
    id: event.id.toString(),
    title: event.title,
    date: event.start_date,
    className: `event-${event.category}`, // CSS 클래스 적용
    extendedProps: {
      originalEvent: event
    }
  })) || [];

  // 날짜 클릭 핸들러
  const handleDateClick = (selectInfo: any) => {
    const clickedDate = selectInfo.dateStr;
    
    // 선택된 날짜 업데이트
    setSelectedDate(clickedDate);
    
    // 이전 선택 제거
    const prevSelected = document.querySelector('.date-number.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }
    
    // 새로 선택된 날짜 숫자에만 클래스 추가
    setTimeout(() => {
      const clickedElement = selectInfo.dayEl;
      if (clickedElement) {
        const dateNumber = clickedElement.querySelector('.date-number');
        if (dateNumber) {
          dateNumber.classList.add('selected');
        }
      }
    }, 10);
    
    // 해당 날짜의 이벤트들 찾기
    const dayEvents = eventData?.events?.filter(event => 
      event.start_date === clickedDate || 
      (event.end_date && event.start_date <= clickedDate && event.end_date >= clickedDate)
    ) || [];
    
    onDateSelect?.(clickedDate, dayEvents);
  };

  // 이벤트 클릭 핸들러
  const handleEventClick = (clickInfo: any) => {
    const originalEvent = clickInfo.event.extendedProps.originalEvent;
    onEventClick?.(originalEvent);
  };

  // 월 변경 핸들러 (무한 루프 방지)
  const handleDatesSet = (dateInfo: any) => {
    // 부모에서 업데이트 중이면 무시
    if (isUpdatingFromParent) {
      console.log('Skipping datesSet update - parent is updating');
      return;
    }

    const startDate = new Date(dateInfo.start);
    const endDate = new Date(dateInfo.end);
    
    // 현재 보이는 달의 중간 날짜를 계산
    const middleTime = (startDate.getTime() + endDate.getTime()) / 2;
    const newDate = new Date(middleTime);
    
    console.log('DatesSet event:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      calculated: newDate.toISOString(),
      current: currentDate.toISOString()
    });
    
    // 날짜가 실제로 변경된 경우만 업데이트 (월 기준으로 비교)
    if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(newDate);
      onNavigate?.(newDate);
    }

    // 주간 뷰 처리는 dayCellDidMount에서 처리하므로 여기서는 제거
  };

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 text-center ${className}`}>
        <p className="text-red-700">캘린더 데이터를 불러오는데 실패했습니다.</p>
        <p className="text-sm text-red-600 mt-2">잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  return (
    <div className={`calendar-container ${className}`}>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/index.global.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.19/index.global.min.css"
        />
      </Head>
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-600">캘린더 로딩 중...</span>
          </div>
        </div>
      )}
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={currentView}
        events={calendarEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        headerToolbar={false}
        height="auto"
        locale="ko"
        dayMaxEvents={false} // 이벤트 개수 제한 없음
        moreLinkText="개 더보기"
        eventDisplay="block"
        fixedWeekCount={false}
        showNonCurrentDates={true}
        weekends={true}
        dayHeaders={true}
        dayHeaderFormat={{ weekday: 'short' }}
        titleFormat={{ year: 'numeric', month: 'long' }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
        // 추가 옵션들
        nowIndicator={false}
        navLinks={false}
        selectable={false}
        selectMirror={true}
        dayPopoverFormat={{ month: 'long', day: 'numeric', year: 'numeric' }}
        // 성능 최적화
        eventClassNames={(arg) => {
          return [`event-${arg.event.extendedProps.originalEvent.category}`];
        }}
        eventContent={(eventInfo) => {
          const event = eventInfo.event.extendedProps.originalEvent;
          return (
            <div className="fc-event-content-custom">
              <div className="fc-event-title-custom" title={event.title}>
                {event.title}
              </div>
              {event.end_date && event.start_date !== event.end_date && (
                <div className="fc-event-time-custom text-xs opacity-75">
                  ~{new Date(event.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          );
        }}
        dayCellContent={(info) => {
          // 날짜 숫자만 표시 (FullCalendar 내부 렌더링 완전 제어)
          const dateNum = info.date.getDate();
          const dateStr = info.date.toISOString().split('T')[0];
          
          return {
            html: `<div class="fc-daygrid-day-top">
                     <div class="fc-daygrid-day-number">
                       <span class="date-number">${dateNum}</span>
                     </div>
                     <button 
                       class="add-event-btn" 
                       data-date="${dateStr}"
                       title="이벤트 추가"
                       style="display: none;"
                     >+</button>
                   </div>`
          };
        }}
      />
    </div>
  );
}
