/**
 * RegionMarker Component
 * 대륙(Region) 단위 마커 - World View에서 표시
 */

'use client';

import { motion } from 'framer-motion';
import { COLORS, ANIMATION } from '@/constants/esg-map';
import { calculateRadius, getMarkerColor, getCompanyTypeCounts } from '../utils/markerUtils';
import type { Region, Company, RegionCoordinates } from '@/types/esg-map';

interface RegionMarkerProps {
  region: Region;
  coords: RegionCoordinates;
  companies: Company[];
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const RegionMarker = ({
  region,
  coords,
  companies,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: RegionMarkerProps) => {
  const count = companies.length;
  
  // 기업 수에 따른 반경 계산
  const radius = count > 0 
    ? calculateRadius(count, 35, 80) // Region은 크게
    : coords.radius;

  // 기업 타입 분포에 따른 색상
  const { core, operational } = getCompanyTypeCounts(companies);
  const markerColor = count > 0 
    ? getMarkerColor(core, operational) 
    : COLORS.MAP_LAND;

  // 상태별 스타일
  const baseOpacity = count === 0 ? 0.15 : 0.6;
  const opacity = isHovered ? 0.9 : isSelected ? 0.8 : baseOpacity;
  const scale = isHovered ? 1.15 : isSelected ? 1.1 : 1;

  return (
    <g
      style={{ cursor: count > 0 ? 'pointer' : 'default' }}
      onClick={count > 0 ? onClick : undefined}
      onMouseEnter={count > 0 ? onMouseEnter : undefined}
      onMouseLeave={count > 0 ? onMouseLeave : undefined}
    >
      {/* Glow Effect (Outer Circle) */}
      <motion.circle
        cx={coords.x}
        cy={coords.y}
        r={radius}
        fill={markerColor}
        opacity={opacity * 0.3}
        filter="url(#glow)"
        animate={{
          scale,
          opacity: [opacity * 0.3, opacity * 0.4, opacity * 0.3],
        }}
        transition={{
          scale: { duration: 0.3, ease: 'easeOut' },
          opacity: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
      />

      {/* Main Circle */}
      <motion.circle
        cx={coords.x}
        cy={coords.y}
        r={radius * 0.7}
        fill={markerColor}
        opacity={opacity}
        stroke={isSelected || isHovered ? '#ffffff' : 'none'}
        strokeWidth={isSelected ? 3 : 2}
        animate={{ scale }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
      />

      {/* Count Text */}
      {count > 0 && (
        <motion.text
          x={coords.x}
          y={coords.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontSize={radius * 0.35}
          fontWeight="bold"
          pointerEvents="none"
          animate={{ scale }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
        >
          {count}
        </motion.text>
      )}

      {/* SVG Filter for Glow */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};
