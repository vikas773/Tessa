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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const token = localStorage.getItem('tessa_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      try {
        const [mRes, aRes] = await Promise.all([
          fetch(`${API_URL}/api/maintenance/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/assets/my`, { headers: { 'Authorization': `Bearer ${token}` } })
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

  if (!mounted) return null;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20 shadow-lg shadow-[#6366F1]/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Maintenance Reports History</h2>
          </div>

          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">&quot;Track the progress of your technical assistance and repair logs.&quot;</p>
        </header>

        <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2D3E] bg-[#13151F]">
            <h3 className="text-lg font-bold text-white">Ticket Archive</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27]">
                <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Accessing Secure Records...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#1A1D27]">
                <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
                  <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <p className="text-white font-bold text-lg mb-2">No Reports Filed</p>
                <p className="text-[#6B7280] text-sm max-w-xs mx-auto">You haven&apos;t submitted any hardware condition reports yet. Your future submissions will appear here for tracking.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#13151F]">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Asset Detail</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Issue Log</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {tickets.map((ticket, index) => {
                    const asset = assets[ticket.asset_id];
                    return (
                      <tr key={ticket.id} className={`${index % 2 === 0 ? 'bg-[#1A1D27]' : 'bg-[#1E2130]'} hover:bg-[#252840] transition-colors group`}>
                        <td className="px-6 py-5">
                          <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors leading-tight">{asset?.name || `Asset #${ticket.asset_id}`}</p>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-1">{asset?.serial_number || 'TRAC-0000'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[14px] text-slate-300 font-medium max-w-md leading-relaxed">{ticket.issue_description}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            ticket.status === 'Closed' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                            ticket.status === 'Pending' ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' :
                            'text-[#6366F1] bg-[#6366F1]/10 border-[#6366F1]/20'
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
