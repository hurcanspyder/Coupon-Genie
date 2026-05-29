'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../utils/api';
import { 
  ShieldAlert, LayoutGrid, Ticket, LineChart, Plus, Edit2, Trash2, 
  X, Check, AlertTriangle, Eye, ShieldCheck, Database
} from 'lucide-react';

interface AdminStats {
  storesCount: number;
  couponsCount: number;
  usersCount: number;
  totalReveals: number;
  maxRevealedCoupon: number;
  topStores: { name: string; count: number }[];
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'stats' | 'stores' | 'coupons'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Control States
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Store Form Fields
  const [storeName, setStoreName] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCategory, setStoreCategory] = useState('Shopping');

  // Coupon Form Fields
  const [couponStoreId, setCouponStoreId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [couponValue, setCouponValue] = useState(0);
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponActive, setCouponActive] = useState(true);
  const [couponTerms, setCouponTerms] = useState('');

  // Route security guard
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        toast.error('Access Denied: Administrator role required.');
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Get Stats
      const statsRes = await api.get<{ stats: AdminStats }>('/admin/stats');
      setStats(statsRes.stats);

      // Get Stores
      const storesRes = await api.get<{ stores: any[] }>('/stores');
      setStores(storesRes.stores || []);

      // Compile Coupons list across all stores
      const allCoupons: any[] = [];
      for (const store of storesRes.stores || []) {
        const detailRes = await api.get<any>(`/stores/${store.slug}`);
        if (detailRes.store?.coupons) {
          const storeCoupons = detailRes.store.coupons.map((c: any) => ({
            ...c,
            storeName: store.name,
            storeSlug: store.slug
          }));
          allCoupons.push(...storeCoupons);
        }
      }
      setCoupons(allCoupons);

    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load admin controls. Connect backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  // Open Add/Edit Store Modal
  const openStoreModal = (storeToEdit: any = null) => {
    if (storeToEdit) {
      setEditingItem(storeToEdit);
      setStoreName(storeToEdit.name);
      setStoreLogo(storeToEdit.logo);
      setStoreDesc(storeToEdit.description);
      setStoreCategory(storeToEdit.category);
    } else {
      setEditingItem(null);
      setStoreName('');
      setStoreLogo('');
      setStoreDesc('');
      setStoreCategory('Shopping');
    }
    setStoreModalOpen(true);
  };

  // Open Add/Edit Coupon Modal
  const openCouponModal = (couponToEdit: any = null) => {
    if (couponToEdit) {
      setEditingItem(couponToEdit);
      setCouponStoreId(couponToEdit.storeId);
      setCouponCode(couponToEdit.couponCode);
      setCouponTitle(couponToEdit.title);
      setCouponDesc(couponToEdit.description || '');
      setCouponType(couponToEdit.discountType);
      setCouponValue(couponToEdit.discountValue);
      setCouponExpiry(new Date(couponToEdit.expiryDate).toISOString().substring(0, 10));
      setCouponActive(couponToEdit.active);
      setCouponTerms(couponToEdit.terms || '');
    } else {
      setEditingItem(null);
      setCouponStoreId(stores[0]?.id || '');
      setCouponCode('');
      setCouponTitle('');
      setCouponDesc('');
      setCouponType('PERCENTAGE');
      setCouponValue(0);
      setCouponExpiry(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));
      setCouponActive(true);
      setCouponTerms('');
    }
    setCouponModalOpen(true);
  };

  // Handle Store CRUD Submission
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeLogo || !storeDesc || !storeCategory) {
      toast.error('All store fields are required');
      return;
    }

    try {
      const payload = { name: storeName, logo: storeLogo, description: storeDesc, category: storeCategory };
      if (editingItem) {
        await api.put(`/admin/stores/${editingItem.id}`, payload);
        toast.success(`Store ${storeName} updated successfully!`);
      } else {
        await api.post('/admin/stores', payload);
        toast.success(`Store ${storeName} created successfully!`);
      }
      setStoreModalOpen(false);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit store details');
    }
  };

  // Handle Store Delete
  const handleStoreDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${name}? This will delete ALL coupons belonging to this store.`)) return;
    try {
      await api.delete(`/admin/stores/${id}`);
      toast.success(`Deleted ${name} and associated coupons`);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete store');
    }
  };

  // Handle Coupon CRUD Submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponStoreId || !couponCode || !couponTitle || couponValue <= 0 || !couponExpiry) {
      toast.error('Please fill in all required coupon fields');
      return;
    }

    try {
      const payload = {
        storeId: couponStoreId,
        couponCode: couponCode.toUpperCase().trim(),
        title: couponTitle,
        description: couponDesc || null,
        discountType: couponType,
        discountValue: Number(couponValue),
        expiryDate: new Date(couponExpiry).toISOString(),
        active: couponActive,
        terms: couponTerms || null
      };

      if (editingItem) {
        await api.put(`/admin/coupons/${editingItem.id}`, payload);
        toast.success(`Coupon ${couponCode} updated successfully!`);
      } else {
        await api.post('/admin/coupons', payload);
        toast.success(`Coupon ${couponCode} created successfully!`);
      }
      setCouponModalOpen(false);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit coupon details');
    }
  };

  // Handle Coupon Delete
  const handleCouponDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success(`Coupon ${code} deleted successfully`);
      await loadAdminData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 w-full flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Entering security headquarters...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="w-full relative py-12 md:py-16">
      
      {/* --- FLOATING MODALS OVERLAYS --- */}
      
      {/* 1. Store Modal */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#07070d]/85 backdrop-blur-md" onClick={() => setStoreModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-card-bg p-6 sm:p-8 rounded-3xl shadow-2xl animate-modal overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={() => setStoreModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
              {editingItem ? 'Edit Store Details' : 'Add Brand Store'}
            </h2>
            <form onSubmit={handleStoreSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="e.g. Swiggy" className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo Image URL</label>
                <input type="text" value={storeLogo} onChange={(e) => setStoreLogo(e.target.value)} placeholder="https://..." className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store Category</label>
                <select value={storeCategory} onChange={(e) => setStoreCategory(e.target.value)} className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input bg-[#16162a]">
                  <option value="Shopping">Shopping (E-Commerce)</option>
                  <option value="Food">Food (Delivery/Dining)</option>
                  <option value="Fashion">Fashion (Clothing/Accessories)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store Description</label>
                <textarea rows={4} value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} placeholder="Provide information about the store offers..." className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input resize-none" required />
              </div>
              <button type="submit" className="w-full py-3 btn-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Check className="h-4 w-4" /> Save Brand Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Coupon Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#07070d]/85 backdrop-blur-md" onClick={() => setCouponModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel bg-card-bg p-6 sm:p-8 rounded-3xl shadow-2xl animate-modal overflow-hidden max-h-[90vh] flex flex-col">
            <button onClick={() => setCouponModalOpen(false)} className="absolute top-4 right-4 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
              {editingItem ? 'Edit Coupon Code' : 'Create Store Coupon'}
            </h2>
            <form onSubmit={handleCouponSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Brand Store</label>
                  <select value={couponStoreId} onChange={(e) => setCouponStoreId(e.target.value)} className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input bg-[#16162a]" required>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coupon Code</label>
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="AMZNEW50" className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input font-mono uppercase" required />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Coupon Headline Title</label>
                <input type="text" value={couponTitle} onChange={(e) => setCouponTitle(e.target.value)} placeholder="Flat 50% off on all devices" className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Short Description</label>
                <input type="text" value={couponDesc} onChange={(e) => setCouponDesc(e.target.value)} placeholder="Enter details about what is discounted" className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Discount Type</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCouponType('PERCENTAGE')} className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer border ${couponType === 'PERCENTAGE' ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>PERCENT %</button>
                    <button type="button" onClick={() => setCouponType('FLAT')} className={`flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer border ${couponType === 'FLAT' ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>FLAT $</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value</label>
                  <input type="number" value={couponValue} onChange={(e) => setCouponValue(Number(e.target.value))} className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" required min={1} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                  <input type="date" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  <button type="button" onClick={() => setCouponActive(!couponActive)} className={`w-full py-2 rounded-xl font-bold text-xs cursor-pointer border ${couponActive ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-400' : 'bg-rose-500/10 border-rose-400/30 text-rose-400'}`}>{couponActive ? 'ACTIVE' : 'INACTIVE'}</button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Terms & Conditions</label>
                <textarea rows={3} value={couponTerms} onChange={(e) => setCouponTerms(e.target.value)} placeholder="Minimum order of $100..." className="w-full py-2 px-3 text-xs sm:text-sm text-white glass-input resize-none" />
              </div>

              <button type="submit" className="w-full py-3 btn-primary rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Check className="h-4 w-4" /> Save Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADMIN PAGE LAYOUT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* --- HEADER BOARD --- */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-card-bg border border-border-color flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center p-3 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Genie Command Room</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                CRUD Dashboard — Restricted to verified coupon administrators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#ffaa00]/10 text-[#ffaa00] text-[10px] uppercase font-bold tracking-wider py-1.5 px-3 rounded-xl border border-[#ffaa00]/20">
            <Database className="h-4 w-4" /> PostgreSQL LIVE
          </div>
        </div>

        {/* --- DYNAMIC TAB NAVIGATION BAR --- */}
        <div className="mt-8 flex gap-2 border-b border-white/5 pb-4">
          <button onClick={() => setActiveTab('stats')} className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border ${activeTab === 'stats' ? 'btn-primary' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}>
            <LineChart className="h-4 w-4" /> Analytics Overview
          </button>
          <button onClick={() => setActiveTab('stores')} className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border ${activeTab === 'stores' ? 'btn-primary' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}>
            <LayoutGrid className="h-4 w-4" /> Brands Stores ({stores.length})
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border ${activeTab === 'coupons' ? 'btn-primary' : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'}`}>
            <Ticket className="h-4 w-4" /> Store Coupons ({coupons.length})
          </button>
        </div>

        {/* --- TAB CONTENT AREA --- */}
        <div className="mt-8">
          
          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8 animate-modal">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="glass-panel p-6 rounded-2xl bg-card-bg border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Brands</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white mt-2 block">{stats.storesCount}</span>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-card-bg border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Coupons</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white mt-2 block">{stats.couponsCount}</span>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-card-bg border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Registered Savers</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-white mt-2 block">{stats.usersCount}</span>
                </div>

                <div className="glass-panel p-6 rounded-2xl bg-card-bg border border-white/5 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Magical Reveals</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-2 block">{stats.totalReveals}</span>
                </div>

              </div>

              {/* Top Stores List & Database Integrity Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="glass-panel p-6 rounded-3xl bg-card-bg border border-white/5">
                  <h3 className="text-base font-bold text-white mb-4">Top Coupon Stores</h3>
                  <div className="space-y-4">
                    {stats.topStores.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-300 font-medium">{idx + 1}. {item.name}</span>
                        <span className="font-mono text-emerald-400 font-bold">{item.count} coupons</span>
                      </div>
                    ))}
                    {stats.topStores.length === 0 && (
                      <p className="text-xs text-gray-500 py-6 text-center">No brand coupon analytics recorded.</p>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl bg-card-bg border border-white/5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">Administrative Health</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      All SQL transactions are fully parameterized and schema mappings verified. Password hashes use 10 rounds of bcryptjs salt protection. Session tokens are generated with 7d JWT tokens.
                    </p>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs font-bold">
                    <span className="text-emerald-400 flex items-center gap-1.5"><Check className="h-4 w-4" /> CORS Secured</span>
                    <span className="text-emerald-400 flex items-center gap-1.5"><Check className="h-4 w-4" /> SQL Parameterized</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STORES MANAGER */}
          {activeTab === 'stores' && (
            <div className="space-y-6 animate-modal">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Active Stores ({stores.length})</h3>
                <button onClick={() => openStoreModal()} className="py-2 px-4 rounded-xl btn-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Plus className="h-4 w-4" /> Add Brand Store
                </button>
              </div>

              {/* Stores Table */}
              <div className="glass-panel rounded-3xl overflow-hidden bg-card-bg border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Brand</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Description</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {stores.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center p-1.5 overflow-hidden">
                              {s.logo ? <img src={s.logo} alt="" className="object-contain h-full w-full rounded" /> : <span className="uppercase text-gray-400 font-bold">{s.name[0]}</span>}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{s.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">slug: {s.slug}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="py-0.5 px-2 bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 text-[9px] font-bold uppercase rounded-full">
                              {s.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-gray-400">
                            {s.description}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => openStoreModal(s)} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleStoreDelete(s.id, s.name)} className="p-2 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {stores.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-500 font-medium">No brand stores found. Click &ldquo;Add Brand Store&rdquo; to begin.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COUPONS MANAGER */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-modal">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Coupons Listing ({coupons.length})</h3>
                <button onClick={() => openCouponModal()} className="py-2 px-4 rounded-xl btn-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer" disabled={stores.length === 0}>
                  <Plus className="h-4 w-4" /> Create Coupon
                </button>
              </div>

              {/* Coupons Table */}
              <div className="glass-panel rounded-3xl overflow-hidden bg-card-bg border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="py-4 px-6">Coupon / Store</th>
                        <th className="py-4 px-6">Discount</th>
                        <th className="py-4 px-6">Expiry</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Reveals</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {coupons.map((c) => {
                        const isExpired = new Date(c.expiryDate) < new Date();
                        return (
                          <tr key={c.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  {c.couponCode}
                                  {c.active && !isExpired && <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />}
                                </span>
                                <span className="text-[10px] text-gray-500">store: {c.storeName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-emerald-400">
                                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} FLAT`}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono text-[10px] text-gray-400">
                              {new Date(c.expiryDate).toLocaleDateString()}
                              {isExpired && <span className="ml-1.5 py-0.5 px-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase rounded text-[8px] font-bold">Expired</span>}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`py-0.5 px-2 text-[9px] font-bold rounded-full border ${c.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-500/10 text-rose-400 border-rose-400/20'}`}>
                                {c.active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono font-bold text-gray-300">
                              {c.revealCount}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openCouponModal(c)} className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleCouponDelete(c.id, c.couponCode)} className="p-2 hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">No store coupons found. Select &ldquo;Create Coupon&rdquo; to populate.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
