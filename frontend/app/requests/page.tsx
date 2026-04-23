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
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-10 lg:py-14">
        <header className="mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Asset Procurement Requests</h2>
          <p className="text-base md:text-lg text-slate-400 font-medium">Review and manage hardware requests from employees.</p>
        </header>

        <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-white font-bold text-xl mb-2">No pending requests</p>
                <p className="text-slate-400 text-sm">All employee procurement requests have been processed.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Employee</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Request Details</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Request Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {requests.map((req) => {
                    const user = users[req.user_id];
                    return (
                      <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-white">{user?.name || `User #${req.user_id}`}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user?.email || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest text-[10px] mb-1">{req.asset_type}</p>
                          <p className="text-sm text-slate-300 font-medium max-w-md">{req.reason}</p>
                        </td>
                        <td className="px-6 py-5 text-right text-xs text-slate-500 font-mono">
                          {new Date(req.request_date).toLocaleDateString()}
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
