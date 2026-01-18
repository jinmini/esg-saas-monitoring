export interface ResourceItem {
  id: string;
  title: string;
  category: string; // 예: "Regulation", "Insights", "Tech" (탭에 들어갈 내용)
  date: string;     // 예: "Mar 10, 2024" (본문에 들어갈 내용)
  imageSrc: string;
  href: string;
}

export const resources: ResourceItem[] = [
  {
    id: '1',
    title: 'A Controller’s Guide to Climate & ESG Reporting',
    category: 'Regulation', // 로고 대신 탭에 표시됨
    date: 'Mar 15, 2024',   // [eBook] 대신 표시됨
    imageSrc: '/images/report-cover-1.jpg', // 실제 이미지 경로로 수정 필요
    href: '/resources/guide-1',
  },
  {
    id: '2',
    title: 'The Future of ESG Data Management',
    category: 'Tech',
    date: 'Feb 28, 2024',
    imageSrc: '/images/report-cover-2.jpg',
    href: '/resources/guide-2',
  },
  {
    id: '3',
    title: 'Global Sustainability Insights 2024',
    category: 'Insights',
    date: 'Jan 10, 2024',
    imageSrc: '/images/report-cover-3.jpg',
    href: '/resources/guide-3',
  },
];