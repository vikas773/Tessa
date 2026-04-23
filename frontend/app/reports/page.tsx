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
        const [mRes, aRes] = await Promise.all([
          fetch(`${API_URL}/api/maintenance/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/assets/`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const mData = await mRes.json();
        const aData = await aRes.json();

        setTickets(Array.isArray(mData) ? mData : []);
        
        const assetMap: Record<number, Asset> = {};
        if (Array.isArray(aData)) {
          aData.forEach((a: Asset) => {
            assetMap[a.id] = a;
          });
        }
        setAssets(assetMap);
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
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Condition Reports</h2>
          </div>
          <p className="text-base md:text-lg text-slate-400 font-medium">Review asset condition reports and maintenance requests submitted by the fleet.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Reports', value: stats.total, color: 'text-white', bg: 'bg-slate-800', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Damaged', value: stats.damaged, color: 'text-red-400', bg: 'bg-red-500/10', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'In Repair', value: stats.inRepair, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
            { label: 'Lost', value: stats.lost, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0f172a]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-sm flex flex-col gap-4 transition-transform hover:-translate-y-1 group">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
              </div>
              <div>
                <p className="text-3xl font-black text-white mb-0.5 tracking-tight">{stat.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">All Condition Reports</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading reports...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <p className="text-white font-bold text-lg mb-2">No reports yet!</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Employees can submit hardware condition reports from their dashboard.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Asset</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Issue Description</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Serial Number</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tickets.map((ticket) => {
                    const asset = assets[ticket.asset_id];
                    return (
                      <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{asset?.name || `Asset #${ticket.asset_id}`}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{asset?.type || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-300 font-medium max-w-md">{ticket.issue_description}</p>
                        </td>
                        <td className="px-6 py-5">
                          <code className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">{asset?.serial_number || 'N/A'}</code>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            ticket.status === 'Closed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}>
                            {ticket.status}
                          </span>
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
