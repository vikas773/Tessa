import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

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
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [issueDescription, setIssueDescription] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('tessa_token');
    localStorage.removeItem('tessa_user');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 lg:px-12 lg:py-14">
      <header className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">My Hardware Assets</h2>
        <p className="text-base md:text-lg text-slate-400 font-medium">View your assigned equipment and report technical issues instantly.</p>
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
              <div key={asset.id} className="bg-[#0f172a]/80 backdrop-blur-sm rounded-3xl p-6 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-6 group border border-slate-700/50">
                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors truncate">{asset.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{asset.type}</p>
                    </div>
                    <span className={`shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      asset.status === 'Available' || asset.status === 'Assigned' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      asset.status === 'Broken' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {asset.status}
                    </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#1e293b]/50 border border-slate-700/50 group-hover:bg-[#1e293b]/80 group-hover:border-slate-600 transition-colors shadow-inner">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">Inventory Serial Number</p>
                    <p className="text-sm text-slate-300 font-mono font-bold tracking-tight">{asset.serial_number || 'PENDING-TAG'}</p>
                </div>

                {(asset.status === 'Available' || asset.status === 'Assigned') && (
                  <div className="mt-auto pt-2 w-full">
                      <button 
                        onClick={() => triggerReportIssue(asset.id)}
                        className="w-full bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 transition-all text-red-400 hover:text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 text-sm"
                      >
                        Report Damage / Issue
                      </button>
                  </div>
                )}
              </div>
          ))}
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
