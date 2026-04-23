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
}

export default function AssetCard({ asset, onAssign, onReport }: AssetCardProps) {
  const statusColor = asset.status === 'Available' 
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
    : asset.status === 'Broken'
    ? 'text-red-400 bg-red-400/10 border-red-400/20'
    : 'text-amber-400 bg-amber-400/10 border-amber-400/20';

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 group border border-slate-700/50">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">{asset.name}</h3>
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mt-1">{asset.type}</p>
        </div>
        <span className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${statusColor}`}>
          {asset.status}
        </span>
      </div>
      
      <div className="p-4 rounded-xl bg-[#1e293b]/50 border border-slate-700/50 group-hover:bg-[#1e293b]/80 group-hover:border-slate-600 transition-colors shadow-inner">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1.5">Asset Inventory ID</p>
        <p className="text-sm text-slate-300 font-mono font-bold">{asset.serial_number || 'UNASSIGNED-000'}</p>
      </div>
      
      {(onAssign || onReport) && (
        <div className="mt-auto pt-2 grid grid-cols-2 gap-3">
          {onAssign && (
            <Button 
              onClick={() => onAssign(asset.id)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 col-span-2 border-none"
            >
              Manage Asset
            </Button>
          )}
          {onReport && (
            <Button 
              onClick={() => onReport(asset.id)}
              className="w-full bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-bold py-2.5 rounded-xl transition-all col-span-2 shadow-lg"
            >
              Report Issue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
