/**
 * MapTooltip Component (Rich Card Version)
 * 지도 마커 호버/선택 시 표시되는 상세 정보 카드
 * 
 * 기능:
 * - SVG foreignObject를 사용한 HTML 렌더링
 * - 단일 기업 vs 다수 기업(클러스터) 구분 렌더링
 * - 모든 상세 뷰(Europe, Asia, Oceania, NA) 지원
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, MapPin, ChevronRight, Building2, Globe } from 'lucide-react';
import { 
  useESGMapStore, 
  useCompanyCountByRegion, 
  useCompanyCountByCountry 
} from '@/store/esgMapStore';
import { 
  REGION_COORDS, 
  EUROPE_HUBS, 
  ASIA_HUBS,
  OCEANIA_HUBS,
  NORTH_AMERICA_HUBS,
  REGION_INFO, 
  COUNTRY_INFO,
  COLORS
} from '@/constants/esg-map';
import { calculateRadius } from '../utils/markerUtils';
import type { CountryCode, Company } from '@/types/esg-map';

// --- Helper Components ---

const TypeBadge = ({ type }: { type: string }) => {
  const isCore = type === 'CORE_ESG_PLATFORM';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
      isCore 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }`}>
      {isCore ? 'CORE' : 'OPS'}
    </span>
  );
};

export const MapTooltip = () => {
  const viewMode = useESGMapStore((state) => state.mapState.viewMode);
  const hoveredRegion = useESGMapStore((state) => state.mapState.hoveredRegion);
  const hoveredCountry = useESGMapStore((state) => state.mapState.hoveredCountry);
  const getCompaniesByCountry = useESGMapStore((state) => state.getCompaniesByCountry);
  
  const regionCounts = useCompanyCountByRegion();
  const countryCounts = useCompanyCountByCountry();

  // --- 1. 데이터 준비 ---
  let x = 0;
  let y = 0;
  let radius = 0;
  let isVisible = false;
  let contentNode: React.ReactNode = null;

  // 1-A. World View (Continent Tooltip)
  if (viewMode === 'world' && hoveredRegion) {
    const coords = REGION_COORDS[hoveredRegion];
    if (coords) {
      x = coords.x;
      y = coords.y;
      radius = coords.radius;
      
      const info = REGION_INFO[hoveredRegion];
      const count = regionCounts[hoveredRegion] || 0;
      
      isVisible = true;
      contentNode = (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-2xl mb-1">{info.emoji}</div>
          <div className="text-sm font-bold text-white mb-0.5">{info.nameLocal}</div>
          <div className="text-xs text-slate-400">{count} Companies</div>
        </div>
      );
    }
  } 
  // 1-B. Detail Views (Country Tooltip)
  else if (hoveredCountry) {
    let coords;
    // 뷰 모드에 따른 좌표 소스 선택
    if (viewMode === 'europe_detail') coords = EUROPE_HUBS[hoveredCountry];
    else if (viewMode === 'asia_detail') coords = ASIA_HUBS[hoveredCountry];
    else if (viewMode === 'oceania_detail') coords = OCEANIA_HUBS[hoveredCountry];
    else if (viewMode === 'north_america_detail') coords = NORTH_AMERICA_HUBS[hoveredCountry];

    if (coords) {
      x = coords.x;
      y = coords.y;
      const count = countryCounts[hoveredCountry] || 0;
      radius = calculateRadius(count, 12, 35);
      
      const info = COUNTRY_INFO[hoveredCountry];
      const companies = getCompaniesByCountry(hoveredCountry);
      
      isVisible = true;

      // --- Content Rendering Logic ---
      if (companies.length === 1) {
        // [Case 1] 단일 기업 상세 카드
        const company = companies[0];
        contentNode = (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-lg shadow-inner">
                  {/* 로고 대신 이모지/아이콘 */}
                  {info.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{company.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span>{company.headquarters.split(',')[0]}</span>
                  </div>
                </div>
              </div>
              <TypeBadge type={company.companyType} />
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-300 line-clamp-2 mb-3 leading-relaxed">
              {company.descriptionLocal || company.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-auto">
              {company.features.slice(0, 3).map(f => (
                <span key={f} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded border border-slate-700">
                  #{f.replace(/_/g, ' ').toLowerCase()}
                </span>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
              {company.websiteUrl && (
                <a 
                  href={company.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-[10px] text-white rounded transition-colors"
                >
                  <Globe size={12} /> Website
                </a>
              )}
              {/* <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-600 hover:bg-green-500 text-[10px] text-white rounded font-medium transition-colors shadow-lg shadow-green-900/20">
                View Details <ChevronRight size={12} />
              </button> */}
            </div>
          </div>
        );
      } else {
        // [Case 2] 다수 기업 리스트 프리뷰 (Cluster Card)
        contentNode = (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="text-lg">{info.emoji}</span>
                <span className="text-sm font-bold text-white">{info.nameLocal}</span>
              </div>
              <span className="text-xs font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                {count} Companies
              </span>
            </div>

            {/* List Preview */}
            <div className="flex-1 overflow-hidden space-y-1.5">
              {companies.slice(0, 3).map(company => (
                <div key={company.id} className="flex items-center justify-between bg-slate-700/30 p-1.5 rounded hover:bg-slate-700/50 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-green-400 transition-colors" />
                    <span className="text-xs text-slate-200 truncate">{company.name}</span>
                  </div>
                  <TypeBadge type={company.companyType} />
                </div>
              ))}
              {count > 3 && (
                <div className="text-[10px] text-slate-500 text-center pt-1">
                  + {count - 3} more companies...
                </div>
              )}
            </div>

            {/* Footer Action */}
            {/* <div className="mt-3 pt-2 border-t border-slate-700/50">
              <button className="w-full flex items-center justify-center gap-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-[10px] text-white rounded transition-colors">
                <Building2 size={12} /> View All Companies
              </button>
            </div> */}
          </div>
        );
      }
    }
  }

  if (!isVisible) return null;

  // 툴팁 스타일 상수
  const width = 260; // Card Width
  const height = 180; // Card Height (approx)
  
  // 위치 계산 (마커 위쪽 중앙)
  const tooltipX = x - width / 2;
  const tooltipY = y - radius - height - 15; // 마커 위 15px 간격

  return (
    <foreignObject
      x={tooltipX}
      y={tooltipY}
      width={width}
      height={height}
      style={{ overflow: 'visible', pointerEvents: 'none' }} // pointer-events-none for container
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="w-full h-full"
        >
          <div 
            className="w-full h-auto min-h-[140px] bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl p-4 flex flex-col relative pointer-events-auto"
            style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
          >
            {/* Content */}
            {contentNode}

            {/* Arrow (CSS Triangle) */}
            <div 
              className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-slate-800/95 border-r border-b border-slate-600/50 rotate-45"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </foreignObject>
  );
};
