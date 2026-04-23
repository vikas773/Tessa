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
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[#6366F1] font-black uppercase tracking-[3px] text-[10px] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse"></span>
            Operational Status: Nominal
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Systems Overview</h2>
          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">"Real-time visibility into organizational assets and fleet reliability."</p>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Inventory', value: stats?.total_assets ?? 0, color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { label: 'Ready to Assign', value: stats?.available_assets ?? 0, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { label: 'Asset Utilization', value: stats?.assigned_assets ?? 0, color: '#6366F1', bg: 'rgba(99,102,241,0.1)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Active Reports', value: stats?.maintenance_assets ?? 0, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1A1D27] p-8 rounded-xl border border-[#2A2D3E] shadow-xl flex flex-col gap-6 relative overflow-hidden group hover:border-[#6366F1]/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent -mr-16 -mt-16 rounded-full blur-2xl"></div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border transition-transform duration-500 group-hover:scale-110" style={{ color: stat.color, backgroundColor: stat.bg, borderColor: `${stat.color}33` }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1 tracking-tight">{stat.value}</p>
              <p className="text-[12px] font-medium uppercase tracking-wider text-[#6B7280]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-[#2A2D3E] flex items-center justify-between bg-[#13151F]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Global Activity Trail
            </h3>
            <span className="text-[10px] bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 font-black px-2 py-1 rounded-md uppercase tracking-widest">Secure Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 pr-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Syncing secure logs...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#6B7280] gap-4">
                <div className="w-16 h-16 bg-[#0F1117] rounded-full flex items-center justify-center border border-[#2A2D3E]">
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586-3.586a2 2 0 112.828 2.828L16 16m-2 2l1.586 1.586a2 2 0 01-2.828 2.828L12 20m-2-2l-1.586 1.586a2 2 0 002.828 2.828L10 16m-2-2l3.586-3.586a2 2 0 012.828-2.828L12 14"></path></svg>
                </div>
                <p className="font-bold text-sm tracking-tight text-slate-500">No organizational activities captured yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-5 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#0F1117] border border-[#2A2D3E] flex items-center justify-center shrink-0 group-hover:bg-[#6366F1]/10 group-hover:border-[#6366F1]/30 group-hover:text-[#6366F1] transition-all">
                        <svg className="w-4 h-4 text-[#6B7280] group-hover:text-[#6366F1] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                      </div>
                      {idx !== activities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-8 bg-[#2A2D3E] z-0"></div>}
                    </div>
                    <div className="flex-1 pb-4 relative z-10 pt-1">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors">{activity.action}</p>
                        <span className="text-[10px] font-bold text-[#6B7280] whitespace-nowrap bg-[#0F1117] px-2 py-1 rounded border border-[#2A2D3E]">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] font-black uppercase tracking-widest">Validated &bull; #{activity.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Reports */}
        <div className="space-y-8">
          {/* Condition Reports Preview */}
          <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b border-[#2A2D3E] flex items-center justify-between bg-[#13151F]">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Critical Reports
                </h3>
                <Link href="/reports" className="text-[10px] text-[#6366F1] font-black uppercase tracking-widest hover:underline">View All</Link>
             </div>
             <div className="p-4 space-y-3">
                {reports.length === 0 ? (
                  <p className="text-[#6B7280] text-xs font-medium text-center py-8">No critical reports pending.</p>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="p-4 bg-[#0F1117] rounded-lg border border-[#2A2D3E] group hover:border-[#EF4444]/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[13px] font-bold text-white truncate">Asset #{report.asset_id}</p>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">Pending</span>
                      </div>
                      <p className="text-[12px] text-[#6B7280] font-medium line-clamp-2 leading-relaxed">{report.issue_description}</p>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 gap-4">
             <Link href="/assets" className="group">
                <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] flex items-center gap-4 hover:border-[#6366F1]/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center shrink-0 border border-[#6366F1]/20 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Assets Hub</p>
                    <p className="text-[11px] text-[#6B7280] font-medium">Manage inventory levels</p>
                  </div>
                </div>
             </Link>
             <Link href="/requests" className="group">
                <div className="bg-[#1A1D27] p-6 rounded-xl border border-[#2A2D3E] flex items-center gap-4 hover:border-[#10B981]/30 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/20 group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Procurement</p>
                    <p className="text-[11px] text-[#6B7280] font-medium">Authorize hardware requests</p>
                  </div>
                </div>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
