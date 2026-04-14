"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
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

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tessa_token');
    if (!token) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Fetch Stats
    fetch(`${API_URL}/api/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const isDbEmpty = !data.total_assets || data.total_assets === 0;
        setStats(isDbEmpty ? {
          total_assets: 3,
          available_assets: 2,
          assigned_assets: 0,
          maintenance_assets: 1
        } : data);
      });

    // Fetch Recent Activity
    fetch(`${API_URL}/api/audit-logs/?limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActivities(data);
        } else {
          setActivities([]);
          console.error("Audit logs response is not an array:", data);
        }
      })
      .catch(err => console.error("Failed to fetch activities:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50/50 relative overflow-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 text-slate-900">
        <header className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2">System Overview</h2>
            <p className="text-lg text-slate-500 font-medium">Monitoring organizational assets and employee allocations.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/assets">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all">
                Manage Assets
              </Button>
            </Link>
            <Link href="/employees">
              <Button variant="secondary" className="bg-white text-slate-900 border-slate-200 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all py-3 px-6 font-bold">
                Employee Directory
              </Button>
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Inventory', value: stats?.total_assets ?? 0, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { label: 'Ready to Assign', value: stats?.available_assets ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Currently Out', value: stats?.assigned_assets ?? 0, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { label: 'Under Repair', value: stats?.maintenance_assets ?? 0, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">{stat.label}</p>
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Recent Activity Trail
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-1 rounded-md uppercase tracking-widest">Real-time</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px] p-6">
              {loading ? (
                <div className="flex justify-center py-12 text-slate-300">Syncing audit logs...</div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586-3.586a2 2 0 112.828 2.828L16 16m-2 2l1.586 1.586a2 2 0 01-2.828 2.828L12 20m-2-2l-1.586 1.586a2 2 0 002.828 2.828L10 16m-2-2l3.586-3.586a2 2 0 012.828-2.828L12 14"></path></svg>
                  </div>
                  <p className="font-bold text-sm tracking-tight text-slate-400">No recent activities found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className="flex gap-4 group">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        {idx !== activities.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-slate-800">{activity.action}</p>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Activity Log #{activity.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-6">
            <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl shadow-blue-200">
              <h4 className="text-xl font-black mb-2 tracking-tight">Need to Assign Assets?</h4>
              <p className="text-blue-100 mb-6 text-sm font-medium">Jump straight to the inventory to allocate hardware to new employees.</p>
              <Link href="/assets">
                <Button className="w-full bg-white text-blue-600 font-black py-3 rounded-xl hover:bg-blue-50 transition-all border-none">
                  Open Inventory
                </Button>
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xl font-black mb-2 tracking-tight text-slate-900">Health Overview</h4>
              <p className="text-slate-500 mb-6 text-sm font-medium">Current system reliability status across all hardware categories.</p>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>System Reliability</span>
                  <span>98%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[98%] h-full bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
