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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20 shadow-lg shadow-[#6366F1]/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">My Request History</h2>
          </div>

          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">&quot;Review the status of your organizational equipment requests.&quot;</p>
        </header>

        <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2D3E] bg-[#13151F]">
            <h3 className="text-lg font-bold text-white">Historical Submissions</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27]">
                <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Syncing History...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[#1A1D27]">
                <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
                  <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-white font-bold text-lg mb-2">No Requests Filed</p>
                <p className="text-[#6B7280] text-sm max-w-xs mx-auto">You haven&apos;t submitted any hardware requests yet. Your submissions will appear here for tracking.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#13151F]">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Category</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Justification</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {requests.map((req, index) => (
                    <tr key={req.id} className={`${index % 2 === 0 ? 'bg-[#1A1D27]' : 'bg-[#1E2130]'} hover:bg-[#252840] transition-colors group`}>
                      <td className="px-6 py-5">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors">{req.asset_type}</p>
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">TICKET-{req.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[14px] text-slate-300 font-medium max-w-md truncate">{req.reason}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[14px] text-[#6B7280] font-medium">
                          {new Date(req.request_date).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          req.status === 'Approved' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' : 
                          req.status === 'Rejected' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' :
                          'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
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
