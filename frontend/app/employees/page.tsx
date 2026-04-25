"use client";

import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/PageLayout';
import Button from '../../components/Button';
import { EmptyState } from '../../components/UIStates';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // New employee form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee'
  });

  // Edit employee form state (Slide-over)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const [usersRes, assignRes] = await Promise.all([
        fetch(`${API_URL}/api/users/`),
        fetch(`${API_URL}/api/assignments/`)
      ]);
      const usersData = await usersRes.json();
      const assignData = await assignRes.json();
      setEmployees(Array.isArray(usersData) ? usersData : []);
      setAssignments(Array.isArray(assignData) ? assignData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem('tessa_user');
    if (userRaw) {
      setCurrentUser(JSON.parse(userRaw));
    }
    fetchData();
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
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user", err);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Deactivate this personnel record? Access will be restricted immediately.")) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Inactive' })
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
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
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user", err);
    }
  };

  const getAssetCount = (userId: number) => {
    return assignments.filter(a => a.user_id === userId && !a.return_date).length;
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? emp.role === filterRole : true;
    const matchesStatus = filterStatus ? emp.status === filterStatus : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Personnel Directory</h2>
            <p className="text-[#6B7280] font-medium">&quot;Strategic management of organizational human capital and access controls.&quot;</p>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all border-none text-xs uppercase tracking-[2px] flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Provision Personnel
              </button>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 bg-[#1A2235] p-3 rounded-2xl border border-white/5 shadow-2xl mb-12">
          <div className="flex-1 relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Query personnel by name or email..." 
              className="w-full bg-[#0f1623] border border-white/5 rounded-xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-[#0f1623] border border-white/5 rounded-xl px-6 py-4 text-slate-300 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Administrators</option>
              <option value="Manager">Managers</option>
              <option value="Employee">Employees</option>
            </select>
            <select 
              className="bg-[#0f1623] border border-white/5 rounded-xl px-6 py-4 text-slate-300 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Personnel Registry...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="bg-[#1A2235] rounded-[32px] border border-white/5 shadow-2xl">
                 <EmptyState 
                    title="No Personnel Records" 
                    message="Try adjusting your filters or provision a new account." 
                    icon={<svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                 />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/2">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Identity / Profile</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Secure Email</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Privilege Level</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">Assets Assigned</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500">System Status</th>
                    {isAdmin && <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[2px] text-slate-500 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-black border border-blue-500/20 text-sm">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{employee.name}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">ID: {employee.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-400 font-medium text-[13px]">{employee.email}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                          employee.role === 'Admin' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                          employee.role === 'Manager' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                          'text-slate-400 bg-slate-400/10 border-slate-400/20'
                        }`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className={`text-sm font-bold ${getAssetCount(employee.id) > 0 ? 'text-white' : 'text-slate-600'}`}>{getAssetCount(employee.id)}</span>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Units</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${employee.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>{employee.status}</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(employee)} className="p-2 text-slate-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                              <button onClick={() => handleDeactivate(employee.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg></button>
                           </div>
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

      {/* Provision Employee Modal (Standard) */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-3xl w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Provision Identity</h3>
            </div>
            <form onSubmit={handleAddEmployee} className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Legal Full Name</label>
                <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Foster" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Corporate Email</label>
                <input required type="email" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@tessa.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Security Credential</label>
                <input required type="password" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all text-sm font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Access Privilege</label>
                <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-xl px-5 py-4 outline-none focus:border-blue-500 transition-all text-sm font-black uppercase tracking-widest" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Employee">Standard Employee</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" className="flex-1 bg-transparent text-red-500 hover:bg-red-500/5 border border-red-500/30 font-black py-4 rounded-xl transition-all text-xs uppercase tracking-widest" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-600/20 border-none text-xs uppercase tracking-widest">Provision Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Edit Panel */}
      <div className={`fixed inset-0 z-[200] flex justify-end transition-opacity duration-300 ${editingUser ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
         <div className="absolute inset-0 bg-[#0F1117]/60 backdrop-blur-sm" onClick={() => setEditingUser(null)}></div>
         <div className={`relative w-full max-w-lg bg-[#1A2235] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 transform transition-transform duration-500 ease-out p-12 ${editingUser ? 'translate-x-0' : 'translate-x-full'}`}>
            {editingUser && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center font-black border border-blue-500/20 text-xl">
                      {editingUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Modify Identity</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Personnel UID: {editingUser.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="p-3 text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateEmployee} className="flex-1 flex flex-col gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Legal Full Name</label>
                    <input required type="text" className="w-full bg-[#0f1623] text-white border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 transition-all font-bold" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Corporate Email Address</label>
                    <input required type="email" className="w-full bg-[#0f1623] text-white border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 transition-all font-bold" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Access Level</label>
                      <select className="w-full bg-[#0f1623] text-white border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-[11px]" value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})}>
                        <option value="Employee">Employee</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-3">Record Status</label>
                      <select className="w-full bg-[#0f1623] text-white border border-white/5 rounded-2xl px-6 py-5 outline-none focus:border-blue-500 transition-all font-black uppercase tracking-widest text-[11px]" value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-auto pt-12 border-t border-white/5 flex flex-col gap-4">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all border-none text-xs uppercase tracking-widest">Commit Operational Changes</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        if(confirm("Permanently purge this personnel record? This cannot be reversed.")) {
                          // call handleDelete
                        }
                      }}
                      className="w-full py-5 text-red-500 hover:text-white hover:bg-red-500/10 rounded-2xl transition-all font-black border border-red-500/20 hover:border-red-500 text-xs uppercase tracking-widest"
                    >
                      Purge Personnel Record
                    </button>
                  </div>
                </form>
              </div>
            )}
         </div>
      </div>
    </PageLayout>
  );
}
