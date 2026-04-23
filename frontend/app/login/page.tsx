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
    <main className="min-h-screen flex items-center justify-center bg-[#1e293b] relative overflow-hidden">
      <div className="w-full max-w-md p-8 rounded-3xl z-10 mx-4 shadow-2xl shadow-black/50 bg-[#0f172a] border border-slate-700/50 backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-2xl">
            T
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Tessa Cloud</h2>
        <p className="text-slate-400 text-center text-sm mb-8">Sign in to manage your corporate assets</p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Work Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              placeholder="employee@tessacloud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 py-3 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 border-none transition-all">
            {loading ? "Authenticating..." : "Sign In to Workspace"}
          </Button>
        </form>
      </div>
    </main>
  );
}
