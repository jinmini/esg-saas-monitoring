'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Calendar as CalendarIcon,
  Globe,
  TrendingUp,
} from 'lucide-react';

export function DashboardBentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-20 auto-rows-[180px]">

      {/* 1. [Large] Interactive Map (Analysis) - 가장 중요한 기능 강조 (2x2) */}
      <BentoCard
        href="/landscape"
        className="md:col-span-2 lg:col-span-2 row-span-2 group relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          {/* 지도 이미지 (실제로는 Mapbox/Leaflet 캡처본 사용 추천) */}
          <Image
            src="/analysis_map.webp" // 기존 이미지 활용
            alt="Interactive Map"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/10">
            <Globe size={20} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Global SaaS Map</h3>
          <p className="text-gray-200 text-sm leading-relaxed max-w-sm mb-4">
            106개 기업의 본사 위치와 규제 현황을<br />
            인터랙티브 지도로 탐색하세요.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-300">
            <span>Explore Region</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </BentoCard>

      {/* 2. [Tall] Market Insight (News) - 리스트형 정보 (1x2) */}
      <BentoCard
        href="/data-hub"
        className="md:col-span-1 lg:col-span-1 row-span-2 bg-white border border-gray-200"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">Market Insight</h3>
          <p className="text-sm text-gray-500 mb-6">실시간 트렌드 분석</p>

          {/* 미니 뉴스 리스트 위젯 */}
          <div className="flex-1 space-y-4 overflow-hidden mask-bottom-fade">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group/item cursor-pointer">
                <div className="text-xs text-gray-400 mb-1">2h ago</div>
                <div className="text-sm font-medium text-gray-800 leading-snug group-hover/item:text-blue-600 transition-colors line-clamp-2">
                  Salesforce updates Net Zero Cloud with new AI features...
                </div>
              </div>
            ))}
          </div>
        </div>
      </BentoCard>

      {/* 3. [Square] AI Features (1x1) */}
      <BentoCard
        href="/ai-features"
        className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border border-gray-700"
      >
        <div className="p-5 h-full flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

          <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center border border-gray-600">
            <Bot size={18} className="text-purple-400" />
          </div>

          <div>
            <h3 className="text-base font-bold mb-1">AI Analyst</h3>
            <p className="text-xs text-gray-400">Generate Reports</p>
          </div>

          <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={18} className="text-gray-400" />
          </div>
        </div>
      </BentoCard>

      {/* 4. [Square] Calendar Widget (1x1) */}
      <BentoCard
        href="https://petalite-tuna-6c9.notion.site/ESG-Calendar-2b6394aaa2f480c59b56c08bffc4c22f"
        className="bg-white border border-gray-200"
      >
        <div className="p-5 h-full flex flex-col justify-between">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <CalendarIcon size={18} className="text-orange-600" />
          </div>

          <div>
            <div className="text-2xl font-bold text-gray-900">
              {new Date().getDate()}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              {new Date().toLocaleDateString('en-US', { month: 'long' })}, Today
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-gray-600 truncate font-medium">IFRS S1/S2 Disclosure</span>
          </div>
        </div>
      </BentoCard>

    </div>
  );
}

// Helper Component
function BentoCard({
  children,
  className = "",
  href
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`
        block rounded-3xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
