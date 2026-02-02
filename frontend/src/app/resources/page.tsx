import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ResourceSection } from '@/components/features/dashboard/ResourceSection';
import { BlogSection } from '@/components/features/resources/BlogSection';
import { getAllResources } from '@/lib/mdx';

export default async function ResourcesPage() {
    const allResources = await getAllResources();
    const books = allResources.filter(r => r.externalUrl);
    const articles = allResources.filter(r => !r.externalUrl);

    return (
        <DashboardLayout>
            {/* 1. Featured E-Books Section (Top 3) */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <ResourceSection initialResources={books} />
            </div>

            {/* 2. Blog List Section (All Articles) */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <BlogSection initialResources={articles} />
            </div>
        </DashboardLayout>
    );
}
