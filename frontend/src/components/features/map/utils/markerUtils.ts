/**
 * Marker Utils
 * 마커 관련 유틸리티 함수
 */

import { COLORS } from '@/constants/esg-map';
import type { CompanyType } from '@/types/esg-map';

/**
 * 기업 수에 따라 마커 반경 계산
 * 
 * 변경사항 (2025-11-22):
 * - 가독성을 위해 최대 크기 축소 (45px -> 35px)
 * - 최소 크기 축소 (18px -> 12px)
 * - 제곱근 스케일 유지
 * 
 * @param count - 기업 수
 * @param min - 최소 반경 (기본: 12)
 * @param max - 최대 반경 (기본: 35)
 * @returns 계산된 반경 (px)
 */
export const calculateRadius = (
  count: number,
  min: number = 12,
  max: number = 35
): number => {
  if (count === 0) return 0;
  if (count === 1) return min;
  
  // 제곱근 스케일 (부드러운 증가)
  // 50개 기준 정규화
  const normalized = Math.sqrt(count) / Math.sqrt(50);
  const radius = min + (max - min) * Math.min(normalized, 1);
  
  return Math.round(radius);
};

/**
 * 기업 타입 비율에 따라 마커 색상 결정
 * 
 * 변경사항 (2025-11-22):
 * - 정보 과부하 방지를 위해 기본적으로 단일 톤 유지
 * - 극단적인 경우에만 색상 변경 고려 (현재는 단순화)
 */
export const getMarkerColor = (
  coreCount: number,
  operationalCount: number
): string => {
  const total = coreCount + operationalCount;
  if (total === 0) return COLORS.MAP_LAND;
  
  // 피드백 반영: 색상 혼합보다는 Core(초록) 위주로 통일감을 주고,
  // 툴팁에서 상세 정보를 보여주는 방식으로 변경 제안.
  // 하지만 현재는 구분을 위해 기존 로직 유지하되, 임계값 조정
  
  const coreRatio = coreCount / total;
  
  // 70% 이상 Core면 초록
  if (coreRatio >= 0.7) return COLORS.CORE_PLATFORM;
  
  // 70% 이상 Ops면 파랑
  if (coreRatio <= 0.3) return COLORS.OPERATIONAL_ENABLER;
  
  // 혼합: 짙은 청록색 (가독성 위해)
  return '#0ea5e9'; // sky-500 (중간색)
};

/**
 * 기업 타입별 카운트 계산
 */
export const getCompanyTypeCounts = (
  companies: Array<{ companyType: CompanyType }>
): { core: number; operational: number } => {
  const core = companies.filter((c) => c.companyType === 'CORE_ESG_PLATFORM').length;
  const operational = companies.filter((c) => c.companyType === 'OPERATIONAL_ESG_ENABLER').length;
  
  return { core, operational };
};

/**
 * 마커 간 충돌 감지 (향후 자동 배치에 활용)
 */
export const checkCollision = (
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
  margin: number = 5
): boolean => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance < (r1 + r2 + margin);
};
