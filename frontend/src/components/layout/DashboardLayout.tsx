'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';

interface DashboardLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function DashboardLayout({ children, rightSidebar }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 좌측 사이드바 */}
      <Sidebar />
      
      {/* 메인 영역 (Header + Content + Footer) */}
      <div className="flex-1 flex flex-col">
        {/* Global Header */}
        <GlobalHeader />
        
        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 flex">
          {/* 중앙 메인 콘텐츠 */}
          <div className="flex-1 bg-white">
            {children}
          </div>
          
          {/* 우측 위젯 영역 */}
          {rightSidebar && (
            <aside className="w-80 bg-white border-l border-gray-200">
              {rightSidebar}
            </aside>
          )}
        </main>
        
        {/* Global Footer */}
        <GlobalFooter />
      </div>
    </div>
  );
}
