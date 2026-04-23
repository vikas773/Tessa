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
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [requestFormData, setRequestFormData] = useState({ asset_type: 'Laptop', reason: '' });

  const fetchMyAssets = useCallback(async () => {
    const token = localStorage.getItem('tessa_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${API_URL}/api/assets/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch my assets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAssets();
  }, [fetchMyAssets]);

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
      fetchMyAssets(); // Refresh assets to show updated status
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
        alert("Your asset request has been submitted successfully.");
      }
    } catch (err) {
      console.error("Error submitting request", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 lg:px-12 lg:py-14">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">My Hardware Assets</h2>
          <p className="text-base md:text-lg text-slate-400 font-medium">View your assigned equipment and report technical issues instantly.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 border-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Request New Asset
        </button>
      </header>
      
      {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Equipment...</p>
          </div>
      ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-sm">
            <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-700">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-white font-bold text-xl mb-2">No Hardware Assigned</p>
            <p className="text-slate-400 text-sm">You currently do not have any devices registered to your profile.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onReport={triggerReportIssue} 
            />
          ))}
        </div>
      )}

      {/* Request Asset Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-black/50">
            <h3 className="text-2xl font-black mb-4 text-white">Request New Asset</h3>
            <p className="text-slate-400 text-sm mb-6 font-medium">Select the type of hardware or furniture you need and provide a brief reason.</p>
            <form onSubmit={handleAssetRequest} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Asset Category</label>
                <select 
                  className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                  value={requestFormData.asset_type}
                  onChange={e => setRequestFormData({...requestFormData, asset_type: e.target.value})}
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Peripherals">Peripherals (Keyboard/Mouse)</option>
                  <option value="Mobile">Mobile Phone</option>
                  <option value="Furniture">Office Furniture</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Reason for Request</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-inner placeholder-slate-500 font-medium" 
                  value={requestFormData.reason} 
                  onChange={e => setRequestFormData({...requestFormData, reason: e.target.value})} 
                  placeholder="e.g. Current laptop is slow, need a monitor for dual screen setup..." 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="flex-1 bg-transparent text-slate-400 font-bold hover:bg-slate-800/50 transition-all rounded-xl py-3" onClick={() => setShowRequestModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all rounded-xl py-3">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-black/50">
            <h3 className="text-2xl font-black mb-4 text-white">Maintenance Request</h3>
            <p className="text-slate-400 text-sm mb-6 font-medium">Describe the problem with your device. IT support will review this ticket.</p>
            <form onSubmit={handleReportIssue} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Issue Description</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none shadow-inner placeholder-slate-500 font-medium" 
                  value={issueDescription} 
                  onChange={e => setIssueDescription(e.target.value)} 
                  placeholder="e.g. Screen is flickering..." 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="flex-1 bg-transparent text-slate-400 font-bold hover:bg-slate-800/50 transition-all rounded-xl py-3" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all rounded-xl py-3">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
