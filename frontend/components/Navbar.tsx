import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 w-full mb-0 px-8 py-4 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-blue-200 shadow-lg text-xl">
          T
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Tessa<span className="text-blue-600">.</span>
        </h1>
      </div>
      <div className="flex gap-10 text-sm font-bold text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors relative group py-2">
          Dashboard
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
        </Link>
        <Link href="/assets" className="hover:text-blue-600 transition-colors relative group py-2">
          Assets Hub
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
        </Link>
        <Link href="/employees" className="hover:text-blue-600 transition-colors relative group py-2">
          Employees Directory
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        </div>
      </div>
    </nav>
  );
}
