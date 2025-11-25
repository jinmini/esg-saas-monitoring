'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight,
} from 'lucide-react';

/**
 * 메인 대시보드 페이지
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        {/* 헤더 섹션 */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            SaaS Intelligence Platform
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            ESG 전문가를 위한 통합 인텔리전스 플랫폼입니다. 
          </p>
          <p className="text-lg text-gray-500 max-w-2xl">
          시장 동향 분석부터 AI 기반 업무 자동화까지 경험해보세요.
          </p>
        </div>

        {/* 기능 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* 1. Market Insight */}
          <DashboardCard 
            href="/market-insight"
            title="Market Insight"
            description="18개 ESG SaaS 기업의 실시간 뉴스를 모니터링하고, 언급량 트렌드를 분석합니다. 네이버 뉴스 API 기반 자동 크롤링으로 시장 동향을 놓치지 마세요."
            colorClass="text-blue-600 bg-blue-50"
            imageSrc="/market_insight.webp"
          />

          {/* 2. ESG Analysis */}
          <DashboardCard 
            href="/analysis"
            title="Analysis"
            description="97개 글로벌 ESG SaaS 기업을 인터랙티브 지도로 탐색하세요. 국가별, 서비스별 필터링과 상세 정보 패널로 경쟁사 분석을 한눈에 파악할 수 있습니다."
            colorClass="text-purple-600 bg-purple-50"
            imageSrc="/analysis_map.webp"
          />

          {/* 3. AI Features */}
          <DashboardCard 
            href="/ai-features"
            title="AI Features"
            description="Gemini AI 기반 ESG 보고서 자동 생성부터 탄소발자국 추정, 공급망 리스크 모니터링까지. AI Features를 확인하고 체험해보세요."
            colorClass="text-green-600 bg-green-50"
          />

        </div>
      </div>
    </DashboardLayout>
  );
}

// 대시보드 카드 컴포넌트
interface DashboardCardProps {
  href: string;
  title: string;
  description: string;
  colorClass: string;
  imageSrc?: string; // Optional: webp 이미지 경로
}

function DashboardCard({ href, title, description, colorClass, imageSrc }: DashboardCardProps) {
  return (
    <Link 
      href={href}
      className="group relative flex flex-col p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden"
    >
      {/* 배경 장식 (호버 시 나타남) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Explore 버튼 - 오른쪽 상단 */}
      <div className="absolute top-6 right-6 z-20 flex items-center text-sm font-semibold text-gray-400 group-hover:text-blue-600 transition-colors">
        <span className="mr-1.5">Explore</span>
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </div>
      
      {/* 컨텐츠 */}
      <div className="flex-1 flex flex-col z-10">
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors pr-20">
          {title}
        </h2>
        
        {/* 설명 */}
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          {description}
        </p>
        
        {/* 이미지 또는 Placeholder */}
        <div className="w-full rounded-lg overflow-hidden bg-gray-50/50">
          {imageSrc ? (
            <div className="relative w-full aspect-video">
              <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full min-h-[160px] border border-dashed border-gray-200 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">
                Image Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
