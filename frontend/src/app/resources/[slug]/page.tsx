import { getResourceBySlug, getAllResources } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { MDXComponents } from '@/components/mdx/MDXComponents';

interface ResourcePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateStaticParams() {
    const resources = await getAllResources();
    return resources.map((resource) => ({
        slug: resource.slug,
    }));
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
    const { slug } = await params;
    const resource = await getResourceBySlug(slug);

    if (!resource) {
        notFound();
    }

    const { metadata, content } = resource;

    return (
        <DashboardLayout>
            <article className="min-h-screen bg-white font-sans pb-32 pt-6">

                {/* 1. Insight Hero (Wide Image + Labels/Tags) */}
                <section className="insight-hero w-full max-w-[1200px] mx-auto px-6 mb-12 animate-slide-up">
                    <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-sm mb-6">
                        <Image
                            src={metadata.imageSrc}
                            alt={metadata.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                            priority
                        />
                    </div>

                    {/* Hero Labels & Tags (Aligned with Image) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3 text-sm tracking-tight">
                            <span className="font-bold text-[#00994f] uppercase tracking-wide">{metadata.category}</span>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-gray-500">{metadata.date}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {metadata.tags?.map(tag => (
                                <span key={tag} className="text-[#00994f] text-sm font-medium hover:underline cursor-pointer">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. Main Content Wrapper */}
                <main className="max-w-[800px] mx-auto px-6">

                    {/* Meta Section (Title, Subtitle, Writers) */}
                    <section className="meta mb-10 animate-slide-up delay-100">
                        <h1 className="text-[2.125rem] md:text-[2.75rem] font-medium text-[#111] leading-[1.2] mb-4 tracking-tight word-keep-all">
                            {metadata.title}
                        </h1>
                        {metadata.excerpt && (
                            <p className="text-[1.125rem] md:text-[1.25rem] text-gray-600 font-normal leading-[1.6] mb-8 tracking-tight">
                                {metadata.excerpt}
                            </p>
                        )}

                        <div className="writers flex items-center gap-3 border-t border-gray-100 pt-6">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-base">{metadata.author || 'Writer'}</span>
                                <span className="text-xs text-gray-400">Contributor</span>
                            </div>
                        </div>
                    </section>

                    {/* Back Navigation (Moved Here) */}
                    <div className="back-nav mb-12 animate-slide-up delay-150">
                        <Link
                            href="/resources"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-black transition-colors group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back</span>
                        </Link>
                    </div>

                    {/* Content Section (Tiptap / MDX) */}
                    <section className="tiptap content animate-slide-up delay-200">
                        <div className={`
                        html-content
                        text-[1.125rem]
                        leading-[1.8]
                        text-[#222]
                        
                        [&_p]:mb-[1.5rem] 
                        [&_p]:min-h-[1em]
                        
                        [&_h1]:text-[2.125rem] 
                        [&_h1]:font-medium
                        [&_h1]:leading-[1.21] 
                        [&_h1]:mt-[3rem] 
                        [&_h1]:mb-[1.5rem] 
                        
                        [&_h2]:text-[1.75rem]
                        [&_h2]:font-medium
                        [&_h2]:mt-[2.5rem] 
                        [&_h2]:mb-[1.25rem]

                        [&_h3]:text-[1.4rem] 
                        [&_h3]:font-bold 
                        [&_h3]:mt-[2rem] 
                        [&_h3]:mb-[1rem]

                        [&_ul]:my-[2.25rem] 
                        [&_ul]:pl-[1.5rem] 
                        [&_ul]:list-disc 
                        
                        [&_ol]:my-[2.25rem] 
                        [&_ol]:pl-[1.5rem] 
                        [&_ol]:list-decimal

                        [&_li]:my-[0.75rem] 

                        [&_a]:text-blue-600
                        [&_a]:font-semibold 
                        [&_a]:underline 

                        [&_blockquote]:my-[3.75rem] 
                        [&_blockquote]:pl-[1.875rem] 
                        [&_blockquote]:border-l-[4px] 
                        [&_blockquote]:border-black 
                        [&_blockquote]:text-gray-700
                        [&_blockquote]:italic

                        [&_hr]:my-[6.25rem]
                        [&_hr]:border-gray-200

                        [&_img]:w-full 
                        [&_img]:my-[1.5rem]

                        selection:bg-[#00994f]/10 selection:text-[#00994f]
                    `}>
                            <MDXRemote
                                source={content}
                                components={MDXComponents}
                                options={{
                                    mdxOptions: {
                                        remarkPlugins: [remarkGfm],
                                        rehypePlugins: [rehypeHighlight, rehypeSlug],
                                    }
                                }}
                            />
                        </div>
                    </section>

                    {/* Footer / Share / Related (Placeholder for now based on available data) */}
                    <div className="mt-24 pt-10 border-t border-gray-200">
                        <Link
                            href="/resources"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full font-medium transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Insight List
                        </Link>
                    </div>
                </main>
            </article>
        </DashboardLayout>
    );
}
