/**
 * MapBreadcrumbs
 * 지도 네비게이션 경로 표시 (World > Region > Country)
 */

'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useESGMapStore } from '@/store/esgMapStore';
import { REGION_INFO, COUNTRY_INFO } from '@/constants/esg-map';

export const MapBreadcrumbs: React.FC = () => {
  const viewMode = useESGMapStore((state) => state.mapState.viewMode);
  const focusedRegion = useESGMapStore((state) => state.mapState.focusedRegion);
  const selectedCountry = useESGMapStore((state) => state.mapState.selectedCountry);
  
  const zoomToWorld = useESGMapStore((state) => state.zoomToWorld);
  const zoomToRegion = useESGMapStore((state) => state.zoomToRegion);
  const resetFilters = useESGMapStore((state) => state.resetFilters); // 필터 초기화 추가

  // World View에서는 표시 안 함
  if (viewMode === 'world') return null;

  const handleWorldClick = () => {
    zoomToWorld();
    resetFilters(); // 모든 필터 및 검색어 초기화
  };

  const handleRegionClick = () => {
    if (focusedRegion) {
      zoomToRegion(focusedRegion);
      // 국가 선택 및 기업 선택 해제는 zoomToRegion 내부 로직에서 처리됨
    }
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
      {/* World (Home) */}
      <button 
        onClick={handleWorldClick}
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <Home size={12} />
        <span>World</span>
      </button>

      {/* Region */}
      {focusedRegion && (
        <>
          <ChevronRight size={12} className="text-slate-600" />
          <button
            onClick={handleRegionClick}
            className={`hover:text-white transition-colors ${!selectedCountry ? 'text-white' : ''}`}
          >
            <span>{REGION_INFO[focusedRegion].nameLocal}</span>
          </button>
        </>
      )}

      {/* Country */}
      {selectedCountry && (
        <>
          <ChevronRight size={12} className="text-slate-600" />
          <span className="text-green-400 flex items-center gap-1">
            <span>{COUNTRY_INFO[selectedCountry].emoji}</span>
            {COUNTRY_INFO[selectedCountry].nameLocal}
          </span>
        </>
      )}
    </div>
  );
};
