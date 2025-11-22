/**
 * Country Marker Component
 * 국가(Country) 레벨 마커 컴포넌트
 * 
 * 기능:
 * - Circle + 동적 radius (기업 수에 비례)
 * - companyType 비율에 따른 색상
 * - 클릭 → setSelectedCountry()
 * - 키보드 접근성
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

/**
 * 국가 마커 컴포넌트
 */
export const CountryMarker = React.memo(({ country, coords, companies }: CountryMarkerProps) => {
  const { x, y } = coords;
  const count = companies.length;

  // Store 액션
  const setHoveredCountry = useESGMapStore((state) => state.setHoveredCountry);
  const setSelectedCountry = useESGMapStore((state) => state.setSelectedCountry);
  const hoveredCountry = useESGMapStore((state) => state.mapState.hoveredCountry);
  const selectedCountry = useESGMapStore((state) => state.mapState.selectedCountry);

  const isHovered = hoveredCountry === country;
  const isSelected = selectedCountry === country;

  // 동적 반경 계산 (기업 수에 비례)
  const radius = calculateRadius(count, 18, 45);

  // 색상 계산 (companyType 비율)
  const { core, operational } = getCompanyTypeCounts(companies);
  const markerColor = getMarkerColor(core, operational);

  // 이벤트 핸들러
  const handleMouseEnter = useCallback(() => {
    setHoveredCountry(country);
  }, [country, setHoveredCountry]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
  }, [setHoveredCountry]);

  const handleClick = useCallback(() => {
    setSelectedCountry(country);
  }, [country, setSelectedCountry]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedCountry(country);
      }
    },
    [country, setSelectedCountry]
  );

  // 카운트가 0이면 렌더링하지 않음
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
      {/* Glow 효과 (hover 시만 표시) */}
      {isHovered && (
        <motion.circle
          cx={x}
          cy={y}
          r={radius + 8}
          fill={markerColor}
          opacity={0.6}
          filter="url(#marker-glow)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* 메인 원 */}
      <motion.circle
        cx={x}
        cy={y}
        r={radius}
        fill={markerColor}
        opacity={isHovered ? 0.9 : 0.75}
        stroke={isSelected ? COLORS.ACCENT : COLORS.MAP_BORDER}
        strokeWidth={isSelected ? 3 : 1}
        animate={{
          scale: isHovered ? 1.15 : 1,
          opacity: isHovered ? 0.9 : 0.75,
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
        fontSize={Math.max(radius * 0.5, 10)}
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

      {/* 국가 정보 라벨 (hover 시 표시) */}
      {isHovered && (
        <motion.g
          initial={{ opacity: 0, y: y + radius + 5 }}
          animate={{ opacity: 1, y: y + radius + 12 }}
          transition={{ duration: 0.2 }}
        >
          {/* 배경 */}
          <rect
            x={x - 60}
            y={y + radius + 8}
            width={120}
            height={32}
            rx={6}
            fill={COLORS.BACKGROUND_CARD}
            opacity={0.95}
            stroke={COLORS.MAP_BORDER}
            strokeWidth={1}
            pointerEvents="none"
          />
          
          {/* 국가명 + 이모지 */}
          <text
            x={x}
            y={y + radius + 19}
            textAnchor="middle"
            fill={COLORS.TEXT_PRIMARY}
            fontSize={11}
            fontWeight="600"
            pointerEvents="none"
          >
            {countryInfo.emoji} {countryInfo.nameLocal}
          </text>
          
          {/* Core/Operational 비율 */}
          <text
            x={x}
            y={y + radius + 32}
            textAnchor="middle"
            fill={COLORS.TEXT_SECONDARY}
            fontSize={9}
            pointerEvents="none"
          >
            Core {core} · Operational {operational}
          </text>
        </motion.g>
      )}
    </g>
  );
});

CountryMarker.displayName = 'CountryMarker';

