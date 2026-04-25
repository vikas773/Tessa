"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';
import { TableSkeleton, EmptyState } from '../../components/UIStates';

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
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        fetch(`${API_URL}/api/maintenance/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/assets/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const mData = await mRes.json();
      const aData = await aRes.json();
      setTickets(Array.isArray(mData) ? mData : []);
      const assetMap: Record<number, Asset> = {};
      if (Array.isArray(aData)) {
        aData.forEach((a: Asset) => { assetMap[a.id] = a; });
      }
      setAssets(assetMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTickets = tickets.filter(t => {
    const asset = assets[t.asset_id];
    const searchStr = searchTerm.toLowerCase();
    return (
      t.issue_description.toLowerCase().includes(searchStr) ||
      asset?.name.toLowerCase().includes(searchStr) ||
      asset?.serial_number.toLowerCase().includes(searchStr) ||
      `TICKET-${t.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchStr)
    );
  });

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Technical Tickets</h2>
            <p className="text-[#6B7280] font-medium">&quot;Operational maintenance logs and real-time status of reported faults.&quot;</p>
          </div>
          <div className="relative w-full md:w-96">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by asset, issue or ID..." 
              className="w-full bg-[#1A2235] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={5} columns={3} />
            ) : filteredTickets.length === 0 ? (
              <EmptyState 
                title={searchTerm ? "No Matching Tickets" : "No Faults Reported"} 
                message={searchTerm ? "Refine your search parameters to locate specific logs." : "All assigned units are currently reporting nominal status."} 
                icon={<svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Asset Detail</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Issue Log</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">System Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => {
                    const asset = assets[ticket.asset_id];
                    return (
                      <tr key={ticket.id} className="hover:bg-white/5 transition-all group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{asset?.name || `Asset #${ticket.asset_id}`}</p>
                          <code className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{asset?.serial_number || 'TRAC-UNKN'}</code>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">{ticket.issue_description}</p>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">TICKET-{ticket.id.toString().padStart(4, '0')}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Closed' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Closed' ? 'text-emerald-500' : 'text-orange-500'}`}>{ticket.status}</span>
                           </div>
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
