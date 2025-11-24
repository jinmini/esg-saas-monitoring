/**
 * WorldMapContainer
 * 글로벌 ESG SaaS 지도의 메인 컨테이너 컴포넌트
 * 
 * 역할:
 * - SVG viewport 제어 (viewMode에 따라 viewBox 동적 변경)
 * - 배경 지도 렌더링 (world.svg)
 * - 마커 레이어 관리 (RegionGlowLayer)
 * - 전역 이벤트 리스너 (ESC 키로 세계 지도 복귀)
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useESGMapStore } from '@/store/esgMapStore';
import { 
  WORLD_VIEWPORT, 
  EUROPE_VIEWPORT,
  ASIA_VIEWPORT,
  OCEANIA_VIEWPORT,
  NORTH_AMERICA_VIEWPORT,
  ANIMATION 
} from '@/constants/esg-map';
import type { MapViewMode } from '@/types/esg-map';

// Components
import { MapPathsLayer } from './layers/MapPathsLayer';
import { RegionGlowLayer } from './layers/RegionGlowLayer';
import { MapTooltip } from './tooltip/MapTooltip';
import { TopFilterBar } from './controls/TopFilterBar';
import { MapBreadcrumbs } from './controls/MapBreadcrumbs';
import { CompanyDetailPanel } from './panels/CompanyDetailPanel';

/**
 * Props
 */
interface WorldMapContainerProps {
  className?: string;
  showGrid?: boolean; // 개발 모드: 그리드 표시
}

/**
 * WorldMapContainer Component
 */
export const WorldMapContainer: React.FC<WorldMapContainerProps> = ({
  className = '',
  showGrid = false,
}) => {
  // ========================================
  // Store 구독
  // ========================================
  
  const mapState = useESGMapStore((state) => state.mapState);
  const zoomToWorld = useESGMapStore((state) => state.zoomToWorld);
  
  const { viewMode, focusedRegion } = mapState;

  // ========================================
  // Viewport 계산
  // ========================================
  
  /**
   * viewMode에 따라 적절한 viewport 반환
   */
  const getViewport = useCallback((mode: MapViewMode) => {
    switch (mode) {
      case 'world':
        return WORLD_VIEWPORT;
      case 'europe_detail':
        return EUROPE_VIEWPORT;
      case 'asia_detail':
        return ASIA_VIEWPORT;
      case 'oceania_detail':
        return OCEANIA_VIEWPORT;
      case 'north_america_detail':
        return NORTH_AMERICA_VIEWPORT;
      case 'region':
        // 향후 확장: 다른 대륙 확대 뷰
        return WORLD_VIEWPORT;
      default:
        return WORLD_VIEWPORT;
    }
  }, []);

  const currentViewport = getViewport(viewMode);

  // ========================================
  // 키보드 이벤트 (ESC로 세계 지도 복귀)
  // ========================================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode !== 'world') {
        zoomToWorld();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, zoomToWorld]);

  // ========================================
  // Render
  // ========================================
  
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}
    >
      {/* 상단 필터 바 (Phase 4-3: Top Floating Bar) */}
      <TopFilterBar />
      
      {/* 지도 네비게이션 경로 (Phase 5) */}
      <MapBreadcrumbs />

      {/* 우측 기업 상세 패널 (Drawer) */}
      <CompanyDetailPanel />

      {/* SVG 지도 컨테이너 */}
      <motion.svg
        className="w-full h-full"
        viewBox={currentViewport.viewBox}
        preserveAspectRatio="xMidYMid meet"
        animate={{
          // viewBox 애니메이션 (부드러운 전환)
          viewBox: currentViewport.viewBox,
        }}
        transition={{
          duration: ANIMATION.MAP_ZOOM / 1000, // ms → s
          ease: 'easeInOut',
        }}
      >
        {/* 배경 지도 (SVG path 레이어) */}
        <g id="world-map-background">
          {/* MapPathsLayer: 14개 타겟 국가 + 배경 */}
          <MapPathsLayer 
            opacity={0.6}
            showOtherCountries={true}
          />
          
        </g>

        {/* 마커 레이어 */}
        <g id="markers-layer">
          {/* RegionGlowLayer: viewMode에 따라 조건부 렌더링 */}
          <RegionGlowLayer />
          
          {/* 개발 모드: 중심점 및 유럽 영역 표시 */}
          {showGrid && (
            <>
              {/* World 중심 (viewBox 2000x857 기준) */}
              <circle
                cx="1000"
                cy="428"
                r="8"
                fill="#f59e0b"
                opacity="0.8"
              />
              <text
                x="1000"
                y="450"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="16"
              >
                World Center (1000, 428)
              </text>

              {/* Europe 중심 */}
              <circle
                cx="1035"
                cy="170"
                r="8"
                fill="#10b981"
                opacity="0.8"
              />
              <text
                x="1035"
                y="195"
                textAnchor="middle"
                fill="#10b981"
                fontSize="16"
              >
                Europe Center (1035, 170)
              </text>

              {/* 유럽 확대 영역 */}
              <rect
                x="920"
                y="70"
                width="230"
                height="200"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="10,5"
                opacity="0.6"
              />
            </>
          )}
        </g>

        {/* Layer 3: 그리드 오버레이 (개발 모드, 최상단) */}
        {showGrid && (
          <g id="grid-overlay" opacity="0.2">
            {/* ... grid content ... */}
          </g>
        )}
        
        {/* 툴팁 레이어 (최상단) */}
        <g id="tooltip-layer">
          <AnimatePresence>
            <MapTooltip />
          </AnimatePresence>
        </g>
      </motion.svg>

      {/* 뷰 모드 표시 (개발용) */}
      {showGrid && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-mono">
          <div>View Mode: <span className="text-amber-500 font-bold">{viewMode}</span></div>
          <div>Focused: <span className="text-green-500">{focusedRegion || 'None'}</span></div>
          <div>ViewBox: <span className="text-blue-400">{currentViewport.viewBox}</span></div>
          <div className="mt-2 text-xs text-slate-400">Press ESC to return to World View</div>
        </div>
      )}

      {/* Zoom Controls (향후 추가) */}
      {/* 
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button onClick={zoomToWorld}>World View</button>
        <button onClick={() => zoomToRegion('Europe')}>Europe</button>
      </div>
      */}
    </div>
  );
};

/**
 * Display Name (for React DevTools)
 */
WorldMapContainer.displayName = 'WorldMapContainer';

