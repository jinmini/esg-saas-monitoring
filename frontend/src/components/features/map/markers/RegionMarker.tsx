/**
 * Region Marker Component
 * 대륙(Region) 레벨 마커 컴포넌트
 * 
 * 기능:
 * - Circle + Glow 효과
 * - Pulse 애니메이션 (2초 주기)
 * - 카운트 라벨
 * - 클릭 → zoomToRegion()
 * - 키보드 접근성 (Enter/Space)
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Region, RegionCoordinates } from '@/types/esg-map';
import { COLORS, ANIMATION, REGION_INFO } from '@/constants/esg-map';
import { useESGMapStore } from '@/store/esgMapStore';

interface RegionMarkerProps {
  region: Region;
  coords: RegionCoordinates;
  count: number;
}

/**
 * 대륙 마커 컴포넌트
 */
export const RegionMarker = React.memo(({ region, coords, count }: RegionMarkerProps) => {
  const { x, y, radius } = coords;
  
  // Store 액션
  const setHoveredRegion = useESGMapStore((state) => state.setHoveredRegion);
  const zoomToRegion = useESGMapStore((state) => state.zoomToRegion);
  const hoveredRegion = useESGMapStore((state) => state.mapState.hoveredRegion);
  const selectedRegion = useESGMapStore((state) => state.mapState.selectedRegion);

  const isHovered = hoveredRegion === region;
  const isSelected = selectedRegion === region;

  // 이벤트 핸들러
  const handleMouseEnter = useCallback(() => {
    setHoveredRegion(region);
  }, [region, setHoveredRegion]);

  const handleMouseLeave = useCallback(() => {
    setHoveredRegion(null);
  }, [setHoveredRegion]);

  const handleClick = useCallback(() => {
    zoomToRegion(region);
  }, [region, zoomToRegion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        zoomToRegion(region);
      }
    },
    [region, zoomToRegion]
  );

  // 카운트가 0이면 렌더링하지 않음
  if (count === 0) return null;

  const regionInfo = REGION_INFO[region];
  const ariaLabel = `${regionInfo.nameLocal} (${region}): ${count}개 기업`;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow 효과 (외부 원) */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={isHovered ? COLORS.GLOW_CORE_HOVER : COLORS.GLOW_CORE}
        opacity={isHovered ? 0.9 : 0.6}
        filter="url(#marker-glow)"
        animate={{
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.9 : [0.5, 0.7, 0.5],
        }}
        transition={{
          scale: { duration: 0.2 },
          opacity: isHovered
            ? { duration: 0.2 }
            : {
                duration: ANIMATION.GLOW_PULSE / 1000,
                repeat: Infinity,
                ease: 'easeInOut',
              },
        }}
      />

      {/* 메인 원 */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius * 0.7}
        fill={COLORS.CORE_PLATFORM}
        opacity={0.8}
        stroke={isSelected ? COLORS.ACCENT : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{
          duration: 0.2,
        }}
      />

      {/* 카운트 라벨 */}
      <motion.text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLORS.TEXT_PRIMARY}
        fontSize={radius * 0.4}
        fontWeight="bold"
        pointerEvents="none"
        animate={{
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{
          duration: 0.2,
        }}
      >
        {count}
      </motion.text>

      {/* 지역명 라벨 (hover 시 표시) */}
      {isHovered && (
        <motion.text
          x={x}
          y={y + radius + 20}
          textAnchor="middle"
          fill={COLORS.TEXT_PRIMARY}
          fontSize={14}
          fontWeight="500"
          pointerEvents="none"
          initial={{ opacity: 0, y: y + radius + 10 }}
          animate={{ opacity: 1, y: y + radius + 20 }}
          transition={{ duration: 0.2 }}
        >
          {regionInfo.emoji} {regionInfo.nameLocal}
        </motion.text>
      )}
    </g>
  );
});

RegionMarker.displayName = 'RegionMarker';

