'use client';

import React, { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react'; // Grid3x3, Layers는 안 쓰여서 제거 가능하면 제거
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorldMapContainer } from '@/components/features/map';
import { useMapData } from '@/hooks/useMapData'; // [NEW] 만든 Hook import

export default function LandscapePage() {
  const [showGrid, setShowGrid] = useState(false);
  
  // [NEW] 복잡한 로직이 한 줄로 줄어듦
  const { isLoading, error } = useMapData();

  // --- 로딩 UI (기존 동일) ---
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
            <p className="text-gray-600">ESG 기업 데이터 로딩 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- 에러 UI (기존 동일) ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900">데이터 로딩 실패</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- 메인 레이아웃 (기존 동일) ---
  return (
    <DashboardLayout>
      <div className="relative w-full h-full flex flex-col">
        {/* 헤더 */}
        <header className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="text-green-600" size={28} />
                ESG SaaS 글로벌 지도
              </h1>
            </div>
            {/* 필요하다면 여기에 Grid 토글 버튼 추가 가능 */}
            {/* <button onClick={() => setShowGrid(!showGrid)}>Grid Toggle</button> */}
          </div>
        </header>

        {/* 지도 컨테이너 */}
        <div className="flex-1 relative">
          <WorldMapContainer showGrid={showGrid} />
        </div>
      </div>
    </DashboardLayout>
  );
}