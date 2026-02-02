'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Calendar, User } from 'lucide-react';
import { ResourceMetadata } from '@/types/resource';
import { cn } from '@/lib/utils';

interface BlogCardProps {
    data: ResourceMetadata;
    className?: string;
}

export function BlogCard({ data, className }: BlogCardProps) {
    return (
        <Link
            href={`/resources/${data.slug}`}
            className={cn(
                "group flex flex-col md:flex-row items-start gap-[2.4rem] border-t border-gray-200 py-[2.4rem] hover:border-t-blue-600 transition-all duration-300",
                className
            )}
        >
            {/* 1. Thumbnail Image */}
            <div className="relative h-[18rem] md:h-[220px] w-full md:w-[400px] md:min-w-[400px] overflow-hidden rounded-[1.6rem]">
                <Image
                    src={data.imageSrc}
                    alt={data.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 400px"
                />
            </div>

            {/* 2. Content Info */}
            <div className="flex-1 min-w-0">
                {/* Category Tag */}
                <span className="inline-block whitespace-nowrap px-[1.5rem] py-[0.5rem] text-xs font-bold bg-blue-50 text-[#0a39c3] rounded-[3.8rem]">
                    {data.category}
                </span>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-[#0a39c3] mt-[1.5rem] mb-[1rem] transition-colors leading-tight">
                    {data.title}
                </h3>

                {/* Heading/Excerpt */}
                <p className="text-base md:text-lg font-medium text-gray-700 mb-[1.2rem] line-clamp-2 leading-relaxed">
                    {data.excerpt}
                </p>

                {/* Date */}
                <p className="text-sm font-medium text-gray-500">
                    {data.date}
                </p>
            </div>
        </Link>
    );
}
