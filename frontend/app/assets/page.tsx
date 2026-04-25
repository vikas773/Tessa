"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';
import AssetCard from '../../components/AssetCard';
import Button from '../../components/Button';
import { CardSkeleton, EmptyState } from '../../components/UIStates';

interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number: string | null;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');
  const [sortBy, setSortBy] = useState('Newest');
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<User[]>([]);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [assetForm, setAssetForm] = useState({ name: '', type: 'Laptop', serial_number: '' });
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editAssetForm, setEditAssetForm] = useState({ name: '', type: '', serial_number: '', status: '' });

  const fetchAssets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const res = await fetch(`${API_URL}/api/assets/?${params.toString()}`);
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, filterStatus]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/`);
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data.filter(u => u.status === 'Active') : []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem('tessa_user');
    if (userRaw) setCurrentUser(JSON.parse(userRaw));
    fetchAssets();
    fetchEmployees();
  }, [fetchAssets]);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  const toggleSelect = (id: number) => {
    setSelectedAssets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedAssets(selectedAssets.length === assets.length ? [] : assets.map(a => a.id));
  };

  const triggerAssignModal = (assetId: number) => {
    if (!isAdmin) return alert("Only an administrator can assign assets.");
    setSelectedAssetId(assetId);
    setShowAssignModal(true);
  };

  const triggerEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setEditAssetForm({
      name: asset.name,
      type: asset.type,
      serial_number: asset.serial_number || '',
      status: asset.status
    });
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    try {
      const res = await fetch(`${API_URL}/api/assets/${editingAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAssetForm)
      });
      if (res.ok) {
        setEditingAsset(null);
        fetchAssets();
      }
    } catch (err) { console.error(err); }
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedAssets.length === 0) return;
    alert(`Bulk updating ${selectedAssets.length} assets to ${status}...`);
    // Implementation would call backend in loop or dedicated bulk endpoint
    setSelectedAssets([]);
    fetchAssets();
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/assets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetForm)
      });
      if (res.ok) {
        setShowRegisterModal(false);
        setAssetForm({ name: '', type: 'Laptop', serial_number: '' });
        fetchAssets();
      }
    } catch (err) { console.error(err); }
  };

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId) return;
    const token = localStorage.getItem('tessa_token');
    try {
      const res = await fetch(`${API_URL}/api/assignments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ user_id: parseInt(selectedEmployeeId), asset_id: selectedAssetId })
      });
      if (res.ok) {
        setShowAssignModal(false);
        fetchAssets();
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteAsset = async () => {
    if (!editingAsset || !confirm(`Decommission ${editingAsset.name}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/assets/${editingAsset.id}`, { method: 'DELETE' });
      if (res.ok) {
        setEditingAsset(null);
        fetchAssets();
      }
    } catch (err) { console.error(err); }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'Name') return a.name.localeCompare(b.name);
    if (sortBy === 'Status') return a.status.localeCompare(b.status);
    if (sortBy === 'Category') return a.type.localeCompare(b.type);
    return b.id - a.id; // Newest
  });

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase mb-2">Hardware Inventory</h2>
            <p className="text-[#6B7280] font-medium">&quot;Comprehensive control and real-time tracking of enterprise assets.&quot;</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center bg-[#1A2235] p-1 rounded-xl border border-white/5">
               <button onClick={() => setViewMode('Grid')} className={`p-3 rounded-lg transition-all ${viewMode === 'Grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
               </button>
               <button onClick={() => setViewMode('List')} className={`p-3 rounded-lg transition-all ${viewMode === 'List' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
               </button>
            </div>
            {isAdmin && (
              <button onClick={() => setShowRegisterModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all border-none text-xs uppercase tracking-[2px] flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Register Unit
              </button>
            )}
          </div>
        </header>

        {/* Advanced Filters & Bulk Actions */}
        <div className="space-y-4 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 bg-[#1A2235] p-3 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex-1 relative">
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Query nodes by name or serial..." className="w-full bg-[#0f1623] border border-white/5 rounded-xl pl-14 pr-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <select className="bg-[#0f1623] border border-white/5 rounded-xl px-6 py-4 text-slate-300 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Categories</option>
                {['Laptop', 'Desktop', 'Peripherals', 'Mobile'].map(t => <option key={t} value={t}>{t}s</option>)}
              </select>
              <select className="bg-[#0f1623] border border-white/5 rounded-xl px-6 py-4 text-slate-300 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Statuses</option>
                {['Available', 'Assigned', 'Under Maintenance', 'Broken'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="bg-[#0f1623] border border-white/5 rounded-xl px-6 py-4 text-slate-300 font-black text-xs uppercase tracking-widest focus:outline-none focus:border-blue-500/50 cursor-pointer transition-all" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Newest">Sort: Newest</option>
                <option value="Name">Sort: Name</option>
                <option value="Status">Sort: Status</option>
                <option value="Category">Sort: Category</option>
              </select>
            </div>
          </div>

          {selectedAssets.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{selectedAssets.length} Units Selected</span>
                  <div className="w-px h-4 bg-blue-500/20"></div>
                  <button onClick={() => handleBulkUpdate('Available')} className="text-[10px] font-black text-white bg-blue-600 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-blue-500 transition-all">Mark Available</button>
                  <button onClick={() => handleBulkUpdate('Under Maintenance')} className="text-[10px] font-black text-white bg-orange-600 px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-orange-500 transition-all">Under Repair</button>
               </div>
               <button onClick={() => setSelectedAssets([])} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">Clear Selection</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-[#1A2235] rounded-[40px] border border-white/5 shadow-2xl">
             <EmptyState 
                title="Zero Records Located" 
                message="Sync your parameters or register a new hardware node to begin tracking." 
                icon={<svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586-3.586a2 2 0 112.828 2.828L16 16m-2 2l1.586 1.586a2 2 0 01-2.828 2.828L12 20m-2-2l-1.586 1.586a2 2 0 002.828 2.828L10 16m-2-2l3.586-3.586a2 2 0 012.828-2.828L12 14"></path></svg>}
             />
             {isAdmin && (
               <div className="flex justify-center pb-20">
                 <button onClick={() => setShowRegisterModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[2px] transition-all border-none">Initialize First Node</button>
               </div>
             )}
          </div>
        ) : viewMode === 'Grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAssets.map((asset) => (
              <div key={asset.id} className="relative group">
                 <div className="absolute top-4 left-4 z-10">
                    <input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="w-5 h-5 rounded-lg border-white/10 bg-[#0f1623] text-blue-600 focus:ring-blue-500/40 cursor-pointer" />
                 </div>
                 <AssetCard 
                   asset={asset} 
                   onAssign={triggerAssignModal} 
                   onEdit={isAdmin ? triggerEditModal : undefined} 
                 />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1A2235] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-[#1f2937]/30 border-b border-white/5">
                      <th className="px-8 py-5">
                         <input type="checkbox" checked={selectedAssets.length === assets.length} onChange={toggleSelectAll} className="w-5 h-5 rounded-lg border-white/10 bg-[#0f1623] text-blue-600" />
                      </th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Asset Designation</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Serial ID</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Node Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Assigned To</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {sortedAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                         <td className="px-8 py-5">
                            <input type="checkbox" checked={selectedAssets.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="w-5 h-5 rounded-lg border-white/10 bg-[#0f1623] text-blue-600" />
                         </td>
                         <td className="px-6 py-5">
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{asset.name}</p>
                         </td>
                         <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.type}</span>
                         </td>
                         <td className="px-6 py-5">
                            <code className="text-[11px] font-mono text-slate-500 bg-[#0f1623] px-2 py-1 rounded border border-white/5">{asset.serial_number || 'UNASSIGNED'}</code>
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${asset.status === 'Available' ? 'bg-emerald-500' : asset.status === 'Assigned' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                               <span className="text-[10px] font-black text-white uppercase tracking-widest">{asset.status}</span>
                            </div>
                         </td>
                         <td className="px-6 py-5">
                            <p className="text-xs font-medium text-slate-400 italic">None</p>
                         </td>
                         <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => triggerEditModal(asset)} className="p-2 text-slate-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                               <button onClick={() => triggerAssignModal(asset.id)} className="p-2 text-slate-500 hover:text-blue-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Assign Asset</h3>
              </div>
              <form onSubmit={submitAssign} className="flex flex-col gap-6">
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Authorized Recipient</label>
                  <select required className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
                    <option value="" disabled>-- Select Employee Profile --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="flex-1 bg-transparent text-red-500 hover:bg-red-500/5 border border-red-500/30 font-black py-4 rounded-xl transition-all text-xs uppercase tracking-widest" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg shadow-[#6366F1]/20 border-none text-sm">Assign Personnel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Register Asset Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-md p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Register Hardware</h3>
              </div>
              <form onSubmit={handleRegisterAsset} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Model Designation</label>
                  <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} placeholder="e.g. ThinkPad X1 Carbon" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Factory Serial Number</label>
                  <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={assetForm.serial_number} onChange={e => setAssetForm({...assetForm, serial_number: e.target.value})} placeholder="SN-822910XX" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Asset Classification</label>
                  <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={assetForm.type} onChange={e => setAssetForm({...assetForm, type: e.target.value})}>
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Peripherals">Peripherals</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Mobile">Mobile Device</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" className="flex-1 bg-transparent text-red-500 hover:bg-red-500/5 border border-red-500/30 font-black py-4 rounded-xl transition-all text-xs uppercase tracking-widest" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                  <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg shadow-[#6366F1]/20 border-none text-sm">Register Device</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Asset Modal */}
        {editingAsset && (
          <div className="fixed inset-0 bg-[#0F1117]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1A1D27] border border-[#2A2D3E] rounded-xl w-full max-w-lg p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Edit Asset Record</h3>
              </div>
              <form onSubmit={handleUpdateAsset} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Model Designation</label>
                  <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={editAssetForm.name} onChange={e => setEditAssetForm({...editAssetForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Factory Serial Number</label>
                  <input required type="text" className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={editAssetForm.serial_number} onChange={e => setEditAssetForm({...editAssetForm, serial_number: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Classification</label>
                    <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm" value={editAssetForm.type} onChange={e => setEditAssetForm({...editAssetForm, type: e.target.value})}>
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Peripherals">Peripherals</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Mobile">Mobile Device</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Operational Status</label>
                    <select className="w-full bg-[#0F1117] text-white border border-[#2A2D3E] rounded-lg px-4 py-3 outline-none focus:border-[#6366F1] transition-all text-sm font-bold" value={editAssetForm.status} onChange={e => setEditAssetForm({...editAssetForm, status: e.target.value})}>
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Broken">Broken</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 mt-8 border-t border-[#2A2D3E] pt-8">
                  <div className="flex gap-4">
                    <button type="button" className="flex-1 bg-transparent text-red-500 hover:bg-red-500/5 border border-red-500/30 font-black py-4 rounded-xl transition-all text-xs uppercase tracking-widest" onClick={() => setEditingAsset(null)}>Cancel</button>
                    <button type="submit" className="flex-1 bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-3 rounded-lg shadow-lg border-none text-sm">Commit Changes</button>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleDeleteAsset}
                    className="w-full py-4 text-[#EF4444] hover:text-white hover:bg-[#EF4444]/10 rounded-lg transition-all font-bold border border-[#EF4444]/20 hover:border-[#EF4444] text-[13px] uppercase tracking-widest"
                  >
                    Decommission Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
