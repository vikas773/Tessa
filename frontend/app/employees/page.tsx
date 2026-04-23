"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  // New employee form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem('tessa_user');
    if (userRaw) {
      setCurrentUser(JSON.parse(userRaw));
    }
    fetchEmployees();
  }, []);

  const handleDeactivate = async (id: number) => {
    if (!currentUser || currentUser.role !== 'Admin') {
      return alert("Only administrators can deactivate accounts.");
    }
    
    try {
      const res = await fetch(`${API_URL}/api/users/${id}/deactivate`, {
        method: 'PUT'
      });
      if (res.ok) {
        setEmployees(employees.map(e => e.id === id ? { ...e, status: 'Inactive' } : e));
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to deactivate");
      }
    } catch (err) {
      console.error("Error deactivating user", err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', role: 'Employee' });
        fetchEmployees();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user", err);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 relative z-10">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Employee Management</h2>
            <p className="text-sm md:text-base text-slate-400">Add, manage, and audit employee access roles.</p>
          </div>
          {isAdmin && (
            <Button className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 border-none transition-all" onClick={() => setShowModal(true)}>
              + Add New Employee
            </Button>
          )}
        </header>

        <div className="bg-[#0f172a]/80 backdrop-blur-sm overflow-x-auto rounded-xl border border-slate-700/50 shadow-lg shadow-black/10">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-[#1e293b] border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-blue-400">Loading directory...</td>
                </tr>
              ) : employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-[#1e293b]/50 transition-colors bg-[#0f172a]/40">
                  <td className="px-6 py-4 font-medium text-slate-200">{employee.name}</td>
                  <td className="px-6 py-4 text-slate-400">{employee.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      employee.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">Edit</button>
                      <button 
                        onClick={() => handleDeactivate(employee.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={employee.status === 'Inactive'}
                      >
                        Deactivate
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/50">
            <h3 className="text-xl font-bold mb-4 text-white">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input required type="text" className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-slate-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input required type="email" className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-slate-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@tessacloud.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Temporary Password</label>
                <input required type="password" className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-slate-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                <select className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" className="flex-1 bg-transparent text-slate-400 border-none hover:bg-slate-800/50 transition-all" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-500/20">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
