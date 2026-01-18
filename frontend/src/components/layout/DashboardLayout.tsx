'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function DashboardLayout({ children, rightSidebar }: DashboardLayoutProps) {
  const pathname = usePathname();
  // Dashboard Hero가 있는 페이지는 헤더를 투명하게 overlay 처리
  const isTransparentPage = pathname === '/dashboard';

  return (
    // 전체 화면 배경색 설정 (gray-50)
    <div className="flex flex-col min-h-screen bg-gray-50 relative">

      {/* 1. Global Header (Overlay or Sticky) */}
      <header
        className={cn(
          "w-full z-50 transition-all duration-300",
          isTransparentPage
            ? "fixed top-0 left-0 bg-transparent"
            : "sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100"
        )}
      >
        <GlobalHeader theme={isTransparentPage ? 'dark' : 'light'} />
      </header>

      {/* 2. 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col">

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <GlobalFooter />
      </div>

      {/* 3. Right Sidebar (Optional) - Fixed or Absolute depending on need */}
      {/* NOTE: With full-width hero, fixed sidebar might be tricky. Adjusted to hidden for now or overlay */}
      {rightSidebar && (
        <aside className="fixed right-0 top-20 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto hidden xl:block z-40 shadow-lg">
          {rightSidebar}
        </aside>
      )}

    </div>
  );
}