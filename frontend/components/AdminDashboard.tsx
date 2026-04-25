import React, { useEffect, useState } from 'react';
import Button from './Button';
import Link from 'next/link';

interface AuditLog {
  id: number;
  action: string;
  user_id?: number;
  asset_id?: number;
  timestamp: string;
}

interface Stats {
  total_assets: number;
  assigned_assets: number;
  available_assets: number;
  maintenance_assets: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [selectedActivity, setSelectedActivity] = useState<AuditLog | null>(null);
  const [dateFilter, setDateFilter] = useState('Today');

  useEffect(() => {
    const token = localStorage.getItem('tessa_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats({
          total_assets: data.total_assets || 0,
          available_assets: data.available_assets || 0,
          assigned_assets: data.assigned_assets || 0,
          maintenance_assets: data.maintenance_assets || 0
        });
        setLastUpdated(new Date().toLocaleTimeString());
      })
      .catch(err => console.error("Error fetching stats:", err));

    fetch(`${API_URL}/api/audit-logs/?limit=15`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setActivities(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch activities:", err));

    fetch(`${API_URL}/api/maintenance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data.slice(0, 5) : []))
      .finally(() => setLoading(false));
  }, []);

  // Simple SVG Donut Chart
  const renderDonut = () => {
    if (!stats) return null;
    const total = stats.total_assets || 1;
    const available = (stats.available_assets / total) * 100;
    const assigned = (stats.assigned_assets / total) * 100;
    const maintenance = (stats.maintenance_assets / total) * 100;
    
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#2A2D3E" strokeWidth="3" />
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10B981" strokeWidth="3" strokeDasharray={`${available} ${100 - available}`} strokeDashoffset="0" />
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#6366F1" strokeWidth="3" strokeDasharray={`${assigned} ${100 - assigned}`} strokeDashoffset={`-${available}`} />
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${maintenance} ${100 - maintenance}`} strokeDashoffset={`-${available + assigned}`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               System Live
             </span>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last updated: {lastUpdated}</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Operations Dashboard</h2>
          </div>
          <p className="text-lg text-[#6B7280] font-medium">&quot;Strategic oversight of organizational infrastructure and asset reliability.&quot;</p>
        </div>
        
        <div className="flex gap-3">
           <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 font-bold text-xs uppercase tracking-widest transition-all">Export Report</button>
           <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl shadow-xl shadow-blue-500/20 font-bold text-xs uppercase tracking-widest transition-all border-none">Sync Nodes</button>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Inventory', value: stats?.total_assets ?? 0, color: '#6366F1', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { label: 'Total Value', value: `$${((stats?.total_assets ?? 0) * 1250).toLocaleString()}`, color: '#10B981', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Utilization', value: stats?.assigned_assets ?? 0, color: '#818CF8', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Critical', value: stats?.maintenance_assets ?? 0, color: '#F59E0B', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1A2235] p-8 rounded-2xl border border-white/5 shadow-2xl group hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110" style={{ color: stat.color, backgroundColor: `${stat.color}15`, borderColor: `${stat.color}25` }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
              </div>
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Live</span>
            </div>
            <div>
              <p className="text-4xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap gap-4 mb-12 p-2 bg-[#1A2235]/50 rounded-2xl border border-white/5">
         <Link href="/assets" className="flex-1 min-w-[200px] flex items-center gap-4 p-4 bg-[#1A2235] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">Register Asset</span>
         </Link>
         <Link href="/employees" className="flex-1 min-w-[200px] flex items-center gap-4 p-4 bg-[#1A2235] rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">Add Employee</span>
         </Link>
         <Link href="/reports" className="flex-1 min-w-[200px] flex items-center gap-4 p-4 bg-[#1A2235] rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H5m11 9a4 4 0 01-4-4v-2m0 0l4 4m-4-4l-4 4m5-10V3m0 0L9 7m3-4l3 4"></path></svg>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-widest">View Reports</span>
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1f2937]/30 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Global Activity Trail</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time system event logs</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0f1623] p-1 rounded-xl border border-white/5">
              {['Today', 'This Week', 'This Month'].map(t => (
                <button 
                  key={t}
                  onClick={() => setDateFilter(t)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-[3px] text-[10px]">Establishing Secure Link...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((activity, idx) => (
                  <div 
                    key={activity.id} 
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0f1623] border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{activity.action}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Transaction Node &bull; {activity.id}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-white">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution & Critical Reports */}
        <div className="space-y-8">
          <div className="bg-[#1A2235] p-8 rounded-[32px] border border-white/5 shadow-2xl flex flex-col items-center">
             <h3 className="text-sm font-black text-white uppercase tracking-[2px] mb-8 w-full">Asset Allocation</h3>
             {renderDonut()}
             <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {[
                  { label: 'Assigned', color: 'bg-[#6366F1]', value: stats?.assigned_assets },
                  { label: 'Available', color: 'bg-[#10B981]', value: stats?.available_assets },
                  { label: 'Repair', color: 'bg-[#F59E0B]', value: stats?.maintenance_assets },
                  { label: 'Broken', color: 'bg-[#EF4444]', value: 0 }
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 p-3 bg-[#0f1623] rounded-xl border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                       <p className="text-sm font-bold text-white leading-none">{item.value || 0}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1f2937]/30">
                <h3 className="text-xs font-black text-white uppercase tracking-[2px]">Urgent Reports</h3>
                <Link href="/reports" className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:underline">Full Audit</Link>
             </div>
             <div className="p-4 space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="p-4 bg-[#0f1623] rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs font-black text-white uppercase">Asset Node #{report.asset_id}</p>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">Awaiting Service</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{report.issue_description}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Activity Detail Drawer */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="absolute inset-0 bg-[#0f1623]/80 backdrop-blur-sm" onClick={() => setSelectedActivity(null)}></div>
           <div className="relative w-full max-w-md bg-[#1A2235] border-l border-white/10 h-screen shadow-2xl p-10 flex flex-col">
              <div className="flex justify-between items-start mb-12">
                 <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <button onClick={() => setSelectedActivity(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>
              
              <div className="flex-1">
                 <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[3px] mb-2">Event Metadata</h3>
                 <h2 className="text-3xl font-black text-white tracking-tight mb-8 leading-tight italic uppercase">{selectedActivity.action}</h2>
                 
                 <div className="space-y-6">
                    <div className="p-6 bg-[#0f1623] rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Transaction UUID</p>
                       <p className="text-sm font-mono text-white">TXN-{selectedActivity.id}-SEC-2026</p>
                    </div>
                    <div className="p-6 bg-[#0f1623] rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Timestamp</p>
                       <p className="text-sm text-white font-bold">{new Date(selectedActivity.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-[#0f1623] rounded-2xl border border-white/5">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Node Origin</p>
                       <p className="text-sm text-white font-bold">Cloud Infrastructure Delta-7</p>
                    </div>
                 </div>
              </div>
              
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-[2px] transition-all border-none">Acknowledge Audit</button>
           </div>
        </div>
      )}
    </div>
  );
}

