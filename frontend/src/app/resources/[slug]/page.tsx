import { getResourceBySlug, getAllResources } from '@/lib/mdx';
import { notFound } from 'next/navigation';
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
        <article className="min-h-screen bg-white">
            {/* Navigation Bar (Sticky-ish) */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/resources"
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Resources
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        Resources <ChevronRight size={12} /> {metadata.category}
                    </div>
                </div>
            </nav>

            {/* Hero Header */}
            <header className="pt-16 pb-12 border-b border-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                        {metadata.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
                        {metadata.title}
                    </h1>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Published</span>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={14} className="text-gray-400" />
                                {metadata.date}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Team</span>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <User size={14} className="text-gray-400" />
                                {metadata.author || 'ESG Experts'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Reading Time</span>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Clock size={14} className="text-gray-400" />
                                {metadata.readingTime} min
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Cover Image */}
                <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-16 shadow-2xl border border-gray-100">
                    <Image
                        src={metadata.imageSrc}
                        alt={metadata.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* MDX Content Rendering */}
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:rounded-2xl">
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

                {/* Footer Navigation */}
                <div className="mt-24 pt-12 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {metadata.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </main>
        </article>
    );
}
