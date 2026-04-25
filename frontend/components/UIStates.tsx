import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 3 }) => (
  <div className="w-full animate-pulse px-8 py-10 space-y-8">
    <div className="h-4 bg-white/5 rounded w-1/4"></div>
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className={`h-12 bg-white/5 rounded-xl ${j === 1 ? 'flex-[2]' : 'flex-1'}`}></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5 shadow-2xl animate-pulse">
    <div className="w-16 h-16 bg-white/5 rounded-2xl mb-6"></div>
    <div className="h-4 bg-white/5 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-white/5 rounded w-1/2"></div>
  </div>
);

export const EmptyState = ({ title, message, icon }: { title: string, message: string, icon?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
    <div className="w-24 h-24 bg-[#0f1623] rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner">
      {icon || (
        <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )}
    </div>
    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight mb-3">{title}</h3>
    <p className="text-[#6B7280] text-sm font-medium max-w-xs mx-auto leading-relaxed">{message}</p>
  </div>
);
