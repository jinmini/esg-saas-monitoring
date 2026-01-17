// src/components/mdx/Callout.tsx
import { Info, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'idea';
  children: React.ReactNode;
}

export function Callout({ type = 'info', children }: CalloutProps) {
  const styles = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info size={18} className="text-blue-500" /> },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: <AlertTriangle size={18} className="text-amber-500" /> },
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: <CheckCircle size={18} className="text-emerald-500" /> },
    idea: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: <Lightbulb size={18} className="text-indigo-500" /> },
  };

  const { bg, border, text, icon } = styles[type];

  return (
    <div className={`my-8 flex gap-4 p-5 rounded-2xl border ${bg} ${border} ${text}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="text-sm leading-relaxed font-medium">{children}</div>
    </div>
  );
}