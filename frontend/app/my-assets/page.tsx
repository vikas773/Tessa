"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';
import AssetCard from '../../components/AssetCard';

interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string;
  status: string;
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [issueDescription, setIssueDescription] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('tessa_token');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/assets/my`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        fetchData();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12">
          <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">My Inventory</h2>
          <p className="text-[#6B7280] font-medium">&quot;Complete registry of organizational hardware assigned to your profile.&quot;</p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-[#1A2235] rounded-3xl animate-pulse border border-white/5"></div>)}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl">
            <div className="w-20 h-20 bg-[#0f1623] rounded-full flex items-center justify-center mb-6 border border-white/5">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">No Assets Found</h3>
            <p className="text-slate-500 text-sm font-medium">Your profile currently has no registered organizational hardware.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.map(asset => (
              <AssetCard key={asset.id} asset={asset} onReport={triggerReportIssue} />
            ))}
          </div>
        )}
      </div>

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
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Fault Description</label>
                <textarea required rows={5} className="w-full bg-[#0F1117] border border-white/5 text-white rounded-xl px-5 py-4 outline-none focus:border-orange-500 transition-all resize-none text-sm placeholder-slate-600 font-medium" value={issueDescription} onChange={e => setIssueDescription(e.target.value)} placeholder="Describe the technical anomaly..." />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-black py-4 transition-all text-xs uppercase tracking-widest border-none" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl shadow-xl shadow-orange-600/20 border-none text-xs uppercase tracking-widest">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
