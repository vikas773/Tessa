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
    <div className="flex h-screen w-full bg-[#022c22] text-emerald-50 overflow-hidden font-sans">
      {/* Sidebar - Dark Green */}
      <aside className="w-72 bg-[#064e3b] border-r border-[#065f46] flex flex-col pt-8 pb-6 px-6 shrink-0 relative z-20">
         <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white shadow-emerald-500/20 shadow-lg text-xl shrink-0">
              T
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tessa<span className="text-emerald-400">.</span>
            </h1>
         </div>
         
         <nav className="flex-1 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 text-emerald-300 rounded-xl font-bold transition-all border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
              <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              My Workspace
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 text-emerald-200/50 hover:text-white hover:bg-emerald-800/50 border border-transparent rounded-xl font-bold transition-all cursor-not-allowed">
              <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Support Tickets (Soon)
            </div>
         </nav>
  
         <div className="mt-8 border-t border-[#065f46] pt-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-emerald-200/50 hover:text-emerald-200 hover:bg-emerald-800/50 border border-transparent rounded-xl font-bold transition-all outline-none group">
              <svg className="w-5 h-5 mx-0.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar-green">
        <div className="max-w-6xl mx-auto px-8 py-10 lg:px-12 lg:py-14">
          <header className="mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2 text-shadow-sm">My Hardware Assets</h2>
             <p className="text-lg text-emerald-200/70 font-medium">View your assigned equipment and report technical issues instantly.</p>
          </header>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24">
               <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Loading Equipment...</p>
             </div>
          ) : assets.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-24 bg-[#064e3b]/30 rounded-3xl border border-emerald-800/50 shadow-inner">
               <div className="w-20 h-20 bg-emerald-900/50 rounded-full flex items-center justify-center mb-6 border border-emerald-800">
                 <svg className="w-10 h-10 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <p className="text-emerald-100 font-bold text-xl mb-2">No Hardware Assigned</p>
               <p className="text-emerald-300/60 text-sm">You currently do not have any devices registered to your profile.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {assets.map((asset) => (
                 <div key={asset.id} className="bg-[#064e3b]/80 backdrop-blur-md rounded-3xl p-6 hover:shadow-2xl hover:shadow-emerald-900/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col gap-6 group border border-emerald-700/50">
                    <div className="flex justify-between items-start">
                       <div className="max-w-[70%]">
                         <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors truncate drop-shadow-md">{asset.name}</h3>
                         <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mt-1.5">{asset.type}</p>
                       </div>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         asset.status === 'Available' || asset.status === 'Assigned' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30' :
                         asset.status === 'Broken' ? 'text-red-300 bg-red-500/20 border-red-400/30' :
                         'text-amber-300 bg-amber-500/20 border-amber-400/30'
                       }`}>
                         {asset.status}
                       </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#022c22]/50 border border-[#065f46]/50 group-hover:bg-[#022c22]/80 transition-colors shadow-inner">
                       <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-black mb-1.5">Inventory Serial Number</p>
                       <p className="text-sm text-emerald-100 font-mono font-bold tracking-tight">{asset.serial_number || 'PENDING-TAG'}</p>
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
        </div>
      </main>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-[#022c22]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#064e3b] border border-emerald-700/50 rounded-3xl w-full max-w-md p-8 shadow-2xl shadow-black/50">
            <h3 className="text-2xl font-black mb-4 text-white">Maintenance Request</h3>
            <p className="text-emerald-200/70 text-sm mb-6 font-medium">Describe the problem with your device. IT support will review this ticket.</p>
            <form onSubmit={handleReportIssue} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Issue Description</label>
                <textarea 
                  required 
                  rows={4}
                  className="w-full bg-[#022c22] border border-emerald-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none shadow-inner placeholder-emerald-700 font-medium" 
                  value={issueDescription} 
                  onChange={e => setIssueDescription(e.target.value)} 
                  placeholder="e.g. Screen is flickering..." 
                />
              </div>
              <div className="flex gap-4 mt-4">
                <button type="button" className="flex-1 bg-transparent text-emerald-300 font-bold hover:bg-emerald-800/50 transition-all rounded-xl py-3" onClick={() => setShowReportModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20 transition-all rounded-xl py-3">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styles for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar-green::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-green::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-green::-webkit-scrollbar-thumb { background-color: #065f46; border-radius: 10px; }
        .custom-scrollbar-green:hover::-webkit-scrollbar-thumb { background-color: #10b981; }
      `}} />
    </div>
  );
}
