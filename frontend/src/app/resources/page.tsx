import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceSection } from '@/components/features/dashboard/ResourceSection';
import { getAllResources } from '@/lib/mdx';
import { BookOpen, Search } from 'lucide-react';

export default async function ResourcesPage() {
    const resources = await getAllResources();

    return (
        <DashboardLayout>
            {/* 1. Resources Hero Section */}
            <section className="bg-gray-900 pt-32 pb-24 px-6 overflow-hidden relative">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-300 text-sm font-bold mb-8 animate-fade-in">
                        <BookOpen size={16} />
                        <span>KNOWLEDGE BASE</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        ESG 리소스 라이브러리 <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            전문가 급 인사이트
                        </span>를 확인하세요
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        글로벌 ESG 규제, 최신 테크 트렌드, 그리고 실무 가이드까지 <br />
                        당신의 ESG 역량을 높여줄 모든 자료가 준비되어 있습니다.
                    </p>

                    {/* Simple Search Input (Visual Placeholder) */}
                    <div className="max-w-xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center text-gray-400 group-focus-within:text-blue-400 transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="찾으시는 주제나 규제를 검색해보세요..."
                            className="w-full h-16 pl-14 pr-6 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-sm"
                        />
                    </div>
                </div>
            </section>

            {/* 2. Resources List Section */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <ResourceSection initialResources={resources} />
            </div>

        </DashboardLayout>
    );
}
