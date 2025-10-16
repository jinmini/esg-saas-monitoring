// src/app/(main)/dashboard/page.tsx

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

/**
 * 메인 대시보드 페이지
 * 
 * 플랫폼의 허브 역할을 하며, 각 핵심 기능으로 사용자를 안내합니다.
 * 향후 이 페이지는 개인화된 요약 정보(최근 문서, 알림 등)를 표시하게 됩니다.
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ESG SIP
          </h1>
          <p className="text-lg text-gray-600">
            SaaS Intelligence Platform for ESG Professionals.
          </p>
        </div>

        {/* 핵심 기능 바로가기 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Report Editor 카드 */}
          <Link href="/editor/dashboard">
            <Card className="hover:border-green-500 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileText className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <CardTitle>Report Editor</CardTitle>
                    <CardDescription>지속가능경영보고서 작성</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  최근 작업한 문서를 확인하거나, 새로운 보고서 작성을 시작하세요.
                </p>
                <Button>Go to Editor</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Market Insight 카드 */}
          <Link href="/market-insight">
            <Card className="hover:border-blue-500 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <CardTitle>Market Insight</CardTitle>
                    <CardDescription>시장 동향 및 뉴스 분석</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  최신 ESG 관련 뉴스와 시장의 움직임을 추적하세요.
                </p>
                <Button variant="secondary">View Insights</Button>
              </CardContent>
            </Card>
          </Link>

          {/* ESG Analysis 카드 */}
          <Link href="/analysis">
            <Card className="hover:border-purple-500 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle>ESG Analysis</CardTitle>
                    <CardDescription>캘린더 및 중요 일정</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  주요 ESG 공시 일정과 이벤트를 캘린더에서 관리하세요.
                </p>
                <Button variant="secondary">Open Calendar</Button>
              </CardContent>
            </Card>
          </Link>

        </div>
      </div>
    </DashboardLayout>
  );
}