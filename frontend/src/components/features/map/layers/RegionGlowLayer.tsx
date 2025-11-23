/**
 * Region Glow Layer Component
 * 마커 레이어 (조건부 렌더링)
 * 
 * 기능:
 * - viewMode === 'world' → RegionMarker (대륙)
 * - viewMode === 'europe_detail' → CountryMarker (국가)
 * - SVG filter 정의 (glow 효과)
 */

'use client';

import React from 'react';
import { RegionMarker } from '../markers/RegionMarker';
import { CountryMarker } from '../markers/CountryMarker';
import { 
  REGION_COORDS, 
  EUROPE_HUBS,
  ASIA_HUBS,
  OCEANIA_HUBS,
  NORTH_AMERICA_HUBS
} from '@/constants/esg-map';
import { useESGMapStore, useCompanyCountByRegion } from '@/store/esgMapStore';
import type { CountryCode, Region } from '@/types/esg-map';

/**
 * 마커 레이어 컴포넌트
 */
export const RegionGlowLayer: React.FC = () => {
  const viewMode = useESGMapStore((state) => state.mapState.viewMode);
  const regionCounts = useCompanyCountByRegion();
  const getCompaniesByCountry = useESGMapStore((state) => state.getCompaniesByCountry);

  return (
    <g id="region-glow-layer">
      {/* SVG Filter 정의 */}
      <defs>
        <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 조건부 렌더링: viewMode에 따라 마커 타입 결정 */}
      {viewMode === 'world' ? (
        // ===== 세계 지도 뷰: 대륙 마커 =====
        <>
          {(Object.entries(REGION_COORDS) as [Region, typeof REGION_COORDS[Region]][]).map(
            ([region, coords]) => {
              const count = regionCounts[region] || 0;
              return (
                <RegionMarker
                  key={region}
                  region={region}
                  coords={coords}
                  count={count}
                />
              );
            }
          )}
        </>
      ) : viewMode === 'europe_detail' ? (
        // ===== 유럽 확대 뷰: 국가 마커 =====
        <>
          {(Object.entries(EUROPE_HUBS) as [string, typeof EUROPE_HUBS[string]][]).map(
            ([country, coords]) => {
              const companies = getCompaniesByCountry(country as CountryCode);
              return (
                <CountryMarker
                  key={country}
                  country={country as CountryCode}
                  coords={coords}
                  companies={companies}
                />
              );
            }
          )}
        </>
      ) : viewMode === 'asia_detail' ? (
        // ===== 아시아 확대 뷰: 국가 마커 =====
        <>
          {(Object.entries(ASIA_HUBS) as [string, typeof ASIA_HUBS[string]][]).map(
            ([country, coords]) => {
              const companies = getCompaniesByCountry(country as CountryCode);
              return (
                <CountryMarker
                  key={country}
                  country={country as CountryCode}
                  coords={coords}
                  companies={companies}
                />
              );
            }
          )}
        </>
      ) : viewMode === 'oceania_detail' ? (
        // ===== 오세아니아 확대 뷰: 국가 마커 =====
        <>
          {(Object.entries(OCEANIA_HUBS) as [string, typeof OCEANIA_HUBS[string]][]).map(
            ([country, coords]) => {
              const companies = getCompaniesByCountry(country as CountryCode);
              return (
                <CountryMarker
                  key={country}
                  country={country as CountryCode}
                  coords={coords}
                  companies={companies}
                />
              );
            }
          )}
        </>
      ) : viewMode === 'north_america_detail' ? (
        // ===== 북미 확대 뷰: 국가 마커 =====
        <>
          {(Object.entries(NORTH_AMERICA_HUBS) as [string, typeof NORTH_AMERICA_HUBS[string]][]).map(
            ([country, coords]) => {
              const companies = getCompaniesByCountry(country as CountryCode);
              return (
                <CountryMarker
                  key={country}
                  country={country as CountryCode}
                  coords={coords}
                  companies={companies}
                />
              );
            }
          )}
        </>
      ) : null}
    </g>
  );
};

