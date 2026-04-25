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
  const [notifications, setNotifications] = useState(3); // Mock count

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

  // Avoid hydration mismatch
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
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            {notifications > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#13151F]">{notifications}</span>}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1A1D27] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
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
        
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#6366F1] to-indigo-600 rounded-xl blur-[2px] opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-10 h-10 rounded-xl bg-[#1a2235] border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">T</span>
              </div>
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

        <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-1">
          <div>
            <p className="px-3 mb-4 text-[10px] font-black text-[#64748b] uppercase tracking-[2px]">Management</p>
            <div className="space-y-1">
              <Link href="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname === '/' ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                {isEmployee ? 'My Dashboard' : 'System Overview'}
              </Link>
              
              {canManage && (
                <>
                  <Link href="/assets" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/assets') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    Assets Hub
                  </Link>
                  <Link href="/employees" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/employees') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Personnel Registry
                  </Link>
                </>
              )}
              {isEmployee && (
                <Link href="/my-assets" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${pathname?.startsWith('/my-assets') ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  My Assets
                </Link>
              )}
            </div>
          </div>

          <div>
            <p className="px-3 mb-4 text-[10px] font-black text-[#64748b] uppercase tracking-[2px]">Operations</p>
            <div className="space-y-1">
              <Link href={isEmployee ? "/my-reports" : "/reports"} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${(pathname?.startsWith('/reports') || pathname?.startsWith('/my-reports')) ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path></svg>
                {isEmployee ? 'Report Issue' : 'Condition Reports'}
              </Link>
              <Link href={isEmployee ? "/my-requests" : "/requests"} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all border-l-2 ${(pathname?.startsWith('/requests') || pathname?.startsWith('/my-requests')) ? 'text-[#6366F1] border-[#6366F1] bg-[#6366F1]/5' : 'text-slate-400 hover:text-white hover:bg-[#1A1D27] border-transparent'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586-3.586a2 2 0 112.828 2.828L16 16m-2 2l1.586 1.586a2 2 0 01-2.828 2.828L12 20m-2-2l-1.586 1.586a2 2 0 002.828 2.828L10 16m-2-2l3.586-3.586a2 2 0 012.828-2.828L12 14"></path></svg>
                {isEmployee ? 'Request Asset' : 'Asset Requests'}
              </Link>
            </div>
          </div>
        </nav>

        <div className="mt-6 border-t border-[#2A2D3E] pt-6 px-2">
          <div className="flex items-center gap-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 text-[#6366F1] font-bold flex items-center justify-center shrink-0 border border-[#6366F1]/20">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-[13px] font-bold text-white truncate">{userName || 'User'}</p>
              <p className="text-[11px] font-bold text-[#64748b] truncate uppercase tracking-tight">{role || 'Role'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-[#EF4444] hover:bg-[#EF4444]/5 rounded-lg text-[13px] font-bold transition-all outline-none group border-none">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header with Breadcrumbs & Notifications */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-[#0F1117] border-b border-[#2A2D3E] z-20">
          <div className="flex items-center gap-2 text-[12px] font-bold">
             <Link href="/" className="text-[#64748b] hover:text-[#6366F1] transition-colors">Home</Link>
             {pathname !== '/' && (
               <>
                 <span className="text-slate-800">/</span>
                 <span className="text-slate-400 capitalize">{pathname.split('/').filter(x => x).map(p => p.replace(/-/g, ' ')).join(' / ')}</span>
               </>
             )}
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-[#64748b] hover:text-white transition-colors group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              {notifications > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0F1117]">{notifications}</span>}
            </button>
            <div className="w-px h-6 bg-[#2A2D3E]"></div>
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{userName}</p>
                  <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{role}</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white font-black text-sm border-2 border-[#2A2D3E] shadow-lg shadow-[#6366F1]/20">
                 {userName?.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar bg-[#0F1117] p-8 md:p-10 lg:p-12">
          {children}
        </main>
      </div>

      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #475569; }
      `}} />
    </div>
  );
}
