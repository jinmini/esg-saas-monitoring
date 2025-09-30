'use client';

import React, { useState } from 'react';
import { Calendar, Filter, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { EventList } from '@/components/calendar/EventList';
import { CategoryFilter } from '@/components/calendar/CategoryFilter';
import { EventCreateModal } from '@/components/calendar/EventCreateModal';
import type { Event, EventCategory } from '@/types/api';

export default function ESGAnalysisPage() {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'dayGridWeek'>('dayGridMonth');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 카테고리 필터 변경 핸들러
  const handleCategoryChange = (category?: EventCategory) => {
    setSelectedCategory(category);
    // 카테고리 변경 시 선택된 날짜 초기화
    setSelectedDate(undefined);
    setSelectedDateEvents([]);
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string, events: Event[]) => {
    setSelectedDate(date);
    setSelectedDateEvents(events);
  };

  // 이벤트 클릭 핸들러 (외부 링크 열기)
  const handleEventClick = (event: Event) => {
    if (event.source_url) {
      window.open(event.source_url, '_blank', 'noopener,noreferrer');
    }
  };

  // 네비게이션 핸들러
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    console.log('Today button clicked, setting date to:', today.toISOString());
    setCurrentDate(today);
  };

  // 캘린더에서 날짜 변경 시
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // 뷰 변경 핸들러
  const handleViewChange = (view: 'dayGridMonth' | 'dayGridWeek') => {
    setCurrentView(view);
  };

  // 새 이벤트 생성 핸들러
  const handleNewEventClick = () => {
    setShowCreateModal(true);
  };

  // 현재 월 표시
  const formatCurrentMonth = () => {
    if (currentView === 'dayGridWeek') {
      // 주간 뷰일 때는 주차 정보도 포함
      const weekNumber = Math.ceil(currentDate.getDate() / 7);
      return `${currentDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long'
      })} ${weekNumber}주차`;
    }
    return currentDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* 상단 Notion 스타일 헤더 */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6">
            {/* 메인 헤더 */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
                    <p className="text-sm text-gray-600">ESG 관련 중요 일정 관리</p>
                  </div>
                </div>

                {/* 월 네비게이션 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleTodayClick}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    오늘
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="ml-4 text-lg font-semibold text-gray-900">
                    {formatCurrentMonth()}
                  </div>
                </div>
              </div>

              {/* 상단 우측 컨트롤 */}
              <div className="flex items-center space-x-3">
                {/* 뷰 토글 (주간/월간) */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => handleViewChange('dayGridWeek')}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                      currentView === 'dayGridWeek' 
                        ? 'bg-white text-gray-900 rounded-md shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    주간
                  </button>
                  <button 
                    onClick={() => handleViewChange('dayGridMonth')}
                    className={`px-3 py-1.5 text-sm font-medium transition-all ${
                      currentView === 'dayGridMonth' 
                        ? 'bg-white text-gray-900 rounded-md shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    월간
                  </button>
                </div>

                {/* 필터 토글 버튼 */}
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 transition-colors ${
                    selectedCategory ? 'text-green-700 border-green-300 bg-green-50' : 'text-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {selectedCategory && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {selectedCategory}
                      <X 
                        className="ml-1 w-3 h-3 cursor-pointer hover:text-green-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryChange(undefined);
                        }}
                      />
                    </span>
                  )}
                </button>

                        {/* 새 이벤트 버튼 */}
                        <button 
                          onClick={handleNewEventClick}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New
                        </button>
              </div>
            </div>

            {/* 카테고리 필터 드롭다운 */}
            {showCategoryFilter && (
              <div className="pb-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
                  <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={(category) => {
                      handleCategoryChange(category);
                      setShowCategoryFilter(false); // 선택 후 자동 닫기
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 중앙 캘린더 영역 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <EventCalendar
              selectedCategory={selectedCategory}
              onEventClick={handleEventClick}
              onDateSelect={handleDateSelect}
              onNewEventClick={(date) => {
                setSelectedDate(date);
                setShowCreateModal(true);
              }}
              className="min-h-[600px]"
              onNavigate={handleNavigate}
              navigationDate={currentDate}
              currentView={currentView}
            />
          </div>
        </div>

        {/* 하단 이벤트 상세 영역 */}
        <div 
          className="bg-white border-t border-gray-200"
          style={{ minHeight: selectedDateEvents.length > 0 ? 'auto' : '200px' }}
        >
          <div className="px-6 py-6">
            <EventList
              events={selectedDateEvents}
              selectedDate={selectedDate}
              onEventClick={handleEventClick}
              title={selectedDate ? `${selectedDate} 일정` : 'ESG 일정을 선택해주세요'}
            />
                  </div>
                </div>
              </div>

              {/* 이벤트 생성 모달 */}
              <EventCreateModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                defaultDate={selectedDate}
              />
            </DashboardLayout>
          );
        }