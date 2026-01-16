// src/data/resources.ts

export interface ResourceItem {
    id: number;
    category: string;
    title: string;
    description: string;
    imageSrc: string;
    href: string;
  }
  
  export const RESOURCE_DATA: ResourceItem[] = [
    {
      id: 1,
      category: "eBook",
      title: "A Controller’s Guide to Climate & ESG Reporting",
      description: "재무 관리자가 ESG 리포팅을 주도하는 방법과 감사 준비가 된 기후 데이터를 확보하는 전략을 알아보세요.",
      imageSrc: "https://cdn.prod.website-files.com/63da85bd0e39561929afa031/675ca9ae10e2d682fc21ceb7_psfi__web-image__expub__esg-controllership-ebook__en.png",
      href: "/resources/guide-to-climate"
    },
    {
      id: 2,
      category: "Whitepaper",
      title: "2025 ESG Tech Trends & AI Integration",
      description: "AI 기술이 ESG 데이터 관리와 공급망 실사(Due Diligence)를 어떻게 혁신하고 있는지 분석한 심층 보고서입니다.",
      imageSrc: "https://placehold.co/600x800/2563eb/ffffff?text=ESG+Trends",
      href: "/resources/2025-trends"
    },
    {
      id: 3,
      category: "Case Study",
      title: "Global Supply Chain: Net-Zero Strategies",
      description: "글로벌 제조 기업들이 Scope 3 배출량을 줄이기 위해 도입한 성공적인 전략과 실제 사례를 확인하세요.",
      imageSrc: "https://placehold.co/600x800/10b981/ffffff?text=Net-Zero",
      href: "/resources/net-zero-strategies"
    }
  ];