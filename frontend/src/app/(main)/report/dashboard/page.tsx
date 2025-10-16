'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ReportDashboard } from '@/components/features/report-dashboard';

/**
 * 보고서 대시보드 페이지
 * - 경로: /report/dashboard
 * - 사용자의 모든 보고서를 표시하고 관리
 */
export default function ReportDashboardPage() {
  return (
    <DashboardLayout>
      <ReportDashboard />
    </DashboardLayout>
  );
}

