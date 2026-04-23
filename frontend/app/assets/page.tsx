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

  const isAdmin = currentUser?.role === 'Admin';

  const triggerAssignModal = (assetId: number) => {
    if (!isAdmin) return alert("Only an administrator can assign assets.");
    setSelectedAssetId(assetId);
    setShowAssignModal(true);
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

  const exportCSV = () => {
    const token = localStorage.getItem('tessa_token');
    window.location.href = `${API_URL}/api/assets/export/csv?Authorization=Bearer ${token}`;
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 relative z-10">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Corporate Assets</h2>
            <p className="text-base md:text-lg text-slate-400 font-medium">Browse and manage the full inventory of organizational hardware.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={exportCSV} className="bg-[#0f172a] border-slate-700/50 text-slate-300 font-bold py-3 px-6 rounded-xl shadow-sm hover:border-slate-600 hover:text-white transition-all">
              Export CSV
            </Button>
            {isAdmin && (
              <Button onClick={() => setShowRegisterModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 border-none">
                + Register New Asset
              </Button>
            )}
          </div>
        </header>

        {/* Search and Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#0f172a]/80 backdrop-blur-sm p-2 rounded-2xl border border-slate-700/50 shadow-sm">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text"
              placeholder="Search assets by name or serial..."
              className="w-full bg-[#1e293b] border-none rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-[#1e293b] border-none rounded-xl px-6 py-3 text-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all shadow-inner"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Laptop">Laptops</option>
              <option value="Furniture">Furniture</option>
              <option value="Peripherals">Peripherals</option>
            </select>
            <select 
              className="bg-[#1e293b] border-none rounded-xl px-6 py-3 text-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all shadow-inner"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Broken">Broken</option>
              <option value="Under Maintenance">In Repair</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onAssign={triggerAssignModal} />
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/50">
            <h3 className="text-xl font-bold mb-4 text-white">Assign Asset</h3>
            <p className="text-slate-400 text-sm mb-4">Select an active employee to allocate this hardware to.</p>
            <form onSubmit={submitAssign} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Employee</label>
                <select required className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
                  <option value="" disabled>-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" className="flex-1 bg-transparent text-slate-400 border-none hover:bg-slate-800/50 transition-all" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-500/20">Confirm Assign</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/50">
            <h3 className="text-xl font-bold mb-4 text-white">Register New Asset</h3>
            <form onSubmit={handleRegisterAsset} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Asset Name / Model</label>
                <input required type="text" className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} placeholder="e.g. MacBook Pro M3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Serial Number</label>
                <input required type="text" className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500" value={assetForm.serial_number} onChange={e => setAssetForm({...assetForm, serial_number: e.target.value})} placeholder="SN-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50" value={assetForm.type} onChange={e => setAssetForm({...assetForm, type: e.target.value})}>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="secondary" className="flex-1 bg-transparent text-slate-400 border-none hover:bg-slate-800/50 transition-all" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-500/20">Register Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
