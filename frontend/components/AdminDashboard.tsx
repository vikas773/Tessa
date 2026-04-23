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

  useEffect(() => {
    const token = localStorage.getItem('tessa_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => {
        setStats({
          total_assets: data.total_assets || 0,
          available_assets: data.available_assets || 0,
          assigned_assets: data.assigned_assets || 0,
          maintenance_assets: data.maintenance_assets || 0
        });
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setStats({
          total_assets: 0,
          available_assets: 0,
          assigned_assets: 0,
          maintenance_assets: 0
        });
      });

    fetch(`${API_URL}/api/audit-logs/?limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch activities');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          setActivities([]);
        }
      })
      .catch(err => console.error("Failed to fetch activities:", err));

    fetch(`${API_URL}/api/maintenance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setReports(Array.isArray(data) ? data.slice(0, 5) : []);
      })
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tessa_token');
    localStorage.removeItem('tessa_user');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 lg:px-12 lg:py-14">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Live Dashboard
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Systems Overview</h2>
          <p className="text-base md:text-lg text-slate-400 font-medium max-w-2xl">Monitor organizational assets, reliability, and automated real-time audit logs across the fleet.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Inventory', value: stats?.total_assets ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
          { label: 'Ready to Assign', value: stats?.available_assets ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Currently Out', value: stats?.assigned_assets ?? 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { label: 'Under Repair', value: stats?.maintenance_assets ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0f172a]/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 group">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-0.5">{stat.label}</p>
              <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Activity Trail
            </h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-[0_0_10px_-2px_rgba(59,130,246,0.2)]">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pr-4">
            {loading ? (
              <div className="flex justify-center py-12 text-slate-500 font-medium">Syncing secure logs...</div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
                <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586-3.586a2 2 0 112.828 2.828L16 16m-2 2l1.586 1.586a2 2 0 01-2.828 2.828L12 20m-2-2l-1.586 1.586a2 2 0 002.828 2.828L10 16m-2-2l3.586-3.586a2 2 0 012.828-2.828L12 14"></path></svg>
                </div>
                <p className="font-bold text-sm tracking-tight text-slate-400">No organizational activities captured yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-5 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-all shadow-inner">
                        <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                      </div>
                      {idx !== activities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-800 z-0"></div>}
                    </div>
                    <div className="flex-1 pb-4 relative z-10 pt-1">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[15px] font-bold text-slate-200">{activity.action}</p>
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700/50">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Trace ID #{activity.id} &bull; Validated</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Maintenance Reports */}
        <div className="bg-[#0f172a]/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Active Reports
            </h3>
            <Link href="/reports" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">View All &rarr;</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-6 pr-4">
            {loading ? (
              <div className="flex justify-center py-12 text-slate-500 font-medium">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4 text-center">
                <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="font-bold text-sm tracking-tight text-slate-400 px-4">All systems clear. No active maintenance reports.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Asset #{report.asset_id}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">{report.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{report.issue_description}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="space-y-6">
          {/* Asset Allocation Card */}
          <div className="bg-[#0f172a]/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-sm text-center flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h4 className="text-xl font-black text-white mb-2 tracking-tight">Asset Allocation</h4>
            <p className="text-slate-400 text-sm font-medium mb-6">Streamline onboarding by immediately dispatching hardware directly from inventory.</p>
            <Link href="/assets" className="block mt-auto">
              <button className="w-full bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 font-extrabold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center">
                Open Datacenter Hub
              </button>
            </Link>
          </div>

          {/* Register Asset Card */}
          <div className="bg-[#0f172a]/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-sm text-center flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <h4 className="text-xl font-black text-white mb-2 tracking-tight">Register New Asset</h4>
            <p className="text-slate-400 text-sm font-medium mb-6">Add a new device to the corporate inventory and assign it instantly.</p>
            <Link href="/assets" className="block mt-auto">
              <button className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 font-extrabold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center">
                Register Asset
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
