"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    const userRaw = localStorage.getItem('tessa_user');
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setRole(user.role);
        if (user.name) {
          setUserName(user.name);
        }
      } catch (e) {}
    }
  }, []);

  const canManage = role === 'Admin' || role === 'Manager';
  const isEmployee = role === 'Employee';

  const handleLogout = () => {
    localStorage.removeItem('tessa_token');
    localStorage.removeItem('tessa_user');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen w-full bg-[#1e293b] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800/50 flex flex-col pt-8 pb-6 px-6 shrink-0 relative z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-blue-500/20 shadow-lg text-xl shrink-0">
            T
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Tessa<span className="text-blue-500">.</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border ${pathname === '/' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'}`}>
            <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            {isEmployee ? 'My Workspace' : 'System Overview'}
          </Link>
          
          {canManage && (
            <>
              <Link href="/assets" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border ${pathname.startsWith('/assets') ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'}`}>
                <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Assets Hub
              </Link>
              <Link href="/employees" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border ${pathname.startsWith('/employees') ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]' : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'}`}>
                <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Employee Directory
              </Link>
            </>
          )}

          {isEmployee && (
            <div className="flex items-center gap-3 px-4 py-3 text-slate-400/50 hover:text-white hover:bg-slate-800/50 border border-transparent rounded-xl font-bold transition-all cursor-not-allowed">
              <svg className="w-5 h-5 mx-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Support Tickets (Soon)
            </div>
          )}
        </nav>

        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-white truncate">{userName || 'User'}</p>
              <p className="text-xs font-semibold text-slate-400 truncate">{role || 'Role'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 border border-transparent rounded-xl font-bold transition-all outline-none group">
            <svg className="w-5 h-5 mx-0.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-[#1e293b]">
        {children}
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #475569; }
      `}} />
    </div>
  );
}
