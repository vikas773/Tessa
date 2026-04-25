import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AssetCard from './AssetCard';

interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string | null;
  status: string;
}

export default function EmployeeDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [requestFormData, setRequestFormData] = useState({ asset_type: 'Laptop', reason: '' });

  const fetchMyData = useCallback(async () => {
    const token = localStorage.getItem('tessa_token');
    const userRaw = localStorage.getItem('tessa_user');
    if (!token || !userRaw) return;
    setUser(JSON.parse(userRaw));

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      setLoading(true);
      const [assetsRes, requestsRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/api/assets/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/requests/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/maintenance/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const assetsData = await assetsRes.json();
      const requestsData = await requestsRes.json();
      const ticketsData = await ticketsRes.json();

      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error("Failed to fetch my data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData]);

  const triggerReportIssue = (assetId: number) => {
    setSelectedAssetId(assetId);
    setShowReportModal(true);
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !issueDescription.trim()) return;
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API_URL}/api/maintenance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ asset_id: selectedAssetId, issue_description: issueDescription })
      });
      if (res.ok) {
        setShowReportModal(false);
        setIssueDescription('');
        fetchMyData();
      }
    } catch (err) { console.error(err); }
  };

  const handleAssetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API_URL}/api/requests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(requestFormData)
      });
      if (res.ok) {
        setShowRequestModal(false);
        setRequestFormData({ asset_type: 'Laptop', reason: '' });
        fetchMyData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="animate-in fade-in slide-in-from-left duration-700">
           <h1 className="text-4xl font-black text-white italic uppercase tracking-tight mb-2">Welcome Back, {user?.name?.split(' ')[0]}</h1>
           <p className="text-[#6B7280] font-medium">&quot;Operations readiness and asset health overview.&quot;</p>
        </div>
        <div className="flex gap-4 animate-in fade-in slide-in-from-right duration-700">
           <button onClick={() => setShowRequestModal(true)} className="bg-[#1A2235] hover:bg-[#252a3d] text-white font-black px-6 py-4 rounded-xl border border-white/5 transition-all text-xs uppercase tracking-widest flex items-center gap-3">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Request Hardware
           </button>
           <button onClick={() => setShowReportModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all border-none text-xs uppercase tracking-widest flex items-center gap-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Report Fault
           </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom duration-700">
         <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/20 transition-all"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4">Assigned Units</p>
            <div className="flex items-end gap-3">
               <h3 className="text-5xl font-black text-white italic">{assets.length}</h3>
               <Link href="/my-assets" className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 hover:text-blue-400 transition-colors">View All &rarr;</Link>
            </div>
         </div>
         <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-600/20 transition-all"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4">Active Requests</p>
            <div className="flex items-end gap-3">
               <h3 className="text-5xl font-black text-white italic">{requests.filter(r => r.status === 'Pending').length}</h3>
               <Link href="/my-requests" className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 hover:text-emerald-400 transition-colors">History &rarr;</Link>
            </div>
         </div>
         <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-600/20 transition-all"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4">Open Tickets</p>
            <div className="flex items-end gap-3">
               <h3 className="text-5xl font-black text-white italic">{tickets.filter(t => t.status !== 'Closed').length}</h3>
               <Link href="/my-reports" className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1.5 hover:text-orange-400 transition-colors">Track &rarr;</Link>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* My Assets Summary */}
         <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Current Inventory</h3>
               <Link href="/my-assets" className="text-xs font-black text-slate-500 hover:text-white transition-colors">Fullscreen &rarr;</Link>
            </div>
            {loading ? (
               <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-24 bg-[#1A2235] rounded-2xl animate-pulse border border-white/5"></div>)}
               </div>
            ) : assets.length === 0 ? (
               <div className="bg-[#1A2235] rounded-3xl border border-white/5 p-12 text-center">
                  <p className="text-slate-500 font-medium italic">No assets assigned to your profile.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {assets.slice(0, 3).map(asset => (
                     <div key={asset.id} className="bg-[#1A2235] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-[#0f1623] flex items-center justify-center border border-white/5 group-hover:border-blue-500/20 transition-all">
                              <svg className="w-6 h-6 text-slate-500 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white mb-1">{asset.name}</p>
                              <code className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{asset.serial_number}</code>
                           </div>
                        </div>
                        <button onClick={() => triggerReportIssue(asset.id)} className="text-[10px] font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors">Report Issue</button>
                     </div>
                  ))}
               </div>
            )}
         </section>

         {/* Recent Activity / Requests */}
         <section>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Recent Requests</h3>
               <Link href="/my-requests" className="text-xs font-black text-slate-500 hover:text-white transition-colors">History &rarr;</Link>
            </div>
            {loading ? (
               <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-24 bg-[#1A2235] rounded-2xl animate-pulse border border-white/5"></div>)}
               </div>
            ) : requests.length === 0 ? (
               <div className="bg-[#1A2235] rounded-3xl border border-white/5 p-12 text-center">
                  <p className="text-slate-500 font-medium italic">No hardware requests found.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {requests.slice(0, 3).map(req => (
                     <div key={req.id} className="bg-[#1A2235] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                           <p className="text-sm font-bold text-white mb-1">{req.asset_type}</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(req.request_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          req.status === 'Approved' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                          req.status === 'Rejected' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                          'text-orange-500 bg-orange-500/10 border-orange-500/20'
                        }`}>
                          {req.status}
                        </span>
                     </div>
                  ))}
               </div>
            )}
         </section>
      </div>

      {/* Modals */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1D27] border border-white/5 rounded-3xl w-full max-w-md p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Request Unit</h3>
            </div>
            <form onSubmit={handleAssetRequest} className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Hardware Category</label>
                <select className="w-full bg-[#0F1117] border border-white/5 text-white rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-[11px]" value={requestFormData.asset_type} onChange={e => setRequestFormData({...requestFormData, asset_type: e.target.value})}>
                  <option value="Laptop">ThinkPad Workstation</option>
                  <option value="Desktop">Power Computing Node</option>
                  <option value="Monitor">4K External Display</option>
                  <option value="Peripherals">Human Interface Devices</option>
                  <option value="Mobile">Mobile Communications</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Mission Justification</label>
                <textarea required rows={4} className="w-full bg-[#0F1117] border border-white/5 text-white rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all resize-none text-sm placeholder-slate-600 font-medium" value={requestFormData.reason} onChange={e => setRequestFormData({...requestFormData, reason: e.target.value})} placeholder="State your operational requirements..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-black py-4 transition-all text-xs uppercase tracking-widest border-none" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-600/20 border-none text-xs uppercase tracking-widest">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#1A1D27] border border-white/5 rounded-3xl w-full max-w-md p-10 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Report Fault</h3>
            </div>
            <form onSubmit={handleReportIssue} className="flex flex-col gap-6">
               <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Target Asset</label>
                <select required className="w-full bg-[#0F1117] border border-white/5 text-white rounded-xl px-5 py-4 outline-none focus:border-orange-500 transition-all font-black uppercase tracking-widest text-[11px]" value={selectedAssetId || ''} onChange={e => setSelectedAssetId(parseInt(e.target.value))}>
                  <option value="" disabled>-- Select Unit --</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serial_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Fault Description</label>
                <textarea required rows={4} className="w-full bg-[#0F1117] border border-white/5 text-white rounded-xl px-5 py-4 outline-none focus:border-orange-500 transition-all resize-none text-sm placeholder-slate-600 font-medium" value={issueDescription} onChange={e => setIssueDescription(e.target.value)} placeholder="Describe the technical anomaly..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-black py-4 transition-all text-xs uppercase tracking-widest border-none" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl shadow-xl shadow-orange-600/20 border-none text-xs uppercase tracking-widest">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
