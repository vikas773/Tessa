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
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    const token = localStorage.getItem('tessa_token');
    try {
      setLoading(true);
      const [mRes, aRes] = await Promise.all([
        fetch(`${API_URL}/api/maintenance`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/assets`, { headers: { 'Authorization': `Bearer ${token}` } })
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/maintenance/${ticketId}?status=${newStatus}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setSelectedTicket(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const filteredTickets = tickets.filter(t => filterStatus ? t.status === filterStatus : true);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    active: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Closed').length
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Condition Reports</h2>
          <p className="text-[#6B7280] font-medium">&quot;Technical oversight of organizational hardware health and maintenance cycles.&quot;</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'System Faults', value: stats.total, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'Unassigned', value: stats.pending, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { label: 'In Progress', value: stats.active, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-[#1A2235] p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col gap-2 relative overflow-hidden group`}>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
               <h3 className={`text-3xl font-black italic ${stat.color}`}>{stat.value}</h3>
               <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-full blur-xl ${stat.bg} opacity-50`}></div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
           <button onClick={() => setFilterStatus('')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === '' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>All Tickets</button>
           <button onClick={() => setFilterStatus('Pending')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'Pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>Pending</button>
           <button onClick={() => setFilterStatus('In Progress')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'In Progress' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>In Progress</button>
           <button onClick={() => setFilterStatus('Closed')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'Closed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>Closed</button>
        </div>

        {/* Reports Table */}
        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Fault Registry...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                 <div className="w-20 h-20 bg-[#0f1623] rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">No Reports Matched</h3>
                 <p className="text-slate-500 text-sm font-medium">Adjust filters or check back later for new field submissions.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Asset Detail</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Issue Log</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500 text-center">System Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTickets.map((ticket) => {
                    const asset = assets[ticket.asset_id];
                    return (
                      <tr key={ticket.id} className="hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{asset?.name || `Asset #${ticket.asset_id}`}</p>
                          <code className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{asset?.serial_number || 'TRAC-UNKN'}</code>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm text-slate-400 font-medium max-w-md truncate leading-relaxed">{ticket.issue_description}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex items-center justify-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                ticket.status === 'Closed' ? 'bg-emerald-500' : 
                                ticket.status === 'In Progress' ? 'bg-purple-500' :
                                'bg-orange-500'
                              }`}></div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                ticket.status === 'Closed' ? 'text-emerald-500' : 
                                ticket.status === 'In Progress' ? 'text-purple-500' :
                                'text-orange-500'
                              }`}>{ticket.status}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-[10px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest transition-all">Review &rarr;</button>
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

      {/* Slide-over Detail Panel */}
      <div className={`fixed inset-0 z-[200] flex justify-end transition-opacity duration-300 ${selectedTicket ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="absolute inset-0 bg-[#0F1117]/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}></div>
         <div className={`relative w-full max-w-lg bg-[#1A2235] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 transform transition-transform duration-500 ease-out p-12 ${selectedTicket ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedTicket && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Ticket Analysis</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">LOG UID: {selectedTicket.id}</p>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <div className="flex-1 space-y-12">
                   <section>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-4">Target Resource</label>
                      <div className="bg-[#0f1623] p-6 rounded-2xl border border-white/5">
                         <p className="text-lg font-bold text-white mb-1">{assets[selectedTicket.asset_id]?.name}</p>
                         <code className="text-xs font-mono text-blue-500 uppercase">{assets[selectedTicket.asset_id]?.serial_number}</code>
                      </div>
                   </section>

                   <section>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-4">Fault Report</label>
                      <div className="bg-[#0f1623] p-6 rounded-2xl border border-white/5">
                         <p className="text-sm text-slate-300 leading-relaxed italic">&quot;{selectedTicket.issue_description}&quot;</p>
                      </div>
                   </section>

                   <section>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-4">Operational Status</label>
                      <div className="flex items-center gap-3">
                         <div className={`w-3 h-3 rounded-full ${
                            selectedTicket.status === 'Closed' ? 'bg-emerald-500' : 
                            selectedTicket.status === 'In Progress' ? 'bg-purple-500' :
                            'bg-orange-500'
                         }`}></div>
                         <span className="text-sm font-black uppercase tracking-[2px] text-white">{selectedTicket.status}</span>
                      </div>
                   </section>
                </div>

                <div className="mt-auto pt-12 border-t border-white/5 flex flex-col gap-4">
                  {selectedTicket.status === 'Pending' && (
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'In Progress')} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-purple-600/20 transition-all border-none text-xs uppercase tracking-widest">Assign Technician</button>
                  )}
                  {selectedTicket.status !== 'Closed' && (
                    <button onClick={() => handleUpdateStatus(selectedTicket.id, 'Closed')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-emerald-600/20 transition-all border-none text-xs uppercase tracking-widest">Mark as Resolved</button>
                  )}
                   {selectedTicket.status === 'Closed' && (
                    <button disabled className="w-full bg-[#0f1623] text-slate-600 font-black py-5 rounded-2xl border border-white/5 text-xs uppercase tracking-widest opacity-50">Ticket Finalized</button>
                  )}
                </div>
              </div>
            )}
         </div>
      </div>
    </PageLayout>
  );
}
