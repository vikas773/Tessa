"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [pathname, isMobileMenuOpen]);

  // Avoid hydration mismatch by rendering a simplified or empty version until mounted
  if (!mounted) {
    return <div className="h-screen w-full bg-[#0F1117]" />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0F1117] text-slate-100 overflow-hidden font-sans">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#13151F] border-b border-[#2A2D3E] z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center font-black text-white shadow-[#6366F1]/20 shadow-lg text-sm shrink-0">
            T
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Tessa<span className="text-[#6366F1]">.</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-[#1A1D27] rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0F1117]/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#13151F] border-r border-[#2A2D3E] flex flex-col pt-8 pb-6 px-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Close Button & Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6366F1] flex items-center justify-center font-black text-white shadow-[#6366F1]/20 shadow-lg text-lg shrink-0">
              T
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tessa<span className="text-[#6366F1]">.</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-[#1A1D27] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname === '/' ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            {isEmployee ? 'My Workspace' : 'System Overview'}
          </Link>
          
          {canManage && (
            <>
              <Link href="/assets" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/assets') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Assets Hub
              </Link>
              <Link href="/employees" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/employees') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Employee Directory
              </Link>
              <Link href="/reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/reports') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Reports
              </Link>
              <Link href="/requests" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/requests') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                Asset Requests
              </Link>
            </>
          )}

          {isEmployee && (
            <>
              <Link href="/my-reports" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/my-reports') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                My Reports
              </Link>
              <Link href="/my-requests" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/my-requests') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                My Requests
              </Link>
            </>
          )}
        </nav>


        <div className="mt-6 border-t border-[#2A2D3E] pt-6 px-2">
          <div className="flex items-center gap-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 text-[#6366F1] font-bold flex items-center justify-center shrink-0 border border-[#6366F1]/20">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate">{userName || 'User'}</p>
              <p className="text-[11px] font-bold text-slate-500 truncate uppercase tracking-tight">{role || 'Role'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg text-[13px] font-bold transition-all outline-none group border-none">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-[#0F1117] p-8 md:p-10 lg:p-12">
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
