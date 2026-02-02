'use client';

import { BlogCard } from './BlogCard';
import { ResourceMetadata } from '@/types/resource';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Categories Definition
const CATEGORIES = [
    { name: 'All', href: '/resources' },
    { name: 'Regulation', href: '/resources/regulation' },
    { name: 'Insights', href: '/resources/insights' },
    { name: 'Tech', href: '/resources/tech' },
];

interface BlogSectionProps {
    initialResources: ResourceMetadata[];
}

export function BlogSection({ initialResources }: BlogSectionProps) {
    const [activeTab, setActiveTab] = useState('All');

    const filteredResources = activeTab === 'All'
        ? initialResources
        : initialResources.filter(r => r.category === activeTab);

    return (
        <section className="py-12">

            {/* 1. Header & Filtering (Refined Style) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-gray-200 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Latest Insights
                    </h2>
                    <p className="text-sm font-medium text-gray-400 mt-2">
                        Discover {filteredResources.length} expert articles on ESG
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.name}
                            onClick={() => setActiveTab(category.name)}
                            className={cn(
                                "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                activeTab === category.name
                                    ? "bg-[#0a39c3] text-white shadow-lg shadow-blue-100"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Blog List (Vertical Stack) */}
            <div className="flex flex-col border-b border-gray-200">
                {filteredResources.map((resource) => (
                    <BlogCard key={resource.slug} data={resource} />
                ))}
            </div>

        </section>
    );
}
