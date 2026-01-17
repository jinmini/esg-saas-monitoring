'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScroll, useMotionValueEvent } from 'framer-motion';

// --- [Menu Data] ---
interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    href: '/landscape',
  },
  {
    id: 'data-hub',
    label: 'Data Hub',
    href: '/data-hub',
    subItems: [
      {
        id: 'kr-saas',
        label: 'KR SaaS',
        href: 'https://petalite-tuna-6c9.notion.site/Carbon-SaaS-253394aaa2f48027980efdc021952484',
        external: true,
      },
      {
        id: 'global-saas',
        label: 'Global SaaS',
        href: 'https://petalite-tuna-6c9.notion.site/World_ESG_SaaS-294394aaa2f4803f83c8dc9f8cb481b6',
        external: true,
      },
      {
        id: 'esg-calendar',
        label: 'ESG Calendar',
        href: 'https://petalite-tuna-6c9.notion.site/ESG-Calendar-2b6394aaa2f480c59b56c08bffc4c22f',
        external: true,
      },
    ],
  },
  {
    id: 'ai-features',
    label: 'AI Features',
    href: '/ai-features',
  },
  {
    id: 'resources',
    label: 'Resources',
    href: '/resources',
  },
];

export function GlobalHeader({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const pathname = usePathname();

  // Scroll-based shrink effect
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 여부에 따라 실제 적용할 테마 결정 (스크롤 시 무조건 light 스타일로 전환)
  const isDark = theme === 'dark';
  const currentIsDark = isDark && !isScrolled;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <div
      className={cn(
        "mx-auto transition-all duration-500 ease-out",
        // Responsive width with scroll animation
        isScrolled ? "max-w-5xl" : "max-w-7xl",
        // Horizontal margin for mobile
        "mx-4 md:mx-6 lg:mx-auto",
        // Vertical margin
        "my-4"
      )}
    >
      {/* Floating Bar Container */}
      <div
        className={cn(
          "flex items-center justify-between rounded-full shadow-lg transition-all duration-300",
          // Height with scroll animation
          isScrolled ? "h-[56px]" : "h-[62px]",
          // Responsive horizontal padding
          "px-4 md:px-6 lg:px-8",
          // Background based on theme and scroll state
          currentIsDark
            ? "bg-white/10 backdrop-blur-xl border border-white/20"
            : "bg-white/90 backdrop-blur-xl border border-gray-200"
        )}
      >

        <div className="flex items-center shrink-0">
          <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <span className={cn(
              "font-bold tracking-tight transition-all duration-300",
              currentIsDark ? "text-white" : "text-gray-900",
              isScrolled ? "text-base" : "text-lg"
            )}>
              ESG SIP
            </span>
          </Link>
        </div>

        {/* 2. Center: Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isMegaMenu = item.id === 'data-hub'; // Mega menu for Data Hub

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                    isActive
                      ? (currentIsDark ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900")
                      : (currentIsDark ? "text-gray-200 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                  )}
                >
                  {item.label}
                  {hasSubItems && <ChevronDown size={12} className={cn("mt-0.5 transition-transform group-hover:rotate-180", currentIsDark ? "text-gray-300" : "text-gray-400")} />}
                </Link>

                {/* Dropdown Menu - Mega or Simple */}
                {hasSubItems && (
                  isMegaMenu ? (
                    // Mega Menu for Market Insight
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[600px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-2 gap-6 p-6">

                          {/* Left Column: Links */}
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-blue-500" />
                              Data Sources
                            </div>

                            <Link
                              href="https://petalite-tuna-6c9.notion.site/Carbon-SaaS-253394aaa2f48027980efdc021952484"
                              target="_blank"
                              className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover/item:bg-blue-100 transition-colors">
                                  <span className="text-lg">🇰🇷</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm mb-0.5">KR SaaS Market</div>
                                  <div className="text-xs text-gray-500 line-clamp-2">127개 국내 ESG SaaS 기업 분석</div>
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="https://petalite-tuna-6c9.notion.site/World_ESG_SaaS-294394aaa2f4803f83c8dc9f8cb481b6"
                              target="_blank"
                              className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover/item:bg-green-100 transition-colors">
                                  <span className="text-lg">🌍</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm mb-0.5">Global SaaS</div>
                                  <div className="text-xs text-gray-500 line-clamp-2">글로벌 ESG 시장 현황 및 트렌드</div>
                                </div>
                              </div>
                            </Link>

                            <Link
                              href="https://petalite-tuna-6c9.notion.site/ESG-Calendar-2b6394aaa2f480c59b56c08bffc4c22f"
                              target="_blank"
                              className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover/item:bg-purple-100 transition-colors">
                                  <span className="text-lg">📅</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm mb-0.5">ESG Calendar</div>
                                  <div className="text-xs text-gray-500 line-clamp-2">규제 일정 및 주요 이벤트</div>
                                </div>
                              </div>
                            </Link>
                          </div>

                          {/* Right Column: Featured Card */}
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 flex flex-col justify-between">
                            <div>
                              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Featured</div>
                              <h4 className="font-bold text-gray-900 mb-2 text-sm">2025 ESG SaaS Trends</h4>
                              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                AI 기반 ESG 분석 도구가 시장을 주도하고 있습니다. 최신 리포트를 확인하세요.
                              </p>
                            </div>
                            <Link
                              href="/data-hub"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              Read More
                              <ArrowRight size={12} />
                            </Link>
                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    // Simple Dropdown for other menus
                    <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                        {item.subItems!.map((sub) => (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            target={sub.external ? "_blank" : undefined}
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </nav>

        {/* 3. Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-2 rounded-full transition-colors hidden sm:block",
              currentIsDark ? "text-gray-300 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            )}
            title="View Source Code"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}