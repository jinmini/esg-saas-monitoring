/**
 * MapTooltip Component (Simplified Version)
 * 지도 마커 호버 시 표시되는 간단한 정보 라벨
 * 
 * 변경사항:
 * - 복잡한 카드 UI 제거 (패널이 메인이므로)
 * - 심플한 "Region Name (Count)" 형태의 말풍선으로 변경
 * - Smart Positioning 유지 (화면 잘림 방지)
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useESGMapStore, 
  useCompanyCountByRegion, 
  useCompanyCountByCountry 
} from '@/store/esgMapStore';
import { 
  REGION_COORDS, 
  EUROPE_HUBS, 
  ASIA_HUBS, 
  OCEANIA_HUBS, 
  NORTH_AMERICA_HUBS,
  REGION_INFO, 
  COUNTRY_INFO
} from '@/constants/esg-map';
import { calculateRadius } from '../utils/markerUtils';

export const MapTooltip = () => {
  const viewMode = useESGMapStore((state) => state.mapState.viewMode);
  const hoveredRegion = useESGMapStore((state) => state.mapState.hoveredRegion);
  const hoveredCountry = useESGMapStore((state) => state.mapState.hoveredCountry);
  
  const regionCounts = useCompanyCountByRegion();
  const countryCounts = useCompanyCountByCountry();

  // --- 1. 데이터 준비 ---
  let x = 0;
  let y = 0;
  let radius = 0;
  let isVisible = false;
  let label = '';
  let count = 0;

  // 1-A. World View (Region)
  if (viewMode === 'world' && hoveredRegion) {
    const coords = REGION_COORDS[hoveredRegion];
    if (coords) {
      x = coords.x;
      y = coords.y;
      radius = coords.radius;
      label = REGION_INFO[hoveredRegion].nameLocal;
      count = regionCounts[hoveredRegion] || 0;
      isVisible = true;
    }
  } 
  // 1-B. Detail Views (Country)
  else if (hoveredCountry) {
    let coords;
    if (viewMode === 'europe_detail') coords = EUROPE_HUBS[hoveredCountry];
    else if (viewMode === 'asia_detail') coords = ASIA_HUBS[hoveredCountry];
    else if (viewMode === 'oceania_detail') coords = OCEANIA_HUBS[hoveredCountry];
    else if (viewMode === 'north_america_detail') coords = NORTH_AMERICA_HUBS[hoveredCountry];

    if (coords) {
      x = coords.x;
      y = coords.y;
      count = countryCounts[hoveredCountry] || 0;
      radius = calculateRadius(count, 12, 35);
      label = COUNTRY_INFO[hoveredCountry].nameLocal;
      isVisible = true;
    }
  }

  if (!isVisible) return null;

  // 툴팁 스타일 상수 (Simple Label)
  const width = 140; // Compact Width
  const height = 36; // Single Line Height
  
  // --- Smart Positioning (Collision Detection) ---
  const VIEWPORT_WIDTH = 2000;
  
  let tooltipX = x - width / 2;
  let tooltipY = y - radius - height - 10; // 마커 위 10px
  let arrowClass = "absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-slate-800 border-r border-b border-slate-600 rotate-45";

  // 1. 오른쪽 끝 검사
  if (x + width / 2 > VIEWPORT_WIDTH - 20) {
    tooltipX = x - width - radius - 10;
    tooltipY = y - height / 2;
    arrowClass = "absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 border-t border-r border-slate-600 rotate-45";
  }
  // 2. 왼쪽 끝 검사
  else if (x - width / 2 < 20) {
    tooltipX = x + radius + 10;
    tooltipY = y - height / 2;
    arrowClass = "absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 border-b border-l border-slate-600 rotate-45";
  }
  // 3. 위쪽 끝 검사
  else if (tooltipY < 20) {
    tooltipY = y + radius + 10;
    arrowClass = "absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 bg-slate-800 border-l border-t border-slate-600 rotate-45";
  }

  return (
    <foreignObject
      x={tooltipX}
      y={tooltipY}
      width={width}
      height={height}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full flex justify-center"
        >
          <div className="relative bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-600 flex items-center gap-2 whitespace-nowrap">
            <span>{label}</span>
            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-green-400 border border-slate-600">
              {count}
            </span>
            {/* Arrow */}
            <div className={arrowClass} />
          </div>
        </motion.div>
      </AnimatePresence>
    </foreignObject>
  );
};
