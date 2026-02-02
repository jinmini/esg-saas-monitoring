'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { ResourceMetadata } from '@/types/resource';

interface ResourceCardProps {
    data: ResourceMetadata;
}

export function ResourceCard({ data }: ResourceCardProps) {
    const cardClasses = "group relative block w-full h-full pt-8 px-5 pb-6 cursor-pointer";

    const CardInner = (
        <>
            {/* 1. 카드 배경 (Clean Box) */}
            <div className="absolute inset-x-0 bottom-0 top-12 bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-[#0a39c3]/20" />

            {/* 2. 책 표지 이미지 영역 (Simplified) */}
            <div className="relative z-10 w-44 aspect-[3/4.2] mx-auto mb-6 transition-all duration-500 ease-out group-hover:-translate-y-4 group-hover:scale-[1.02]">
                <div className="relative w-full h-full rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                    <Image
                        src={data.imageSrc}
                        alt={data.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* 미세한 광택 효과만 유지 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/5 pointer-events-none" />
                </div>
            </div>

            {/* 3. 텍스트 컨텐츠 */}
            <div className="relative z-10 text-center px-4">
                {/* 날짜 */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-3 font-medium">
                    <Calendar size={12} />
                    {data.date}
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-[#0a39c3] transition-colors">
                    {data.title}
                </h3>

                {/* Read Report / View Flipbook */}
                <div className="inline-flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors mt-2">
                    {data.externalUrl ? 'View Flipbook' : 'Read Report'}
                    <ArrowUpRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </div>
        </>
    );

    if (data.externalUrl) {
        return (
            <a
                href={data.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
            >
                {CardInner}
            </a>
        );
    }

    return (
        <Link
            href={`/resources/${data.slug}`}
            className={cardClasses}
        >
            {CardInner}
        </Link>
    );
}
