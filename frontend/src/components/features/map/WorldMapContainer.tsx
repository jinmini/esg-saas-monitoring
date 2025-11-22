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
  ANIMATION,
  Z_INDEX 
} from '@/constants/esg-map';
import type { MapViewMode } from '@/types/esg-map';

// Components
import { MapPathsLayer } from './layers/MapPathsLayer';
// import { RegionGlowLayer } from './layers/RegionGlowLayer'; // Phase 3-2에서 구현
// import { MapTooltip } from './tooltip/MapTooltip'; // Phase 3-3에서 구현

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
      style={{ zIndex: Z_INDEX.MAP_BASE }}
    >
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
          
          {/* 개발 모드: 유럽 영역 표시 */}
          {showGrid && (
            <rect
              x="420"
              y="160"
              width="160"
              height="150"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          )}
        </g>

        {/* 마커 레이어 */}
        <g id="markers-layer" style={{ zIndex: Z_INDEX.MAP_MARKERS }}>
          {/* 
            TODO: RegionGlowLayer 컴포넌트
            viewMode에 따라 조건부 렌더링
          */}
          {/* <RegionGlowLayer /> */}
          
          {/* 임시: 중심점 표시 (개발용) */}
          {showGrid && (
            <>
              {/* World 중심 */}
              <circle
                cx="500"
                cy="300"
                r="5"
                fill="#f59e0b"
                opacity="0.8"
              />
              <text
                x="500"
                y="320"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="12"
              >
                World Center (500, 300)
              </text>

              {/* Europe 중심 */}
              <circle
                cx="500"
                cy="235"
                r="5"
                fill="#10b981"
                opacity="0.8"
              />
              <text
                x="500"
                y="255"
                textAnchor="middle"
                fill="#10b981"
                fontSize="12"
              >
                Europe Center (500, 235)
              </text>
            </>
          )}
        </g>

        {/* 그리드 오버레이 (개발 모드) */}
        {showGrid && (
          <g id="grid-overlay" opacity="0.2">
            {/* 수직선 */}
            {Array.from({ length: 11 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 100}
                y1="0"
                x2={i * 100}
                y2="600"
                stroke="#64748b"
                strokeWidth="1"
              />
            ))}
            {/* 수평선 */}
            {Array.from({ length: 7 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 100}
                x2="1000"
                y2={i * 100}
                stroke="#64748b"
                strokeWidth="1"
              />
            ))}
            {/* 좌표 라벨 */}
            {Array.from({ length: 11 }, (_, i) => (
              <text
                key={`label-${i}`}
                x={i * 100 + 5}
                y="15"
                fill="#64748b"
                fontSize="10"
              >
                {i * 100}
              </text>
            ))}
          </g>
        )}
      </motion.svg>

      {/* 툴팁 (호버 시 표시) */}
      <AnimatePresence>
        {/* <MapTooltip /> */}
      </AnimatePresence>

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

