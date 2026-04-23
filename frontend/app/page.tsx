"use client";

import React, { useEffect, useState } from 'react';
import AdminDashboard from '../components/AdminDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import PageLayout from '../components/PageLayout';

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tessa_token');
    const userRaw = localStorage.getItem('tessa_user');

    if (!token || !userRaw) {
      window.location.href = '/login';
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      setRole(user.role);
    } catch (e) {
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <PageLayout>
      {(role === 'Admin' || role === 'Manager') ? <AdminDashboard /> : <EmployeeDashboard />}
    </PageLayout>
  );
}
