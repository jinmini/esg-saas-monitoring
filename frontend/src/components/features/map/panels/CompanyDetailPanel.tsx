/**
 * CompanyDetailPanel
 * 기업 상세 정보를 보여주는 우측 슬라이드 패널 (Drawer)
 * 
 * Design: Glassmorphism & Hero Header
 * Features: List View & Detail View
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Building2, Tag, BookOpen, Award, MapPin, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useESGMapStore, useFilteredCompanies } from '@/store/esgMapStore';
import { COLORS, COUNTRY_INFO } from '@/constants/esg-map';
import type { CountryCode } from '@/types/esg-map';

export const CompanyDetailPanel: React.FC = () => {
  const { isOpen, mode, targetCountry } = useESGMapStore((state) => state.panelState.rightPanel);
  const selectedCompany = useESGMapStore((state) => state.mapState.selectedCompany);
  const setSelectedCompany = useESGMapStore((state) => state.setSelectedCompany);
  const closeRightPanel = useESGMapStore((state) => state.closeRightPanel);
  const openRightPanel = useESGMapStore((state) => state.openRightPanel);
  
  // 국가별 기업 목록 (List View용)
  const filteredCompanies = useFilteredCompanies();
  const countryCompanies = React.useMemo(() => {
    if (!targetCountry) return [];
    return filteredCompanies.filter(c => c.countryCode === targetCountry);
  }, [filteredCompanies, targetCountry]);

  // 패널이 닫혀있으면 렌더링 안함
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute top-4 right-4 bottom-4 w-[420px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl z-[2000] overflow-hidden flex flex-col"
        >
          {/* =================================================================
             [Mode A] List View (국가별 기업 목록)
             ================================================================= */}
          {mode === 'list' && targetCountry && (
            <>
              {/* List Header */}
              <div className="relative p-6 pb-4 border-b border-gray-200 bg-gray-50">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{COUNTRY_INFO[targetCountry]?.emoji}</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {COUNTRY_INFO[targetCountry]?.nameLocal}
                        </h2>
                        <span className="text-sm text-gray-600">
                          {countryCompanies.length} Companies
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeRightPanel}
                      className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                 </div>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                {countryCompanies.map((company) => {
                   const isCore = company.companyType === 'CORE_ESG_PLATFORM';
                   return (
                     <div 
                       key={company.id}
                       onClick={() => setSelectedCompany(company)} // 상세 보기로 전환
                       className="relative p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 rounded-xl cursor-pointer transition-all group overflow-hidden shadow-sm hover:shadow-md"
                     >
                       {/* Affordance: Right Arrow */}
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <ChevronRight size={20} />
                       </div>

                       <div className="flex justify-between items-start mb-2 pr-6">
                         <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                           {company.name}
                         </h3>
                         {isCore && (
                           <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded border border-green-300">
                             Core
                           </span>
                         )}
                       </div>
                       <p className="text-xs text-gray-600 line-clamp-2 mb-3 pr-4">
                         {company.description}
                       </p>
                       <div className="flex items-center gap-2">
                         {company.features.slice(0, 2).map((f, i) => (
                           <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-[10px] text-gray-700 border border-gray-200">
                             #{f.replace(/_/g, ' ')}
                           </span>
                         ))}
                         {company.features.length > 2 && (
                           <span className="text-[10px] text-gray-500">+{company.features.length - 2}</span>
                         )}
                       </div>
                     </div>
                   );
                })}
              </div>
            </>
          )}

          {/* =================================================================
             [Mode B] Detail View (기업 상세 정보)
             ================================================================= */}
          {mode === 'detail' && selectedCompany && (
            <>
              {/* 1. Hero Header */}
              <div className="relative p-6 pb-8 overflow-hidden shrink-0">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'from-green-50' : 'from-blue-50'} to-transparent`} />
                
                <div className="relative z-10">
                  {/* Navigation Bar (List Mode에서 진입 시) */}
                  {targetCountry && (
                    <button
                      onClick={() => openRightPanel('list', targetCountry)}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 mb-3 transition-colors group"
                    >
                      <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                      Back to list
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {/* Logo Placeholder */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white backdrop-blur-md border ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'border-green-200' : 'border-blue-200'} shadow-md`}>
                        <Building2 size={28} className={selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'text-green-600' : 'text-blue-600'} />
                      </div>
                    </div>
                    
                    {/* Close Button */}
                    <button
                      onClick={closeRightPanel}
                      className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
                    {selectedCompany.name}
                  </h2>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                      <span className="text-lg">{COUNTRY_INFO[selectedCompany.countryCode as CountryCode]?.emoji || '🌍'}</span>
                      <span className="font-medium">{selectedCompany.country}</span>
                    </span>
                    {selectedCompany.headquarters && (
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <MapPin size={14} />
                        {selectedCompany.headquarters}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
                {/* Type & Website */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Type</span>
                    <span className={`text-sm font-bold ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'text-green-600' : 'text-blue-600'}`}>
                      {selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'Core ESG Platform' : 'Operational Enabler'}
                    </span>
                  </div>
                  {selectedCompany.websiteUrl && (
                    <a
                      href={selectedCompany.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-900 transition-all group font-medium"
                    >
                      <span>Visit Website</span>
                      <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>

                {/* About */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedCompany.description}
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-amber-600" />
                    Key Capabilities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.features.map((feature, idx) => {
                      const isPrimary = idx < 3;
                      const isCore = selectedCompany.companyType === 'CORE_ESG_PLATFORM';
                      return (
                        <span
                          key={idx}
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-default border
                            ${isPrimary 
                              ? isCore 
                                ? 'bg-green-50 border-green-300 text-green-700' 
                                : 'bg-blue-50 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-300 text-gray-700'}
                          `}
                        >
                          {feature.replace(/_/g, ' ')}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Frameworks */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    Supported Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.frameworks.map((fw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-300 rounded-lg text-xs text-indigo-700 font-medium"
                      >
                        {fw.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Insight & Stats */}
                <div className="grid grid-cols-1 gap-4">
                  {selectedCompany.analysisNotes && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-300">
                      <h3 className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <Award size={14} />
                        AI Insight
                      </h3>
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{selectedCompany.analysisNotes}"
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <Building2 size={14} />
                        <span className="text-xs font-medium">Employees</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCompany.employeeCount || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">Funding</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCompany.fundingStage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 bg-gray-50 backdrop-blur-md border-t border-gray-200 flex gap-3 shrink-0">
                <button className="flex-1 py-3 bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400">
                  + 비교함 담기
                </button>
                <button className={`flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  상세 리포트 보기
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
