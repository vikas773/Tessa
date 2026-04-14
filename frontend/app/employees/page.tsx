"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
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
    <main className="min-h-screen bg-slate-50 relative overflow-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Employee Management</h2>
            <p className="text-slate-500">Add, manage, and audit employee access roles.</p>
          </div>
          {isAdmin && (
            <Button className="shadow-md" onClick={() => setShowModal(true)}>
              + Add New Employee
            </Button>
          )}
        </header>

        <div className="glass overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-blue-600">Loading directory...</td>
                </tr>
              ) : employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  <td className="px-6 py-4 font-medium text-slate-900">{employee.name}</td>
                  <td className="px-6 py-4 text-slate-600">{employee.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      employee.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Edit</button>
                      <button 
                        onClick={() => handleDeactivate(employee.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@tessacloud.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                <input required type="password" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/50 outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" className="flex-1 bg-slate-100 text-slate-600 border-none hover:bg-slate-200" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
