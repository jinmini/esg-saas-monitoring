/**
 * WorldMapContainer
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useESGMapStore } from '@/store/esgMapStore';
import { useWindowSize } from '@/hooks/useWindowSize';
import { 
  REGION_BBOX,
  ANIMATION,
  PANEL_WIDTH
} from '@/constants/esg-map';

// Components
import { MapPathsLayer } from './layers/MapPathsLayer';
import { RegionGlowLayer } from './layers/RegionGlowLayer';
import { MapTooltip } from './tooltip/MapTooltip';
import { TopFilterBar } from './controls/TopFilterBar';
import { MapBreadcrumbs } from './controls/MapBreadcrumbs';
import { CompanyDetailPanel } from './panels/CompanyDetailPanel';

/**
 * Constants
 */
// GlobalHeader의 높이와 일치해야 합니다. (h-16 = 64px)
const HEADER_HEIGHT = 64; 

interface WorldMapContainerProps {
  className?: string;
  showGrid?: boolean; 
}

export const WorldMapContainer: React.FC<WorldMapContainerProps> = ({
  className = '',
  showGrid = false,
}) => {
  // Store
  const mapState = useESGMapStore((state) => state.mapState);
  const zoomToWorld = useESGMapStore((state) => state.zoomToWorld);
  const { rightPanel } = useESGMapStore((state) => state.panelState);
  
  // Window Size
  const { width, height } = useWindowSize();
  
  const { viewMode, focusedRegion } = mapState;

  // ========================================
  // Viewport 계산 (Dynamic Fit-Bounds)
  // ========================================
  
  const getDynamicViewBox = useCallback(() => {
    // 초기 로딩 시 안전장치
    if (!width || !height) return '0 0 2000 857';

    // 1. Target BBox (관심 영역)
    const targetBBox = REGION_BBOX[viewMode] || REGION_BBOX['world'];

    // 2. Available Screen Space calculation
    // [중요] Header 높이를 뺀 실제 지도가 그려질 높이를 계산해야 중심이 맞습니다.
    const panelWidth = rightPanel.isOpen ? PANEL_WIDTH.RIGHT : 0;
    const availableW = width - panelWidth;
    const availableH = height - HEADER_HEIGHT; // 헤더 높이 제외

    // 3. Scale Calculation (Fit Bounds)
    // 화면(Available Space) 비율에 맞춰 Scale 결정
    const scaleW = availableW / targetBBox.w;
    const scaleH = availableH / targetBBox.h;
    const scale = Math.min(scaleW, scaleH) * 0.9; // 90% 채움 (여백 10%)

    // 4. ViewBox Size (SVG Units)
    // 실제 컨테이너(availableW/H)를 커버하기 위한 SVG 좌표계 크기
    const viewBoxW = availableW / scale; 
    const viewBoxH = availableH / scale; // [수정] width/scale 대신 availableH 사용

    // 5. ViewBox Origin (Center Alignment)
    const targetCenterX = targetBBox.x + targetBBox.w / 2;
    const targetCenterY = targetBBox.y + targetBBox.h / 2;

    const viewBoxX = targetCenterX - (viewBoxW / 2);
    const viewBoxY = targetCenterY - (viewBoxH / 2);

    return `${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`;
  }, [viewMode, width, height, rightPanel.isOpen]);

  const currentViewBox = getDynamicViewBox();

  // ========================================
  // 키보드 이벤트
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
    <div className={`relative w-full h-full overflow-hidden bg-slate-900 ${className}`}>
      {/* 상단 필터 바 */}
      <TopFilterBar />
      
      {/* 지도 네비게이션 경로 */}
      <MapBreadcrumbs />

      {/* 우측 기업 상세 패널 */}
      <CompanyDetailPanel />

      {/* SVG 지도 */}
      <motion.svg
        className="w-full h-full block" // block 추가하여 하단 미세 여백 제거
        viewBox={currentViewBox}
        preserveAspectRatio="xMidYMid meet"
        animate={{ viewBox: currentViewBox }}
        transition={{
          duration: ANIMATION.MAP_ZOOM / 1000,
          ease: 'easeInOut',
        }}
      >
        {/* 배경 지도 */}
        <g id="world-map-background">
          <MapPathsLayer opacity={0.6} showOtherCountries={true} />
        </g>

        {/* 마커 레이어 */}
        <g id="markers-layer">
          <RegionGlowLayer />
          
          {/* 개발 모드: 중심점 표시 */}
          {showGrid && (
            <>
              <circle cx="1000" cy="428" r="8" fill="#f59e0b" opacity="0.8" />
              <text x="1000" y="450" textAnchor="middle" fill="#f59e0b" fontSize="16">
                World Center
              </text>
            </>
          )}
        </g>

        {/* 툴팁 레이어 */}
        <g id="tooltip-layer">
          <AnimatePresence>
            <MapTooltip />
          </AnimatePresence>
        </g>
      </motion.svg>

      {/* Debug Info */}
      {showGrid && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-xs font-mono pointer-events-none">
          <div>ViewBox: {currentViewBox}</div>
          <div>Available H: {height ? height - HEADER_HEIGHT : 0}px</div>
        </div>
      )}
    </div>
  );
};

WorldMapContainer.displayName = 'WorldMapContainer';