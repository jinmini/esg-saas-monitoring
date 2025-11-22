/**
 * Marker Utils
 * 마커 관련 유틸리티 함수
 */

import { COLORS } from '@/constants/esg-map';
import type { CompanyType } from '@/types/esg-map';

/**
 * 기업 수에 따라 마커 반경 계산
 * 
 * @param count - 기업 수
 * @param min - 최소 반경 (기본: 20)
 * @param max - 최대 반경 (기본: 60)
 * @returns 계산된 반경 (px)
 */
export const calculateRadius = (
  count: number,
  min: number = 20,
  max: number = 60
): number => {
  if (count === 0) return 0;
  if (count === 1) return min;
  
  // 제곱근 스케일 (부드러운 증가)
  const normalized = Math.sqrt(count) / Math.sqrt(100); // 100개 기준 정규화
  const radius = min + (max - min) * Math.min(normalized, 1);
  
  return Math.round(radius);
};

/**
 * 기업 타입 비율에 따라 마커 색상 결정
 * 
 * @param coreCount - CORE_ESG_PLATFORM 기업 수
 * @param operationalCount - OPERATIONAL_ESG_ENABLER 기업 수
 * @returns 색상 코드
 */
export const getMarkerColor = (
  coreCount: number,
  operationalCount: number
): string => {
  const total = coreCount + operationalCount;
  
  if (total === 0) return COLORS.MAP_LAND;
  
  const coreRatio = coreCount / total;
  
  // 90% 이상 CORE → 초록
  if (coreRatio >= 0.9) return COLORS.GLOW_CORE;
  
  // 90% 이상 OPERATIONAL → 파랑
  if (coreRatio <= 0.1) return COLORS.GLOW_OPERATIONAL;
  
  // 혼합 → 중간 색상 (그라디언트는 SVG def로 별도 구현 필요)
  // 임시: 비율에 따라 하나 선택
  return coreRatio > 0.5 ? COLORS.GLOW_CORE : COLORS.GLOW_OPERATIONAL;
};

/**
 * 마커 간 충돌 감지
 * 
 * @param x1 - 마커 1의 x 좌표
 * @param y1 - 마커 1의 y 좌표
 * @param r1 - 마커 1의 반경
 * @param x2 - 마커 2의 x 좌표
 * @param y2 - 마커 2의 y 좌표
 * @param r2 - 마커 2의 반경
 * @param margin - 최소 간격 (기본: 5px)
 * @returns 충돌 여부
 */
export const checkCollision = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
  margin: number = 5
): boolean => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const minDistance = r1 + r2 + margin;
  
  return distance < minDistance;
};

/**
 * 기업 타입별 카운트 계산
 * 
 * @param companies - 기업 목록
 * @returns { core, operational }
 */
export const getCompanyTypeCounts = (
  companies: Array<{ companyType: CompanyType }>
): { core: number; operational: number } => {
  const core = companies.filter((c) => c.companyType === 'CORE_ESG_PLATFORM').length;
  const operational = companies.filter((c) => c.companyType === 'OPERATIONAL_ESG_ENABLER').length;
  
  return { core, operational };
};

