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

  // Edit employee form state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const res = await fetch(`${API_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchEmployees();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!editingUser) return;
    if (!confirm(`Are you sure you want to delete ${editingUser.name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${editingUser.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEditingUser(null);
        fetchEmployees();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user", err);
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
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20 shadow-lg shadow-[#6366F1]/5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Personnel Directory</h2>
          </div>
          <p className="text-base md:text-lg text-[#6B7280] font-medium italic">&quot;Manage organizational access, roles, and security protocols.&quot;</p>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-4 px-8 rounded-[8px] shadow-xl shadow-[#6366F1]/20 transition-all active:scale-95 flex items-center gap-3 border-none text-[14px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Provision New Employee
              </button>
            )}
          </div>
        </header>

        <div className="bg-[#1A1D27] rounded-xl border border-[#2A2D3E] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[#2A2D3E] bg-[#13151F]">
            <h3 className="text-lg font-bold text-white">Security Records Archive</h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1A1D27]">
                <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Accessing Personnel Registry...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#13151F]">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Identity</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Secure Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">Privilege Level</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E]">System Status</th>
                    {isAdmin && <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[1.5px] text-[#6B7280] border-b border-[#2A2D3E] text-right">Audit</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2D3E]">
                  {employees.map((employee, index) => (
                    <tr key={employee.id} className={`${index % 2 === 0 ? 'bg-[#1A1D27]' : 'bg-[#1E2130]'} hover:bg-[#252840] transition-colors group`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center font-black border border-[#6366F1]/20 text-[12px]">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-[14px] font-bold text-white group-hover:text-[#6366F1] transition-colors leading-tight">{employee.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-400 font-medium text-[13px]">{employee.email}</td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 rounded bg-[#0F1117] text-slate-400 text-[10px] font-black uppercase tracking-widest border border-[#2A2D3E]">
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          employee.status === 'Active' 
                            ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' 
                            : 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => handleEdit(employee)}
                            className="text-[#6366F1] hover:text-[#818CF8] text-[12px] font-black uppercase tracking-widest transition-all"
                          >
                            Modify
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Provision Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Provision Identity</h3>
            </div>
            <form onSubmit={handleAddEmployee} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Legal Full Name</label>
                <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Foster" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Corporate Email</label>
                <input required type="email" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@tessa.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Security Credential</label>
                <input required type="password" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Access Privilege</label>
                <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Employee">Standard Employee</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg border-none text-sm">Provision Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Modify Identity</h3>
            </div>
            <form onSubmit={handleUpdateEmployee} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Legal Full Name</label>
                <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Corporate Email</label>
                <input required type="email" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Privilege</label>
                  <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm font-bold" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})}>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Status</label>
                  <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm font-bold" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 mt-8 border-t border-[#2A2D3E] pt-8">
                <div className="flex gap-4">
                  <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg border-none text-sm">Commit Changes</button>
                </div>
                <button 
                  type="button" 
                  onClick={handleDeleteEmployee}
                  className="w-full py-4 text-[#EF4444] hover:text-white hover:bg-[#EF4444]/10 rounded-lg transition-all font-bold border border-[#EF4444]/20 hover:border-[#EF4444] text-[13px] uppercase tracking-widest"
                >
                  Revoke Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
