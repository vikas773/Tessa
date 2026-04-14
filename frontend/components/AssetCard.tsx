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
}

export default function AssetCard({ asset, onAssign }: AssetCardProps) {
  const statusColor = asset.status === 'Available' 
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
    : asset.status === 'Broken'
    ? 'text-red-400 bg-red-400/10 border-red-400/20'
    : 'text-amber-400 bg-amber-400/10 border-amber-400/20';

  return (
    <div className="bg-white rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 group border border-slate-100">
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{asset.name}</h3>
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mt-1">{asset.type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${statusColor}`}>
          {asset.status}
        </span>
      </div>
      
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1.5">Asset Inventory ID</p>
        <p className="text-sm text-slate-800 font-mono font-bold">{asset.serial_number || 'UNASSIGNED-000'}</p>
      </div>
      
      <div className="mt-auto pt-5 flex gap-3 w-full border-t border-slate-50">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-blue-200 shadow-lg active:scale-95 transition-all text-sm" onClick={() => onAssign?.(asset.id)}>
          Assign Asset
        </Button>
        <Button variant="secondary" className="px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 border-none rounded-xl active:scale-95 transition-all" title="View Details">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
        </Button>
      </div>
    </div>
  );
}
