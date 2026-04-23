"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';

interface AssetRequest {
  id: number;
  user_id: number;
  asset_type: string;
  reason: string;
  status: string;
  request_date: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const [rRes, uRes] = await Promise.all([
        fetch(`${API_URL}/api/requests/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const rData = await rRes.json();
      const uData = await uRes.json();

      setRequests(Array.isArray(rData) ? rData : []);
      
      const userMap: Record<number, User> = {};
      if (Array.isArray(uData)) {
        uData.forEach((u: User) => {
          userMap[u.id] = u;
        });
      }
      setUsers(userMap);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/requests/${requestId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Procurement Requests</h2>
          </div>
          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">"Audit and authorize enterprise hardware acquisition requests."</p>
        </header>

        <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2D3E] bg-[#13151F]">
            <h3 className="text-lg font-bold text-white">Pending Approval Queue</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27]">
                <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Accessing Procurement Log...</p>
              </div>
            ) : requests.filter(r => r.status === 'Pending').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-[#1A1D27]">
                <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
                  <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-white font-bold text-xl mb-2">Queue Clear</p>
                <p className="text-[#6B7280] text-sm">All pending hardware requests have been successfully processed.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#13151F]">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Employee Profile</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Request Specifications</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Submission Date</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E] text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {requests.filter(r => r.status === 'Pending').map((req, index) => {
                    const user = users[req.user_id];
                    return (
                      <tr key={req.id} className={`${index % 2 === 0 ? 'bg-[#1A1D27]' : 'bg-[#1E2130]'} hover:bg-[#252840] transition-colors group`}>
                        <td className="px-6 py-5">
                          <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors leading-tight">{user?.name || `Employee #${req.user_id}`}</p>
                          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-1">{user?.email || 'OFF-GRID'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-[2px] mb-1">{req.asset_type}</p>
                          <p className="text-[14px] text-slate-300 font-medium max-w-md leading-relaxed">{req.reason}</p>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-[13px] text-[#6B7280] font-mono">
                             {new Date(req.request_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                           </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Approved')}
                              className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border border-[#10B981]/20"
                            >
                              Authorize
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                              className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444] hover:text-white rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border border-[#EF4444]/20"
                            >
                              Deny
                            </button>
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
  );
}
