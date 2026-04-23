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

export default function MyReportsPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [assets, setAssets] = useState<Record<number, Asset>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('tessa_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      try {
        const [mRes, aRes] = await Promise.all([
          fetch(`${API_URL}/api/maintenance/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
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
        console.error("Failed to fetch my reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-10 lg:py-14">
        <header className="mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">My Reports History</h2>
          <p className="text-base md:text-lg text-slate-400 font-medium">Track the status of hardware issues you've reported to IT.</p>
        </header>

        <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">Recent Submissions</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching history...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <p className="text-white font-bold text-xl mb-2">No reports yet</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">You haven't reported any hardware issues yet. All your future reports will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Asset</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Issue Reported</th>
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
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{asset?.serial_number || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-300 font-medium max-w-md">{ticket.issue_description}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            ticket.status === 'Closed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                            ticket.status === 'Pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-blue-400 bg-blue-500/10 border-blue-500/20'
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
