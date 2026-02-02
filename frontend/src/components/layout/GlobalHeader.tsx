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
  description?: string; // Added description
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
        label: 'KR SaaS Market',
        href: 'https://petalite-tuna-6c9.notion.site/Carbon-SaaS-253394aaa2f48027980efdc021952484',
        description: '국내 ESG SaaS 기업 분석',
        external: true,
      },
      {
        id: 'global-saas',
        label: 'Global SaaS',
        href: 'https://petalite-tuna-6c9.notion.site/World_ESG_SaaS-294394aaa2f4803f83c8dc9f8cb481b6',
        description: '글로벌 ESG 시장 현황 및 트렌드',
        external: true,
      },
      {
        id: 'esg-calendar',
        label: 'ESG Calendar',
        href: 'https://petalite-tuna-6c9.notion.site/ESG-Calendar-2b6394aaa2f480c59b56c08bffc4c22f',
        description: '규제 일정 및 주요 이벤트',
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
        "mx-3 md:mx-4 lg:mx-auto",
        // Vertical margin
        "my-2"
      )}
    >
      {/* Floating Bar Container */}
      <div
        className={cn(
          "flex items-center justify-between rounded-full shadow-lg transition-all duration-300",
          // Height with scroll animation
          isScrolled ? "h-[46px]" : "h-[52px]",
          // Responsive horizontal padding
          "px-4 md:px-6 lg:px-8",
          // Background based on theme and scroll state
          currentIsDark
            ? "bg-white/10 backdrop-blur-xl border border-white/10"
            : "bg-white/90 backdrop-blur-xl border-none shadow-sm"
        )}
      >

        <div className="flex items-center shrink-0">
          <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
            <span className={cn(
              "font-bold tracking-tight transition-all duration-300",
              currentIsDark ? "text-white" : "text-gray-900",
              isScrolled ? "text-sm" : "text-base"
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

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-all duration-200",
                    isActive
                      ? (currentIsDark ? "bg-white/20 text-white" : "bg-gray-100 text-gray-900")
                      : (currentIsDark ? "text-gray-200 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50")
                  )}
                >
                  {item.label}
                  {hasSubItems && <ChevronDown size={12} className={cn("mt-0.5 transition-transform group-hover:rotate-180", currentIsDark ? "text-gray-300" : "text-gray-400")} />}
                </Link>

                {/* Dropdown Menu - Rive Style Clean Columns */}
                {hasSubItems && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-[560px] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden p-1 ring-1 ring-black/5">
                      <div className="bg-white/50 rounded-xl p-1.5">
                        <div className="grid grid-cols-3 gap-2">
                          {item.subItems!.map((sub) => {
                            let icon = null;
                            if (sub.id === 'kr-saas') icon = '🇰🇷';
                            if (sub.id === 'global-saas') icon = '🌍';
                            if (sub.id === 'esg-calendar') icon = '📅';

                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                target={sub.external ? "_blank" : undefined}
                                className="group/item flex flex-col items-start gap-1 p-2.5 rounded-lg hover:bg-white/80 transition-colors"
                              >
                                {/* Header: Icon + Title */}
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  {icon && <span className="text-base">{icon}</span>}
                                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest group-hover/item:text-[#0a39c3] transition-colors">
                                    {sub.label}
                                  </span>
                                </div>

                                {/* Description */}
                                <p className="text-[11px] text-gray-500 leading-snug font-medium">
                                  {sub.description}
                                </p>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* 3. Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://github.com/jinmini/esg-saas-monitoring"
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