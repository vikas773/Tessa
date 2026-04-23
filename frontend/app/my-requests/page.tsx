"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';

interface AssetRequest {
  id: number;
  asset_type: string;
  reason: string;
  status: string;
  request_date: string;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('tessa_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      try {
        const res = await fetch(`${API_URL}/api/requests/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch my requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-10 lg:py-14">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">My Request History</h2>
          </div>
          <p className="text-base md:text-lg text-slate-400 font-medium">Track the status of hardware and furniture requests you've submitted.</p>
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
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                  <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-white font-bold text-xl mb-2">No requests yet</p>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">You haven't requested any new hardware yet. Your requests will appear here once submitted.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Asset Type</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Reason</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{req.asset_type}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Ticket #{req.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-300 font-medium max-w-md truncate">{req.reason}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-400 font-medium">
                          {new Date(req.request_date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          req.status === 'Approved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                          req.status === 'Rejected' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                          'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {req.status}
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
