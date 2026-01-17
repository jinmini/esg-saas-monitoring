// src/components/mdx/RegulationTimeline.tsx
interface TimelineItem {
  date: string;
  title: string;
  desc: string;
  status?: 'completed' | 'urgent' | 'upcoming';
}

export function RegulationTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="my-10 space-y-6">
      {items.map((item, idx) => (
        <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
          <div className={`absolute left-[-4px] top-1.5 w-2 h-2 rounded-full border-2 border-white ring-4 
            ${item.status === 'urgent' ? 'bg-red-500 ring-red-100' : 
              item.status === 'completed' ? 'bg-emerald-500 ring-emerald-100' : 'bg-gray-300 ring-gray-100'}`} 
          />
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.date}</div>
          <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}