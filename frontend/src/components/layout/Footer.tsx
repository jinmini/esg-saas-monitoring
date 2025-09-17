import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ESG News Monitor
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              ESG SaaS 기업들의 최신 뉴스를 실시간으로 모니터링하고 분석하는 플랫폼입니다.
              지속가능한 비즈니스 인사이트를 제공합니다.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              서비스
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  뉴스 피드
                </Link>
              </li>
              <li>
                <span className="text-gray-400">검색 (곧 출시)</span>
              </li>
              <li>
                <span className="text-gray-400">북마크 (곧 출시)</span>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              정보
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">회사 소개 (곧 출시)</span>
              </li>
              <li>
                <span className="text-gray-400">이용약관 (곧 출시)</span>
              </li>
              <li>
                <span className="text-gray-400">개인정보처리방침 (곧 출시)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">
            © 2024 ESG News Monitor. All rights reserved. Sprint 2 - Public Beta
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-xs text-gray-500">
              Powered by Next.js 15 & TailwindCSS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
