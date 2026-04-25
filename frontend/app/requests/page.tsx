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
  const [activeTab, setActiveTab] = useState('Pending');
  
  // Rejection Modal State
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [targetRequestId, setTargetRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    const token = localStorage.getItem('tessa_token');
    try {
      setLoading(true);
      const [rRes, uRes] = await Promise.all([
        fetch(`${API_URL}/api/requests/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/users/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const rData = await rRes.json();
      const uData = await uRes.json();
      setRequests(Array.isArray(rData) ? rData : []);
      const userMap: Record<number, User> = {};
      if (Array.isArray(uData)) {
        uData.forEach((u: User) => { userMap[u.id] = u; });
      }
      setUsers(userMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (requestId: number, status: string, reason?: string) => {
    const token = localStorage.getItem('tessa_token');
    try {
      const url = new URL(`${API_URL}/api/requests/${requestId}/status`);
      url.searchParams.append('status', status);
      if (reason) url.searchParams.append('rejection_reason', reason);

      const res = await fetch(url.toString(), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setShowRejectionModal(false);
        setRejectionReason('');
        setTargetRequestId(null);
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  const triggerRejection = (requestId: number) => {
    setTargetRequestId(requestId);
    setShowRejectionModal(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Employee', 'Asset Type', 'Reason', 'Status', 'Date'];
    const rows = requests.map(r => [
      r.id,
      users[r.user_id]?.name || 'Unknown',
      r.asset_type,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.status,
      new Date(r.request_date).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tessa_procurement_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRequests = requests.filter(r => activeTab === 'Pending' ? r.status === 'Pending' : r.status !== 'Pending');

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Procurement Hub</h2>
            <p className="text-[#6B7280] font-medium">&quot;Enterprise-grade hardware acquisition and authorization workflows.&quot;</p>
          </div>
          <button onClick={exportToCSV} className="bg-[#1A2235] hover:bg-[#252a3d] text-white font-black px-6 py-4 rounded-xl border border-white/5 transition-all text-[10px] uppercase tracking-widest flex items-center gap-3">
             <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             Export Archive (CSV)
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
           <button onClick={() => setActiveTab('Pending')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>Pending Queue</button>
           <button onClick={() => setActiveTab('History')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'History' ? 'bg-[#1A2235] text-white border border-white/10' : 'bg-[#1A2235] text-slate-500 hover:text-white'}`}>Resolution History</button>
        </div>

        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Procurement Log...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                 <div className="w-20 h-20 bg-[#0f1623] rounded-full flex items-center justify-center mb-6 border border-white/5">
                    <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Queue Clear</h3>
                 <p className="text-slate-500 text-sm font-medium">No hardware requests are currently awaiting administrative action.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Employee Profile</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Request Specs</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Submission Date</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{users[req.user_id]?.name || `Employee #${req.user_id}`}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{users[req.user_id]?.email || 'OFF-GRID'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{req.asset_type}</p>
                        <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">{req.reason}</p>
                      </td>
                      <td className="px-8 py-6 text-slate-500 font-bold text-[13px]">
                         {new Date(req.request_date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleUpdateStatus(req.id, 'Approved')} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Authorize</button>
                            <button onClick={() => triggerRejection(req.id)} className="px-5 py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20">Deny</button>
                          </div>
                        ) : (
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            req.status === 'Approved' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1D27] border border-white/5 rounded-[32px] w-full max-w-md p-10 shadow-2xl">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 italic">Denial Feedback</h3>
            <p className="text-[#6B7280] text-sm mb-8 font-medium leading-relaxed">Provide a justification for the rejection of this hardware procurement request.</p>
            <div className="space-y-6">
              <textarea 
                required 
                rows={4}
                className="w-full bg-[#0F1117] border border-white/5 text-white rounded-2xl px-6 py-5 outline-none focus:border-red-500 transition-all resize-none text-sm placeholder-slate-600 font-medium" 
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                placeholder="State the administrative reason for denial..." 
              />
              <div className="flex gap-4 pt-4">
                <button className="flex-1 bg-transparent text-red-500 hover:bg-red-500/5 border border-red-500/30 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest" onClick={() => setShowRejectionModal(false)}>Cancel</button>
                <button className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 border-none text-xs uppercase tracking-widest" onClick={() => targetRequestId && handleUpdateStatus(targetRequestId, 'Rejected', rejectionReason)}>Confirm Denial</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
