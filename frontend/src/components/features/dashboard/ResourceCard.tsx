// src/components/dashboard/ResourceCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Download } from 'lucide-react';
import {ResourceItem} from '@/data/resources';


interface ResourceCardProps {
  data: ResourceItem;
}

export function ResourceCard({ data }: ResourceCardProps) {
  return (
    <Link href={data.href} className="group block w-full h-full cursor-pointer">
      <div className="flex flex-col gap-5 h-full">
        
        {/* 이미지 영역 (3D 효과) */}
        <div className="relative w-full aspect-[4/5] [perspective:1000px] px-4 pt-4">
          <div className="
            relative w-full h-full rounded-lg shadow-md overflow-hidden bg-gray-100
            transition-all duration-500 ease-out 
            [transform-style:preserve-3d] 
            group-hover:[transform:rotateY(-5deg)_rotateX(3deg)_scale(1.03)]
            group-hover:shadow-xl
          ">
            <Image
              src={data.imageSrc}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>

        {/* 텍스트 정보 */}
        <div className="flex flex-col flex-1 px-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
              {data.category}
            </span>
            <Download className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors mb-2">
            {data.title}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
            {data.description}
          </p>
        </div>

      </div>
    </Link>
  );
}