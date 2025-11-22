/**
 * Country Marker Component
 * 국가(Country) 레벨 마커 컴포넌트
 * 
 * 변경사항 (2025-11-22):
 * - 마커 크기 축소 대응 (폰트 크기, 레이아웃)
 * - 겹침 시 가독성 확보를 위한 투명도 조정
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import type { CountryCode, RegionCoordinates, Company } from '@/types/esg-map';
import { COLORS, COUNTRY_INFO } from '@/constants/esg-map';
import { useESGMapStore } from '@/store/esgMapStore';
import { calculateRadius, getMarkerColor, getCompanyTypeCounts } from '../utils/markerUtils';

interface CountryMarkerProps {
  country: CountryCode;
  coords: RegionCoordinates;
  companies: Company[];
}

export const CountryMarker = React.memo(({ country, coords, companies }: CountryMarkerProps) => {
  const { x, y } = coords;
  const count = companies.length;

  const setHoveredCountry = useESGMapStore((state) => state.setHoveredCountry);
  const setSelectedCountry = useESGMapStore((state) => state.setSelectedCountry);
  const hoveredCountry = useESGMapStore((state) => state.mapState.hoveredCountry);
  const selectedCountry = useESGMapStore((state) => state.mapState.selectedCountry);

  const isHovered = hoveredCountry === country;
  const isSelected = selectedCountry === country;

  // radius 계산 (markerUtils의 변경된 로직 사용: 12~35px)
  const radius = calculateRadius(count, 12, 35);

  // 색상 계산
  const { core, operational } = getCompanyTypeCounts(companies);
  const markerColor = getMarkerColor(core, operational);

  const handleMouseEnter = useCallback(() => setHoveredCountry(country), [country, setHoveredCountry]);
  const handleMouseLeave = useCallback(() => setHoveredCountry(null), [setHoveredCountry]);
  const handleClick = useCallback(() => setSelectedCountry(country), [country, setSelectedCountry]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCountry(country);
    }
  }, [country, setSelectedCountry]);

  if (count === 0) return null;

  const countryInfo = COUNTRY_INFO[country];
  const ariaLabel = `${countryInfo.nameLocal} (${country}): ${count}개 기업`;

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
      {/* Glow (Hover 시) */}
      {isHovered && (
        <motion.circle
          cx={x}
          cy={y}
          r={radius + 6}
          fill={markerColor}
          opacity={0.4}
          filter="url(#marker-glow)"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
        />
      )}

      {/* 메인 원 */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={markerColor}
        opacity={isHovered ? 0.9 : 0.75} // 평소엔 약간 투명하게 (겹침 대비)
        stroke={isSelected ? COLORS.ACCENT : COLORS.MAP_BORDER}
        strokeWidth={isSelected ? 2 : 1}
        animate={{ scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* 숫자 */}
      <motion.text
        x={x}
        y={y} // 중앙 정렬
        textAnchor="middle"
        dominantBaseline="central" // 세로 중앙 정렬
        fill={COLORS.TEXT_PRIMARY}
        fontSize={Math.max(radius * 0.8, 10)} // 크기에 비례하되 최소 10px
        fontWeight="bold"
        pointerEvents="none"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }} // 가독성 확보
        animate={{ scale: isHovered ? 1.1 : 1 }}
      >
        {count}
      </motion.text>
    </g>
  );
});

CountryMarker.displayName = 'CountryMarker';
