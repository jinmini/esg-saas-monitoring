import { Callout } from './Callout';
import { RegulationTimeline } from './RegulationTimeline';
import Image from 'next/image';
export const MDXComponents = {
  Callout,
  RegulationTimeline,
  // 기존 HTML 태그 커스텀 가능
  img: ({ src, alt, width, height }: any) => {
    if (!src) return null;
    return (
      <div className="my-10 rounded-3xl overflow-hidden border border-gray-100 shadow-xl relative w-full">
        {/* Fallback to standard img if dimensions are tricky, but let's try Image first with defaults */}
        <Image
          src={src}
          alt={alt || "Article Image"}
          width={width || 800}
          height={height || 450}
          className="w-full h-auto object-cover"
          style={{ width: '100%', height: 'auto' }} // Ensure aspect ratio based on width
        />
      </div>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="my-10 border-l-4 border-blue-600 bg-gray-50 px-8 py-6 rounded-r-2xl not-italic italic text-xl font-medium text-gray-700">
      "{children}"
    </blockquote>
  ),
};