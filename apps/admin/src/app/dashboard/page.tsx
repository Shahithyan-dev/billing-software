"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Download, Edit2, Server, Key, LayoutGrid, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [initialMenu, setInitialMenu] = useState<{id: string, name: string, price: number, category: string, type: string}[]>([]);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [bulkMenuText, setBulkMenuText] = useState('');
  const [isBulkPasting, setIsBulkPasting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

  const SIDEBAR_FEATURES = ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'];
  const MENU_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Initial fetch
    fetchRestaurants();
    
    // Verify session every 30 seconds
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          alert('You have been logged out because your account was accessed from another device.');
          handleLogout();
        }
      } catch (e) {
        // Ignore network errors, only act on 401
      }
    };
    
    verifySession(); // Check immediately on load
    const interval = setInterval(verifySession, 30000);
    
    return () => clearInterval(interval);
  }, [router]);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/restaurants`);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to completely delete this restaurant? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/restaurants/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Restaurant deleted successfully.');
        fetchRestaurants();
      } else {
        setError(result.error || 'Failed to delete restaurant');
      }
    } catch (err) {
      setError('Network error while deleting.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = () => {
    setInitialMenu([...initialMenu, { id: Date.now().toString(), name: '', price: 0, category: 'Main Course', type: 'veg' }]);
  };

  const handleRemoveMenuItem = (id: string) => {
    setInitialMenu(initialMenu.filter(item => item.id !== id));
  };

  const handleUpdateMenuItem = (id: string, field: string, value: string | number) => {
    setInitialMenu(initialMenu.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleLoadDefaultMenu = () => {
    setInitialMenu([
      { id: '1', name: 'Idli Sambar', price: 60, category: 'Breakfast', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Idli+Sambar' },
      { id: '2', name: 'Masala Dosa', price: 80, category: 'Breakfast', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Masala+Dosa' },
      { id: '3', name: 'Veg Thali', price: 220, category: 'Lunch', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Veg+Thali' },
      { id: '4', name: 'Chicken Biryani', price: 320, category: 'Lunch', type: 'non-veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Chicken+Biryani' },
      { id: '5', name: 'Paneer Butter Masala', price: 280, category: 'Dinner', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Paneer+Butter+Masala' },
      { id: '6', name: 'Garlic Naan', price: 60, category: 'Dinner', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Garlic+Naan' },
      { id: '7', name: 'Veg Manchurian', price: 180, category: 'Snacks', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Veg+Manchurian' },
      { id: '8', name: 'Cold Coffee', price: 120, category: 'Beverages', type: 'veg', img: 'https://placehold.co/400x300/e2e8f0/64748b?text=Cold+Coffee' },
    ]);
  };

  const handleProcessBulkPaste = () => {
    if (!bulkMenuText.trim()) return;
    const lines = bulkMenuText.split('\n');
    const newItems = lines.map((line, idx) => {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length >= 2) {
        return {
          id: Date.now().toString() + idx,
          name: parts[0],
          price: parseInt(parts[1]) || 0,
          category: parts[2] || 'Lunch',
          type: parts[3]?.toLowerCase() === 'non-veg' ? 'non-veg' : 'veg',
          img: parts[4] || ''
        };
      }
      return null;
    }).filter(Boolean) as any[];
    
    setInitialMenu([...initialMenu, ...newItems]);
    setBulkMenuText('');
    setIsBulkPasting(false);
  };

  const handleEditTenant = (rest: any) => {
    setEditingTenantId(rest._id);
    setInitialMenu(rest.defaultMenu || []);
    // Populate form fields
    setTimeout(() => {
      const form = document.getElementById('tenant-form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('name') as HTMLInputElement).value = rest.name || '';
        (form.elements.namedItem('phone') as HTMLInputElement).value = rest.phone || '';
        (form.elements.namedItem('gstin') as HTMLInputElement).value = rest.gstin || '';
        (form.elements.namedItem('fssai') as HTMLInputElement).value = rest.fssai || '';
        (form.elements.namedItem('address') as HTMLInputElement).value = rest.address || '';
        (form.elements.namedItem('captains') as HTMLInputElement).value = rest.captains?.join(', ') || '';
        (form.elements.namedItem('tables') as HTMLInputElement).value = rest.tables?.join(', ') || '';
        (form.elements.namedItem('diningAreas') as HTMLInputElement).value = rest.diningAreas?.join(', ') || '';
        (form.elements.namedItem('menuCategories') as HTMLInputElement).value = rest.menuCategories?.join(', ') || '';
        // Note: admin email/password cannot easily be populated securely, we can leave them blank or disabled for updates
      }
      
      // Update sidebar features
      rest.sidebarFeatures?.forEach((f: string) => {
        const checkbox = document.querySelector(`input[name="feature_${f}"]`) as HTMLInputElement;
        if (checkbox) checkbox.checked = true;
      });
    }, 100);
  };

  const handleCreateRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    
    // Extract checkbox values for sidebar features
    const selectedFeatures = SIDEBAR_FEATURES.filter(f => formData.get(`feature_${f}`) === 'on');
    
    const captainsStr = formData.get('captains') as string;
    const tablesStr = formData.get('tables') as string;
    const diningAreasStr = formData.get('diningAreas') as string;
    const menuCategoriesStr = formData.get('menuCategories') as string;
    
    const captainsArray = captainsStr ? captainsStr.split(',').map(s => s.trim()).filter(s => s) : ['Captain'];
    const tablesArray = tablesStr ? tablesStr.split(',').map(s => s.trim()).filter(s => s) : ['T1', 'T2', 'T3'];
    const diningAreasArray = diningAreasStr ? diningAreasStr.split(',').map(s => s.trim()).filter(s => s) : ['AC', 'Non-AC'];
    const menuCategoriesArray = menuCategoriesStr ? menuCategoriesStr.split(',').map(s => s.trim()).filter(s => s) : ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];

    const validMenuItems = initialMenu.filter(item => item.name.trim() !== '' && item.price >= 0);
    
    const payloadObj = {
      name: formData.get('name') as string,
      tagline: formData.get('tagline') as string,
      phone: formData.get('phone') as string,
      gstin: formData.get('gstin') as string,
      fssai: formData.get('fssai') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      captains: captainsArray,
      tables: tablesArray,
      diningAreas: diningAreasArray,
      menuCategories: menuCategoriesArray,
      sidebarFeatures: selectedFeatures,
      initialMenu: validMenuItems
    };

    const token = localStorage.getItem('adminToken');
    const isEditing = !!editingTenantId;
    const url = isEditing ? `${API_BASE_URL}/api/v1/restaurants/${editingTenantId}` : `${API_BASE_URL}/api/v1/auth/register`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadObj),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(isEditing ? 'Restaurant updated successfully!' : `Restaurant created successfully! Admin login: ${formData.get('email')}`);
        if (!isEditing) {
          (e.target as HTMLFormElement).reset();
          setInitialMenu([]);
        } else {
          setEditingTenantId(null);
          (e.target as HTMLFormElement).reset();
          setInitialMenu([]);
        }
        fetchRestaurants();
      } else {
        setError(result.error || 'Failed to create restaurant');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pb-20 font-sans selection:bg-indigo-500/30">
      {/* Glassmorphic Navbar */}
      <nav className="backdrop-blur-xl bg-white/70 border-b border-white shadow-sm p-4 px-8 flex justify-between items-center sticky top-0 z-50 transition-all">
        <div className="flex items-center">
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">ServeWell Admin</h1>
          <span className="ml-4 text-[10px] bg-red-50 text-red-600 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1.5 shadow-sm shadow-red-100">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            Super Access
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 grid lg:grid-cols-[1.5fr_1fr] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        
        {/* Create / Edit Restaurant Form */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white h-fit relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-[2rem] -z-10 opacity-50"></div>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                {editingTenantId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </span>
              {editingTenantId ? 'Edit Tenant' : 'Create New Tenant'}
            </h2>
            {editingTenantId && (
              <button 
                onClick={() => {
                  setEditingTenantId(null);
                  setInitialMenu([]);
                  (document.getElementById('tenant-form') as HTMLFormElement)?.reset();
                }}
                className="text-sm text-rose-500 hover:bg-rose-50 font-bold px-4 py-2 rounded-xl transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 shadow-sm animate-in fade-in"><CheckCircle2 className="w-4 h-4" /> {error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-sm mb-6 font-medium flex items-center gap-2 shadow-sm animate-in fade-in"><CheckCircle2 className="w-4 h-4" /> {success}</div>}
          
          <form id="tenant-form" onSubmit={handleCreateRestaurant} className="space-y-8 relative">
            
            {/* 1. Basic Details */}
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <Server className="w-4 h-4 text-indigo-500" /> 1. Restaurant Details
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Name *</label>
                  <input name="name" required className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm placeholder:text-slate-400" placeholder="ServeWell Cafe" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone *</label>
                  <input name="phone" required className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm placeholder:text-slate-400" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">GSTIN</label>
                  <input name="gstin" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">FSSAI</label>
                  <input name="fssai" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm placeholder:text-slate-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Address</label>
                  <input name="address" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm placeholder:text-slate-400" placeholder="123 Food Street, Food City" />
                </div>
              </div>
            </div>

            {/* 2. Admin Credentials */}
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <Key className="w-4 h-4 text-violet-500" /> 2. Master Login 
                {editingTenantId && <span className="text-slate-400 text-[10px] ml-2 normal-case tracking-normal bg-slate-200 px-2 py-0.5 rounded-md">(Leave blank to keep unchanged)</span>}
              </h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Email {!editingTenantId && "*"}</label>
                  <input name="email" type="email" required={!editingTenantId} disabled={!!editingTenantId} className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm disabled:opacity-50 disabled:bg-slate-100" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Password {!editingTenantId && "*"}</label>
                  <input name="password" type="text" required={!editingTenantId} disabled={!!editingTenantId} className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm disabled:opacity-50 disabled:bg-slate-100" />
                </div>
              </div>
            </div>

            {/* 3. POS Configuration */}
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <LayoutGrid className="w-4 h-4 text-fuchsia-500" /> 3. POS Setup
              </h3>
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Captains (Comma separated)</label>
                  <input name="captains" placeholder="Rahul, Suresh" defaultValue="Captain, Rahul, Priya, Self Service" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Tables (Comma separated)</label>
                  <input name="tables" placeholder="T1, T2, T3" defaultValue="T1, T2, T3, T4, T5, Parcel" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Dining Areas (Comma separated)</label>
                  <input name="diningAreas" placeholder="AC, Non-AC" defaultValue="AC, Non-AC" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Menu Categories (Comma separated)</label>
                  <input name="menuCategories" placeholder="Starters, Mains" defaultValue="Breakfast, Lunch, Dinner, Snacks, Beverages" className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/20 rounded-xl transition-all duration-200 text-slate-800 text-sm shadow-sm" />
                </div>
              </div>
              
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-3 ml-1">Enable Sidebar Modules</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                {SIDEBAR_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center space-x-3 text-sm font-medium text-slate-700 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" name={`feature_${feature}`} defaultChecked className="peer w-4 h-4 text-fuchsia-500 border-slate-300 rounded focus:ring-fuchsia-500 focus:ring-2 transition-all cursor-pointer" />
                    </div>
                    <span className="group-hover:text-fuchsia-600 transition-colors">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Interactive Menu Builder */}
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-4 h-4 text-emerald-500 flex items-center justify-center font-serif text-lg font-bold italic">M</div> 4. Menu Builder
                </h3>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsBulkPasting(!isBulkPasting)}
                    className="text-[11px] uppercase tracking-wider bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 font-bold transition-all shadow-sm"
                  >
                    Paste Excel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleLoadDefaultMenu}
                    className="text-[11px] uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Default Menu
                  </button>
                </div>
              </div>
              
              {isBulkPasting && (
                <div className="mb-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Paste from Excel (Format: Name [tab] Price [tab] Category [tab] Type [tab] Image URL)</p>
                  <textarea 
                    value={bulkMenuText}
                    onChange={(e) => setBulkMenuText(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 rounded-xl transition-all duration-200 text-sm font-mono"
                    placeholder="Idli Sambar	60	Breakfast	veg	https://example.com/idli.jpg&#10;Chicken Biryani	320	Lunch	non-veg	https://example.com/biryani.jpg"
                  ></textarea>
                  <div className="flex justify-end gap-2 mt-3">
                    <button type="button" onClick={() => setIsBulkPasting(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="button" onClick={handleProcessBulkPaste} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-colors">Process Data</button>
                  </div>
                </div>
              )}
              
              <div className="bg-white border border-slate-200 rounded-xl p-2 mb-3 max-h-[320px] overflow-y-auto shadow-inner">
                {initialMenu.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                      <Plus className="w-5 h-5 text-slate-300" />
                    </div>
                    No items added yet. Click &quot;Add Item&quot; or &quot;Load Default Menu&quot;.
                  </div>
                ) : (
                  <div className="space-y-1.5 p-1">
                    {initialMenu.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm rounded-lg transition-all group">
                        <div className="text-[10px] text-slate-400 font-bold font-mono w-5 text-center">{index + 1}</div>
                        <input 
                          type="text" 
                          placeholder="Item Name" 
                          value={item.name} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'name', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm bg-transparent border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-slate-800"
                        />
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={item.price} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'price', parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 text-sm bg-transparent border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono font-medium text-slate-800 text-right"
                        />
                        <select 
                          value={item.category} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'category', e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm bg-transparent border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-600"
                        >
                          {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                          value={item.type} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'type', e.target.value)}
                          className="w-20 px-2 py-1.5 text-sm bg-transparent border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-600"
                        >
                          <option value="veg">Veg</option>
                          <option value="non-veg">Non-Veg</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Image URL" 
                          value={item.img || ''} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'img', e.target.value)}
                          className="w-32 px-3 py-1.5 text-sm bg-transparent border border-slate-200 rounded-md focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono text-slate-500 placeholder:text-slate-300"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMenuItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                type="button" 
                onClick={handleAddMenuItem}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 py-2 px-3 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item Manually
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold text-base tracking-wide rounded-xl shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex justify-center items-center gap-2"
            >
              {loading ? 'Processing...' : editingTenantId ? 'Save Tenant Updates' : 'Create & Provision Tenant'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Existing Tenants */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white h-fit sticky top-[100px]">
          <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Active Tenants 
            </h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-inner">
              {restaurants.length} total
            </span>
          </div>
          
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {restaurants.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <Server className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No tenants provisioned yet.</p>
              </div>
            ) : (
              restaurants.map(rest => (
                <div key={rest._id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 transform hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent -z-10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => handleEditTenant(rest)}
                      className="text-indigo-500 hover:text-white hover:bg-indigo-500 p-2 rounded-lg transition-all shadow-sm"
                      title="Edit Tenant"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteRestaurant(rest._id)}
                      className="text-rose-400 hover:text-white hover:bg-rose-500 p-2 rounded-lg transition-all shadow-sm"
                      title="Delete Tenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-start mb-2 pr-16">
                    <h3 className="font-extrabold text-lg text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{rest.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{rest.phone}</span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 mb-4 line-clamp-1">{rest.address}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rest.sidebarFeatures?.map((f: string) => (
                      <span key={f} className="text-[9px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">{f}</span>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between items-center font-medium">
                    <span className="font-mono text-slate-300">ID: {rest._id.substring(rest._id.length - 6)}</span>
                    <div className="flex gap-2">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold">{rest.captains?.length || 0} Capt.</span>
                      <span className="bg-violet-50 text-violet-600 px-2 py-1 rounded-md font-bold">{rest.defaultMenu?.length || 0} Items</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
