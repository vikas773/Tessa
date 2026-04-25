"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { TableSkeleton, EmptyState } from '../../components/UIStates';

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Hardware Requests</h2>
          <p className="text-[#6B7280] font-medium">&quot;Historical record of equipment procurement requests and operational approvals.&quot;</p>
        </header>

        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={5} columns={4} />
            ) : requests.length === 0 ? (
              <EmptyState 
                title="No Requests Filed" 
                message="Your procurement history is currently empty." 
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
                  {requests.map((req) => (
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
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          req.status === 'Approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                          req.status === 'Rejected' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                          'text-orange-400 bg-orange-400/10 border-orange-400/20'
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
