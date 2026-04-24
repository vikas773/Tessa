"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';

interface MaintenanceTicket {
  id: number;
  asset_id: number;
  issue_description: string;
  status: string;
}

interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string;
  status: string;
}

export default function ReportsPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [assets, setAssets] = useState<Record<number, Asset>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('tessa_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      try {
        const mRes = await fetch(`${API_URL}/api/maintenance`, { headers: { 'Authorization': `Bearer ${token}` } });
        const aRes = await fetch(`${API_URL}/api/assets`, { headers: { 'Authorization': `Bearer ${token}` } });

        if (mRes.ok) {
          const mData = await mRes.json();
          setTickets(Array.isArray(mData) ? mData : []);
        } else {
          console.error("Maintenance fetch failed:", mRes.status);
        }

        if (aRes.ok) {
          const aData = await aRes.json();
          const assetMap: Record<number, Asset> = {};
          if (Array.isArray(aData)) {
            aData.forEach((a: Asset) => {
              assetMap[a.id] = a;
            });
          }
          setAssets(assetMap);
        }
      } catch (err) {
        console.error("Failed to fetch reports data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    total: tickets.length,
    damaged: tickets.filter(t => assets[t.asset_id]?.status === 'Broken').length,
    inRepair: tickets.filter(t => assets[t.asset_id]?.status === 'Under Maintenance').length,
    lost: 0 // We don't have a 'Lost' status yet in the models, but we can placeholder it
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 lg:px-12 lg:py-14">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20 shadow-lg shadow-[#6366F1]/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Condition Reports</h2>
          </div>
          <p className="text-base md:text-lg text-slate-400 font-medium italic">&quot;Review asset condition reports and maintenance requests submitted by the fleet.&quot;</p>
        </header>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Tickets', value: stats.total, color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Critical / Broken', value: stats.damaged, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Maintenance', value: stats.inRepair, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
            { label: 'Resolved Tickets', value: tickets.filter(t => t.status === 'Closed').length, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: 'M5 13l4 4L19 7' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#1A1D27] p-8 rounded-xl border border-[#2A2D3E] shadow-xl flex flex-col gap-6 relative overflow-hidden group hover:border-[#6366F1]/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent -mr-16 -mt-16 rounded-full blur-2xl"></div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center border transition-transform duration-500 group-hover:scale-110" style={{ color: stat.color, backgroundColor: stat.bg, borderColor: `${stat.color}33` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
                <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2D3E] flex items-center justify-between bg-[#13151F]">
            <h3 className="text-lg font-bold text-white">Condition Reports Archive</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27]">
                <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Synchronizing Records...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#1A1D27]">
                <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
                  <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <p className="text-white font-bold text-lg mb-2">No Reports Filed</p>
                <p className="text-[#6B7280] text-sm max-w-xs mx-auto">Asset health records will appear here as they are reported by the field team.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#13151F]">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Asset Detail</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Issue Log</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Inventory ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {tickets.map((ticket, index) => {
                    const asset = assets[ticket.asset_id];
                    return (
                      <tr key={ticket.id} className={`${index % 2 === 0 ? 'bg-[#1A1D27]' : 'bg-[#1E2130]'} hover:bg-[#252840] transition-colors group`}>
                        <td className="px-6 py-5">
                          <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors leading-tight">{asset?.name || `Asset #${ticket.asset_id}`}</p>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-1">{asset?.type || 'Standard Hardware'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[14px] text-slate-300 font-medium max-w-md leading-relaxed line-clamp-2">{ticket.issue_description}</p>
                        </td>
                        <td className="px-6 py-5">
                          <code className="text-[12px] font-mono font-bold text-slate-400 bg-[#0F1117] px-2 py-1 rounded border border-[#2A2D3E]">{asset?.serial_number || 'TRAC-0000'}</code>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
