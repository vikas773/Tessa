"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageLayout from '../../components/PageLayout';
import AssetCard from '../../components/AssetCard';
import Button from '../../components/Button';

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

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<User[]>([]);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [assetForm, setAssetForm] = useState({ name: '', type: 'Laptop', serial_number: '' });

  // Edit asset state
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editAssetForm, setEditAssetForm] = useState({
    name: '',
    type: '',
    serial_number: '',
    status: ''
  });

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
      if (!res.ok) throw new Error("Failed to update asset");
      setEditingAsset(null);
      fetchAssets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAsset = async () => {
    if (!editingAsset) return;
    if (!confirm(`Are you sure you want to delete ${editingAsset.name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_URL}/api/assets/${editingAsset.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      setEditingAsset(null);
      fetchAssets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId) return alert("Please select an employee.");

    const token = localStorage.getItem('tessa_token');
    try {
      const res = await fetch(`${API_URL}/api/assignments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: parseInt(selectedEmployeeId), asset_id: selectedAssetId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to assign asset");
      }

      setShowAssignModal(false);
      setSelectedEmployeeId('');
      setSelectedAssetId(null);
      fetchAssets();
      alert("Asset assigned successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/assets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetForm)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to register asset");
      }
      setShowRegisterModal(false);
      setAssetForm({ name: '', type: 'Laptop', serial_number: '' });
      fetchAssets();
    } catch (err: any) {
      alert(err.message);
    }
  };


  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Inventory Management</h2>
            <p className="text-base md:text-lg text-[#6B7280] font-medium italic">&quot;Centralized control and tracking of organizational hardware assets.&quot;</p>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowRegisterModal(true)} 
                className="bg-[#6366F1] hover:bg-[#818CF8] text-white font-bold py-4 px-8 rounded-[8px] shadow-xl shadow-[#6366F1]/20 transition-all active:scale-95 flex items-center gap-3 border-none text-[14px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Register New Asset
              </button>
            )}
          </div>
        </header>

        {/* Search and Advanced Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 bg-[#1A1D27] p-3 rounded-xl border border-[#2A2D3E] shadow-2xl">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text"
              placeholder="Query inventory by name or serial..."
              className="w-full bg-[#0F1117] border border-[#2A2D3E] rounded-lg pl-12 pr-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:border-[#6366F1] transition-all font-medium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-6 py-3 text-slate-300 font-bold text-sm focus:outline-none focus:border-[#6366F1] cursor-pointer transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Laptop">Laptops</option>
              <option value="Furniture">Furniture</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Desktop">Desktops</option>
              <option value="Mobile">Mobile Devices</option>
            </select>
            <select 
              className="bg-[#0F1117] border border-[#2A2D3E] rounded-lg px-6 py-3 text-slate-300 font-bold text-sm focus:outline-none focus:border-[#6366F1] cursor-pointer transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Broken">Broken</option>
              <option value="Under Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px]">Syncing secure inventory...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#1A1D27] rounded-xl border border-[#2A2D3E] text-center">
            <div className="w-20 h-20 bg-[#0F1117] rounded-full flex items-center justify-center mb-6 border border-[#2A2D3E]">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <p className="text-white font-bold text-xl mb-2">No Match Found</p>
            <p className="text-[#6B7280] text-sm">Adjust your filters or query to find the desired asset.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onAssign={triggerAssignModal} 
                onEdit={isAdmin ? triggerEditModal : undefined} 
              />
            ))}
          </div>
        )}
      </div>

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
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setShowAssignModal(false)}>Cancel</button>
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
                <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setShowRegisterModal(false)}>Cancel</button>
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
                  <button type="button" className="flex-1 bg-transparent text-[#6B7280] hover:text-white font-bold py-3 transition-all text-sm border-none" onClick={() => setEditingAsset(null)}>Cancel</button>
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
    </PageLayout>
  );
}
