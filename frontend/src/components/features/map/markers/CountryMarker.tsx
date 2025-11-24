/**
 * CountryMarker Component
 * 국가(Country) 단위 마커 - Europe Detail View 등에서 표시
 * 
 * 변경사항:
 * - 단일 기업(1개)일 경우 로고/텍스트 핀 형태로 표시
 * - Pulse 애니메이션 추가
 */

'use client';

import { motion } from 'framer-motion';
import { useESGMapStore } from '@/store/esgMapStore';
import { COLORS } from '@/constants/esg-map';
import { calculateRadius, getMarkerColor, getCompanyTypeCounts } from '../utils/markerUtils';
import type { CountryCode, Company, RegionCoordinates } from '@/types/esg-map';

interface CountryMarkerProps {
  countryCode: CountryCode;
  coords: RegionCoordinates;
  companies: Company[];
  isSelected: boolean;
  isHovered: boolean;
  isAnyHovered?: boolean; // 다른 마커가 호버 상태인지
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const CountryMarker = ({
  countryCode,
  coords,
  companies,
  isSelected,
  isHovered,
  isAnyHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: CountryMarkerProps) => {
  const count = companies.length;
  const selectedCompany = useESGMapStore((state) => state.mapState.selectedCompany);
  const setSelectedCompany = useESGMapStore((state) => state.setSelectedCompany);

  // =================================================================
  // [Case 1] 단일 기업 (Single Result) -> 로고 핀 렌더링
  // =================================================================
  if (count === 1) {
    const company = companies[0];
    const isCore = company.companyType === 'CORE_ESG_PLATFORM';
    const pinColor = isCore ? COLORS.CORE_PLATFORM : COLORS.OPERATIONAL_ENABLER;
    
    // 핀 클릭 시 핸들러
    const handlePinClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      // 이미 선택된 상태라도 다시 열기 위해 호출 (Detail View로)
      setSelectedCompany(company);
      // onClick(); // 상위 핸들러(open List View)는 호출하지 않음!
    };

    // Dimming Effect: 다른 마커가 호버되었고, 나는 호버되지 않았을 때
    const isDimmed = isAnyHovered && !isHovered;
    
    // Pin Color & Opacity
    const pinOpacity = isDimmed ? 0.3 : 1;

    return (
      <g
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={handlePinClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        opacity={pinOpacity} // 전체 투명도 조절
      >
        {/* 1. Pulse Effect (Background) */}
        {!isDimmed && ( // Dimmed 상태에서는 펄스 효과 숨김
          <motion.circle
            cx={coords.x}
            cy={coords.y}
            r={10}
            fill={pinColor}
            opacity={0.4}
            animate={{
              scale: [1, 2.5],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
          />
        )}

        {/* 2. Pin Icon (SVG) */}
        <motion.g
          animate={{ y: isHovered || isSelected ? -5 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Pin Head */}
          <circle
            cx={coords.x}
            cy={coords.y}
            r={6}
            fill={pinColor}
            stroke="#fff"
            strokeWidth={2}
          />
          {/* Pin Leg */}
          <line
            x1={coords.x}
            y1={coords.y}
            x2={coords.x}
            y2={coords.y + 15}
            stroke={pinColor}
            strokeWidth={2}
          />
        </motion.g>

        {/* 3. Label (Top Center) - Hover 시에만 표시! */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            y: isHovered ? 0 : 10 
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Background Pill */}
          <rect
            x={coords.x - (Math.max(100, company.name.length * 7 + 20) / 2)}
            y={coords.y - 40} // 핀 위로 이동
            width={Math.max(100, company.name.length * 7 + 20)}
            height={24}
            rx={12}
            fill="#1e293b" // slate-800
            stroke={pinColor}
            strokeWidth={1}
            opacity={0.95} // 가독성 위해 불투명도 증가
          />
          {/* Text */}
          <text
            x={coords.x}
            y={coords.y - 23} // 수직 중앙 정렬 보정
            fill="#fff"
            fontSize={12}
            fontWeight="600"
            textAnchor="middle"
            pointerEvents="none"
          >
            {company.name}
          </text>
          {/* Type Indicator Dot - 라벨 왼쪽 끝에 작게 표시하거나 제거 */}
          {/* <circle cx={...} cy={...} r={3} fill={pinColor} /> */}
        </motion.g>
      </g>
    );
  }

  // =================================================================
  // [Case 2] 다수 기업 (Cluster) -> 기존 원형 마커 렌더링
  // =================================================================
  
  // 기업 수에 따른 반경 계산 (Country는 작게)
  const radius = count > 0 
    ? calculateRadius(count, 15, 40)
    : coords.radius;

  // 기업 타입 분포에 따른 색상
  const { core, operational } = getCompanyTypeCounts(companies);
  const markerColor = count > 0 
    ? getMarkerColor(core, operational) 
    : COLORS.MAP_LAND;

  // 상태별 스타일
  const baseOpacity = count === 0 ? 0.1 : 0.7;
  const isDimmed = isAnyHovered && !isHovered;
  
  // Dimmed 상태면 투명도 낮춤, Hover면 1, Selected면 0.9
  const opacity = isDimmed 
    ? 0.3 
    : (isHovered ? 1 : isSelected ? 0.9 : baseOpacity);
    
  const scale = isHovered ? 1.2 : isSelected ? 1.15 : 1;

  return (
    <g
      style={{ cursor: count > 0 ? 'pointer' : 'default' }}
      onClick={count > 0 ? onClick : undefined}
      onMouseEnter={count > 0 ? onMouseEnter : undefined}
      onMouseLeave={count > 0 ? onMouseLeave : undefined}
      opacity={isDimmed ? 0.5 : 1} // 그룹 전체 투명도 추가 조절
    >
      {/* Glow Effect (Outer Circle) */}
      {!isDimmed && ( // Dimmed 상태에서는 Glow 효과 제거
        <motion.circle
          cx={coords.x}
          cy={coords.y}
          r={radius}
          fill={markerColor}
          opacity={opacity * 0.25}
          filter="url(#glow-country)"
          animate={{
            scale,
            opacity: [opacity * 0.25, opacity * 0.35, opacity * 0.25],
          }}
          transition={{
            scale: { duration: 0.25, ease: 'easeOut' },
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
        />
      )}

      {/* Main Circle */}
      <motion.circle
        cx={coords.x}
        cy={coords.y}
        r={radius * 0.65}
        fill={markerColor}
        opacity={opacity}
        stroke={isSelected || isHovered ? '#ffffff' : 'none'}
        strokeWidth={isSelected ? 2.5 : 2}
        animate={{ scale }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
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
          fontSize={radius * 0.4}
          fontWeight="600"
          pointerEvents="none"
          animate={{ scale }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ transformOrigin: `${coords.x}px ${coords.y}px` }}
        >
          {count}
        </motion.text>
      )}

      {/* Country Code Label (Optional - 작은 텍스트) */}
      {count > 0 && (
        <motion.text
          x={coords.x}
          y={coords.y + radius + 8}
          textAnchor="middle"
          fill="#64748b"
          fontSize={10}
          fontWeight="500"
          pointerEvents="none"
          opacity={isHovered ? 1 : 0}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {countryCode}
        </motion.text>
      )}

      {/* SVG Filter for Glow */}
      <defs>
        <filter id="glow-country" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};
