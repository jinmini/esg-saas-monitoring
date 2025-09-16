import { ArticleList } from '@/components/feed/ArticleList';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ESG SaaS 뉴스 모니터링
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ESG SaaS 기업들의 최신 뉴스를 실시간으로 모니터링하고 
          지속가능한 비즈니스 인사이트를 얻으세요.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <ArticleList pageSize={10} />
      </div>
    </div>
  );
}
