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
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [requestFormData, setRequestFormData] = useState({ asset_type: 'Laptop', reason: '' });

  const fetchMyData = useCallback(async () => {
    const token = localStorage.getItem('tessa_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      setLoading(true);
      const [assetsRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/api/assets/my`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/requests/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const assetsData = await assetsRes.json();
      const requestsData = await requestsRes.json();

      setAssets(Array.isArray(assetsData) ? assetsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (err) {
      console.error("Failed to fetch my data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_id: selectedAssetId,
          issue_description: issueDescription
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to report issue");
      }

      setShowReportModal(false);
      setIssueDescription('');
      setSelectedAssetId(null);
      fetchMyData(); // Refresh data to show updated status
      alert("Issue reported successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestFormData)
      });

      if (res.ok) {
        setShowRequestModal(false);
        setRequestFormData({ asset_type: 'Laptop', reason: '' });
        fetchMyData(); // Refresh requests list
        alert("Your asset request has been submitted successfully.");
      }
    } catch (err) {
      console.error("Error submitting request", err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">My Hardware</h2>
          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">&quot;Manage your assigned equipment and technical support tickets.&quot;</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-4 px-8 rounded-[8px] shadow-xl shadow-[#6366F1]/20 transition-all active:scale-95 flex items-center gap-3 border-none text-[14px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Request New Asset
        </button>
      </header>
      
      {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Syncing Equipment...</p>
          </div>
      ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#1A1D27] rounded-[12px] border border-[#2A2D3E] shadow-sm">
            <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <p className="text-white font-bold text-xl mb-2">No Assets Assigned</p>
            <p className="text-[#6B7280] text-sm">Your profile currently has no registered organizational hardware.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onReport={triggerReportIssue} 
            />
          ))}
        </div>
      )}

      {/* Asset Requests Section */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-white">Hardware Request History</h3>
        </div>


        {requests.length === 0 ? (
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-[12px] p-12 text-center">
            <p className="text-[#6B7280] font-medium italic">No historical hardware requests found.</p>
          </div>
        ) : (
          <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
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
                      <p className="text-[14px] text-slate-300 font-medium truncate max-w-xs">{req.reason}</p>
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
          </div>
        )}
      </div>

      {/* Request Asset Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Request Hardware</h3>
            </div>
            <form onSubmit={handleAssetRequest} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Category Selection</label>
                <select 
                  className="w-full bg-[#0F1117] border border-[#2A2D3E] text-white rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm font-bold"
                  value={requestFormData.asset_type}
                  onChange={e => setRequestFormData({...requestFormData, asset_type: e.target.value})}
                >
                  <option value="Laptop">Standard Laptop</option>
                  <option value="Desktop">Desktop Workstation</option>
                  <option value="Monitor">External Monitor</option>
                  <option value="Peripherals">Peripherals (Input Devices)</option>
                  <option value="Mobile">Mobile Cellular</option>
                  <option value="Furniture">Ergonomic Furniture</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Technical Justification</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full bg-[#0F1117] border border-[#2A2D3E] text-white rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all resize-none text-sm placeholder-slate-600 font-medium" 
                  value={requestFormData.reason} 
                  onChange={e => setRequestFormData({...requestFormData, reason: e.target.value})} 
                  placeholder="e.g. Current workstation performance is insufficient for development..." 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg border-none text-sm">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center border border-[#EF4444]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Report Incident</h3>
            </div>
            <form onSubmit={handleReportIssue} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Failure Details</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-[#0F1117] border border-[#2A2D3E] text-white rounded-lg px-4 py-3 outline-none focus:border-[#EF4444] transition-all resize-none text-sm placeholder-slate-600 font-medium" 
                  value={issueDescription} 
                  onChange={e => setIssueDescription(e.target.value)} 
                  placeholder="e.g. Display shows persistent artifacts, possible GPU failure..." 
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-[#EF4444] hover:bg-[#F87171] text-white font-bold py-3 rounded-lg shadow-lg border-none text-sm">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
