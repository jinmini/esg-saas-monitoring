// src/components/dashboard/ResourceSection.tsx
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { RESOURCE_DATA } from '@/data/resources';

export function ResourceSection() {
  return (
    <div className="border-t border-gray-100 pt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Latest Resources
          </h2>
          <p className="text-gray-500 mt-1">
            ESG 전문가를 위한 최신 가이드북과 리포트를 확인하세요.
          </p>
        </div>
        <Link 
          href="/resources" 
          className="hidden md:flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all resources <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
        {RESOURCE_DATA.map((resource) => (
          <ResourceCard key={resource.id} data={resource} />
        ))}
      </div>
      
      <div className="mt-8 text-center md:hidden">
        <Link 
          href="/resources" 
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View all resources <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}