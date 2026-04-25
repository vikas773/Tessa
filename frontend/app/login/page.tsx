"use client";

import React, { useState } from 'react';
import Button from '../../components/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // FormData is required by FastAPI OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', email); // FastAPI maps username -> email from form
    formData.append('password', password);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      
      // Save Token securely in local storage
      localStorage.setItem('tessa_token', data.access_token);
      localStorage.setItem('tessa_user', JSON.stringify(data.user));
      
      // Redirect to main dashboard
      window.location.href = '/';

    } catch (err: any) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1623] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#2563eb15,transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="w-full max-w-md p-10 rounded-[32px] z-10 mx-4 shadow-2xl shadow-black/50 bg-[#1a2235]/80 border border-white/5 backdrop-blur-xl transition-all hover:border-white/10">
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-[#0f1623] border border-white/10 flex items-center justify-center font-black text-white text-3xl shadow-2xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">T</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Tessa<span className="text-blue-500">Cloud</span></h2>
          <p className="text-slate-400 text-sm font-medium">Enterprise Asset Management Redefined</p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2 ml-1">Work Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#0f1623] border border-white/5 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xl"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Password</label>
              <button type="button" className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[1px] transition-colors">Forgot Password?</button>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-[#0f1623] border border-white/5 rounded-xl px-5 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-2xl"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/10 bg-[#0f1623] text-blue-600 focus:ring-blue-500/40 transition-all cursor-pointer" />
            <label htmlFor="remember" className="text-xs font-bold text-slate-400 cursor-pointer">Remember this session</label>
          </div>

          <Button type="submit" disabled={loading} className="mt-4 py-4 rounded-xl shadow-2xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 border-none transition-all font-black text-xs uppercase tracking-[2px]">
            {loading ? "Authenticating..." : "Establish Secure Link"}
          </Button>
        </form>
        
        <p className="mt-10 text-center text-[10px] font-bold text-slate-600 uppercase tracking-[1px]">
          &copy; 2026 Tessa Cloud Security &bull; v2.4.0
        </p>
      </div>
    </main>

  );
}
