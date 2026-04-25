"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';
import { TableSkeleton, EmptyState } from '../../components/UIStates';

interface AssetRequest {
  id: number;
  asset_type: string;
  reason: string;
  status: string;
  rejection_reason?: string;
  request_date: string;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = useCallback(async () => {
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/requests/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = requests.filter(r => {
    const searchStr = searchTerm.toLowerCase();
    return (
      r.asset_type.toLowerCase().includes(searchStr) ||
      r.reason.toLowerCase().includes(searchStr) ||
      `REQ-${r.id.toString().padStart(4, '0')}`.toLowerCase().includes(searchStr)
    );
  });

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Hardware Requests</h2>
            <p className="text-[#6B7280] font-medium">&quot;Historical record of equipment procurement requests and operational approvals.&quot;</p>
          </div>
          <div className="relative w-full md:w-96">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search by category, reason or ID..." 
              className="w-full bg-[#1A2235] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : filteredRequests.length === 0 ? (
              <EmptyState 
                title={searchTerm ? "No Matching Requests" : "No Requests Filed"} 
                message={searchTerm ? "Refine your search parameters to locate specific procurement logs." : "Your procurement history is currently empty."} 
                icon={<svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>}
              />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Resource Category</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Business Justification</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Submission Date</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{req.asset_type}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">REQ-{req.id.toString().padStart(4, '0')}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed line-clamp-2">{req.reason}</p>
                      </td>
                      <td className="px-8 py-6 text-slate-500 font-bold text-[13px]">
                        {new Date(req.request_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                          req.status === 'Approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                          req.status === 'Rejected' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                          'text-orange-400 bg-orange-400/10 border-orange-400/20'
                        }`}>
                          {req.status}
                          {req.status === 'Rejected' && req.rejection_reason && (
                            <div className="relative group/reason">
                              <svg className="w-3 h-3 cursor-help text-red-400/60 hover:text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#0F1117] border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover/reason:opacity-100 pointer-events-none transition-all z-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tighter">Admin Feedback:</p>
                                <p className="text-[11px] text-white normal-case font-medium leading-relaxed">{req.rejection_reason}</p>
                              </div>
                            </div>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
