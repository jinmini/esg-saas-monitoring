// src/app/page.tsx

import { redirect } from 'next/navigation';

/**
 * 루트 페이지 ( / )
 * 
 * 현재 개발 단계에서는 별도의 인증 절차 없이,
 * 모든 사용자를 메인 대시보드 페이지(/dashboard)로 즉시 리다이렉트합니다.
 */
export default function RootPage() {
  // 사용자가 루트 URL('/')에 접속하면,
  // 즉시 '/dashboard' 경로로 이동시킵니다.
  redirect('/dashboard');

  // redirect()가 호출되면 이 컴포넌트는 렌더링을 중단하고 리다이렉션 응답을 보냅니다.
  // 따라서 아래 내용은 실제로 사용자에게 보이지 않습니다.
  return null; 
}