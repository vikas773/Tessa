import React from 'react';
import Button from './Button';

interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string | null;
  status: string;
}

interface AssetCardProps {
  asset: Asset;
  onAssign?: (id: number) => void;
  onReport?: (id: number) => void;
  onEdit?: (asset: Asset) => void;
}

export default function AssetCard({ asset, onAssign, onReport, onEdit }: AssetCardProps) {
  const getStatusColors = () => {
    switch (asset.status) {
      case 'Available': return { text: '#10B981', bg: 'rgba(16,185,129,0.15)', border: '#10B981', strip: '#10B981' };
      case 'Assigned': return { text: '#10B981', bg: 'rgba(16,185,129,0.15)', border: '#10B981', strip: '#10B981' };
      case 'Under Maintenance': return { text: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: '#F59E0B', strip: '#F59E0B' };
      case 'Broken': return { text: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: '#EF4444', strip: '#EF4444' };
      default: return { text: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: '#6B7280', strip: '#6B7280' };
    }
  };

  const getIcon = () => {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
    );
  };

  const colors = getStatusColors();

  return (
    <div className="group relative bg-[#1A1D27] rounded-[12px] border border-[#2A2D3E] hover:border-[#6366F1] hover:shadow-[0_0_0_1px_#6366F1] transition-all duration-200 overflow-hidden flex flex-col h-full shadow-lg shadow-black/20">
      {/* Left Status Strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: colors.strip }}></div>
      
      <div className="p-6 flex flex-col h-full pl-7">
        <div className="flex justify-between items-start mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#0F1117] border border-[#2A2D3E] flex items-center justify-center text-[#6366F1] group-hover:scale-110 transition-transform">
            {getIcon()}
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors" style={{ color: colors.text, backgroundColor: colors.bg, borderColor: `${colors.text}33` }}>
            {asset.status}
          </span>
        </div>

        <div className="mb-auto">
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[2px] mb-1.5 leading-none">
            {asset.type}
          </p>
          <h3 className="text-[16px] font-bold text-white leading-tight mb-4 group-hover:text-[#6366F1] transition-colors">
            {asset.name}
          </h3>
          
          <div className="bg-[#0F1117] rounded-lg p-3 border border-[#2A2D3E] mb-6">
            <p className="text-[9px] font-bold text-[#6B7280] uppercase tracking-[1.5px] mb-1">Serial Number</p>
            <code className="text-[12px] font-mono font-bold text-slate-300 tracking-tight">
              {asset.serial_number || 'UNASSIGNED'}
            </code>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {onAssign && (
            <button 
              onClick={() => onAssign(asset.id)}
              className="w-full bg-[#6366F1] hover:bg-[#818CF8] text-white font-medium py-3 px-4 rounded-[8px] text-[14px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6366F1]/10 active:scale-95"
            >
              Manage Asset
            </button>
          )}
          {onReport && asset.status !== 'Under Maintenance' && (
            <button 
              onClick={() => onReport(asset.id)}
              className="w-full bg-[#EF4444] hover:bg-[#F87171] text-white font-medium py-3 px-4 rounded-[8px] text-[14px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#EF4444]/10 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
