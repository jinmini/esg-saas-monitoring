'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WorldMapContainer } from '@/components/features/map';
import { useMapData } from '@/hooks/useMapData';

export default function LandscapePage() {
  const [showGrid, setShowGrid] = useState(false);
  const { isLoading, error } = useMapData();

  // --- 로딩 UI ---
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto" />
            <p className="text-gray-600">ESG 기업 데이터 로딩 중...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- 에러 UI ---
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
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

  return (
    <DashboardLayout>
      {/* 
         [레이아웃 수정]
         1. 불필요한 내부 Header 제거
         2. 높이 설정: h-[calc(100vh-4rem)] 
            -> 4rem은 GlobalHeader의 높이(64px)입니다.
            -> 이렇게 해야 지도가 스크롤 없이 화면에 꽉 차게 렌더링됩니다.
      */}
      <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-slate-900">
        
        {/* 지도 컨테이너 */}
        <div className="flex-1 relative overflow-hidden">
          <WorldMapContainer showGrid={showGrid} />
        </div>

        {/* (옵션) 개발용 Grid 토글 버튼이 필요하다면 지도 위에 띄우는 방식으로 변경 */}
        {/* 
        <div className="absolute top-4 right-4 z-50">
           <button onClick={() => setShowGrid(!showGrid)} className="text-white text-xs bg-black/50 px-2 py-1 rounded">
             Debug
           </button>
        </div> 
        */}
      </div>
    </DashboardLayout>
  );
}