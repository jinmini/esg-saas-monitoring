/**
 * Region Marker Component
 * 대륙(Region) 레벨 마커 컴포넌트
 * 
 * 변경사항 (2025-11-22):
 * - 가독성 개선: "Companies" 라벨 추가
 * - 시각적 간섭 최소화: 투명도 및 크기 최적화
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

export const RegionMarker = React.memo(({ region, coords, count }: RegionMarkerProps) => {
  const { x, y, radius } = coords;
  
  const setHoveredRegion = useESGMapStore((state) => state.setHoveredRegion);
  const zoomToRegion = useESGMapStore((state) => state.zoomToRegion);
  const hoveredRegion = useESGMapStore((state) => state.mapState.hoveredRegion);
  const selectedRegion = useESGMapStore((state) => state.mapState.selectedRegion);

  const isHovered = hoveredRegion === region;
  const isSelected = selectedRegion === region;

  const handleMouseEnter = useCallback(() => setHoveredRegion(region), [region, setHoveredRegion]);
  const handleMouseLeave = useCallback(() => setHoveredRegion(null), [setHoveredRegion]);
  const handleClick = useCallback(() => zoomToRegion(region), [region, zoomToRegion]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      zoomToRegion(region);
    }
  }, [region, zoomToRegion]);

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
      {/* Glow 효과 */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={isHovered ? COLORS.GLOW_CORE_HOVER : COLORS.GLOW_CORE}
        opacity={isHovered ? 0.8 : 0.4} // 투명도 낮춤
        filter="url(#marker-glow)"
        animate={{
          scale: isHovered ? 1.05 : 1,
          opacity: isHovered ? 0.8 : [0.3, 0.5, 0.3],
        }}
        transition={{
          scale: { duration: 0.2 },
          opacity: isHovered
            ? { duration: 0.2 }
            : { duration: ANIMATION.GLOW_PULSE / 1000, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* 메인 원 */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius * 0.8} // 크기 약간 축소
        fill={COLORS.CORE_PLATFORM}
        opacity={0.9}
        stroke={isSelected ? COLORS.ACCENT : 'transparent'}
        strokeWidth={isSelected ? 3 : 0}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* 카운트 (숫자) */}
      <motion.text
        x={x}
        y={y - 5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLORS.TEXT_PRIMARY}
        fontSize={24}
        fontWeight="bold"
        pointerEvents="none"
      >
        {count}
      </motion.text>

      {/* 라벨 (Companies) */}
      <text
        x={x}
        y={y + 15}
        textAnchor="middle"
        fill={COLORS.TEXT_SECONDARY}
        fontSize={12}
        fontWeight="500"
        pointerEvents="none"
      >
        Companies
      </text>

      {/* 지역명 (Hover 시) */}
      {isHovered && (
        <motion.text
          x={x}
          y={y + radius + 25}
          textAnchor="middle"
          fill={COLORS.ACCENT} // 강조색
          fontSize={16}
          fontWeight="bold"
          pointerEvents="none"
          initial={{ opacity: 0, y: y + radius + 15 }}
          animate={{ opacity: 1, y: y + radius + 25 }}
        >
          {regionInfo.emoji} {regionInfo.nameLocal}
        </motion.text>
      )}
    </g>
  );
});

RegionMarker.displayName = 'RegionMarker';
