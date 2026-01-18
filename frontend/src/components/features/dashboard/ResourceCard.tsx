'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { ResourceMetadata } from '@/types/resource';

interface ResourceCardProps {
    data: ResourceMetadata;
}

export function ResourceCard({ data }: ResourceCardProps) {
    // 카테고리별 라벨 색상 매핑 (선택 사항)
    const labelColor = {
        'Regulation': 'bg-red-500',
        'Tech': 'bg-blue-500',
        'Insights': 'bg-amber-500',
    }[data.category] || 'bg-gray-800'; // 기본값

    return (
        <Link
            href={`/resources/${data.slug}`}
            className="group relative block w-full h-full pt-8 px-5 pb-6 cursor-pointer"
        >

            {/* 1. 카드 배경 (Clean Box) */}
            <div className="absolute inset-x-0 bottom-0 top-12 bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-blue-200" />

            {/* 2. 3D 책 표지 영역 */}
            <div className="relative z-10 w-40 aspect-[3/4] mx-auto mb-6 group-hover:-translate-y-4 transition-transform duration-500 ease-out">

                {/* 책등 (Spine) - 입체감 */}
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gray-900 rounded-l-sm -translate-x-full shadow-md z-0" />

                {/* 표지 이미지 */}
                <div className="relative w-full h-full rounded-r-sm shadow-[4px_4px_12px_rgba(0,0,0,0.15)] transition-shadow duration-500 group-hover:shadow-[12px_20px_24px_rgba(0,0,0,0.2)] bg-gray-100 overflow-hidden">
                    <Image
                        src={data.imageSrc}
                        alt={data.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* 표지 광택 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/20 z-20" />

                    {/* ★ 핵심: 세로형 라벨 (Post-it style) ★ */}
                    <div className="absolute top-0 left-3 w-8 h-auto min-h-[60px] z-30 flex flex-col items-center justify-start pt-2 pb-3 shadow-md">
                        {/* 라벨 배경 (색상 + 종이 질감) */}
                        <div className={`absolute inset-0 ${labelColor} opacity-90`} />

                        {/* 라벨 끝부분 모양 (선택: 톱니 or 뾰족) - 여기서는 깔끔한 직사각형 유지하거나 둥글게 */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-black/10`} />

                        {/* 텍스트 (세로 쓰기) */}
                        <span className="relative text-[10px] font-bold text-white uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
                            {data.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. 텍스트 컨텐츠 */}
            <div className="relative z-10 text-center px-2">
                {/* 날짜 */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-3 font-medium">
                    <Calendar size={12} />
                    {data.date}
                </div>

                {/* 제목 */}
                <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {data.title}
                </h3>

                {/* Read Report */}
                <div className="inline-flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors mt-2">
                    Read Report
                    <ArrowUpRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
            </div>

        </Link>
    );
}
