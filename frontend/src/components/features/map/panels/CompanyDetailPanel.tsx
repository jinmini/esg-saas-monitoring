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
          className="absolute top-4 right-4 bottom-4 w-[420px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-[2000] overflow-hidden flex flex-col"
        >
          {/* =================================================================
             [Mode A] List View (국가별 기업 목록)
             ================================================================= */}
          {mode === 'list' && targetCountry && (
            <>
              {/* List Header */}
              <div className="relative p-6 pb-4 border-b border-slate-700/50 bg-slate-900/50">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{COUNTRY_INFO[targetCountry]?.emoji}</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {COUNTRY_INFO[targetCountry]?.nameLocal}
                        </h2>
                        <span className="text-sm text-slate-400">
                          {countryCompanies.length} Companies
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={closeRightPanel}
                      className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
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
                       className="relative p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl cursor-pointer transition-all group overflow-hidden"
                     >
                       {/* Affordance: Right Arrow */}
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <ChevronRight size={20} />
                       </div>

                       <div className="flex justify-between items-start mb-2 pr-6">
                         <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                           {company.name}
                         </h3>
                         {isCore && (
                           <span className="px-1.5 py-0.5 bg-transparent text-green-400 text-[10px] font-bold uppercase rounded border border-green-500/50">
                             Core
                           </span>
                         )}
                       </div>
                       <p className="text-xs text-slate-400 line-clamp-2 mb-3 pr-4">
                         {company.description}
                       </p>
                       <div className="flex items-center gap-2">
                         {company.features.slice(0, 2).map((f, i) => (
                           <span key={i} className="px-2 py-1 bg-slate-900 rounded-md text-[10px] text-slate-500 border border-slate-800">
                             #{f.replace(/_/g, ' ')}
                           </span>
                         ))}
                         {company.features.length > 2 && (
                           <span className="text-[10px] text-slate-600">+{company.features.length - 2}</span>
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
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'from-green-900/40' : 'from-blue-900/40'} to-transparent opacity-50`} />
                
                <div className="relative z-10">
                  {/* Navigation Bar (List Mode에서 진입 시) */}
                  {targetCountry && (
                    <button
                      onClick={() => openRightPanel('list', targetCountry)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white mb-3 transition-colors group"
                    >
                      <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                      Back to {COUNTRY_INFO[targetCountry]?.nameLocal} List
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {/* Logo Placeholder */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-800/50 backdrop-blur-md border ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'border-green-500/30' : 'border-blue-500/30'} shadow-lg`}>
                        <Building2 size={28} className={selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'text-green-400' : 'text-blue-400'} />
                      </div>
                    </div>
                    
                    {/* Close Button */}
                    <button
                      onClick={closeRightPanel}
                      className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <h2 className="text-3xl font-bold text-white leading-tight mb-2 tracking-tight">
                    {selectedCompany.name}
                  </h2>
                  
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      <span className="text-lg">{COUNTRY_INFO[selectedCompany.countryCode as CountryCode]?.emoji || '🌍'}</span>
                      <span className="font-medium">{selectedCompany.country}</span>
                    </span>
                    {selectedCompany.headquarters && (
                      <span className="flex items-center gap-1.5 text-slate-400">
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
                <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Type</span>
                    <span className={`text-sm font-bold ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'text-green-400' : 'text-blue-400'}`}>
                      {selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'Core ESG Platform' : 'Operational Enabler'}
                    </span>
                  </div>
                  {selectedCompany.websiteUrl && (
                    <a
                      href={selectedCompany.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-200 transition-all group"
                    >
                      <span>Visit Website</span>
                      <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>

                {/* About */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">About</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {selectedCompany.description}
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-amber-400" />
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
                              ? `bg-${isCore ? 'green' : 'blue'}-500/10 border-${isCore ? 'green' : 'blue'}-500/30 text-${isCore ? 'green' : 'blue'}-300`
                              : 'bg-slate-800/50 border-slate-700 text-slate-400'}
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
                  <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    Supported Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.frameworks.map((fw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-xs text-indigo-300"
                      >
                        {fw.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Insight & Stats */}
                <div className="grid grid-cols-1 gap-4">
                  {selectedCompany.analysisNotes && (
                    <div className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20">
                      <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <Award size={14} />
                        AI Insight
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{selectedCompany.analysisNotes}"
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <Building2 size={14} />
                        <span className="text-xs font-medium">Employees</span>
                      </div>
                      <p className="text-lg font-bold text-white">{selectedCompany.employeeCount || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-1 text-slate-500">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">Funding</span>
                      </div>
                      <p className="text-lg font-bold text-white">{selectedCompany.fundingStage || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 flex gap-3 shrink-0">
                <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-all border border-slate-600 hover:border-slate-500">
                  + 비교함 담기
                </button>
                <button className={`flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-lg ${selectedCompany.companyType === 'CORE_ESG_PLATFORM' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'}`}>
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
