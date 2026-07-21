"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Download } from 'lucide-react';

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
      { id: '1', name: 'Idli Sambar', price: 60, category: 'Breakfast', type: 'veg' },
      { id: '2', name: 'Masala Dosa', price: 80, category: 'Breakfast', type: 'veg' },
      { id: '3', name: 'Veg Thali', price: 220, category: 'Lunch', type: 'veg' },
      { id: '4', name: 'Chicken Biryani', price: 320, category: 'Lunch', type: 'non-veg' },
      { id: '5', name: 'Paneer Butter Masala', price: 280, category: 'Dinner', type: 'veg' },
      { id: '6', name: 'Garlic Naan', price: 60, category: 'Dinner', type: 'veg' },
      { id: '7', name: 'Veg Manchurian', price: 180, category: 'Snacks', type: 'veg' },
      { id: '8', name: 'Cold Coffee', price: 120, category: 'Beverages', type: 'veg' },
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
          type: parts[3]?.toLowerCase() === 'non-veg' ? 'non-veg' : 'veg'
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
    
    // Format captains and tables
    const captainsStr = formData.get('captains') as string;
    const tablesStr = formData.get('tables') as string;
    const captainsArray = captainsStr ? captainsStr.split(',').map(s => s.trim()).filter(s => s) : ['Captain'];
    const tablesArray = tablesStr ? tablesStr.split(',').map(s => s.trim()).filter(s => s) : ['T1', 'T2', 'T3'];

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
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      <nav className="bg-gray-900 text-white p-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-black">ServeWell Admin</h1>
          <span className="text-xs text-red-500 font-bold uppercase tracking-widest">Super Access</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-8 grid lg:grid-cols-[1.5fr_1fr] gap-8">
        
        {/* Create / Edit Restaurant Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingTenantId ? 'Edit Tenant' : 'Create New Tenant'}</h2>
            {editingTenantId && (
              <button 
                onClick={() => {
                  setEditingTenantId(null);
                  setInitialMenu([]);
                  (document.getElementById('tenant-form') as HTMLFormElement)?.reset();
                }}
                className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4 font-medium">{success}</div>}
          
          <form id="tenant-form" onSubmit={handleCreateRestaurant} className="space-y-6">
            
            {/* 1. Basic Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">1. Restaurant Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name *</label>
                  <input name="name" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone *</label>
                  <input name="phone" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GSTIN</label>
                  <input name="gstin" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">FSSAI</label>
                  <input name="fssai" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                  <input name="address" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                </div>
              </div>
            </div>

            {/* 2. Admin Credentials */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">2. Master Login {editingTenantId && "(Leave blank to keep unchanged)"}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email {!editingTenantId && "*"}</label>
                  <input name="email" type="email" required={!editingTenantId} disabled={!!editingTenantId} className="w-full px-3 py-2 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-gray-900 text-gray-900 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password {!editingTenantId && "*"}</label>
                  <input name="password" type="text" required={!editingTenantId} disabled={!!editingTenantId} className="w-full px-3 py-2 border rounded-lg bg-blue-50 focus:ring-2 focus:ring-gray-900 text-gray-900 disabled:opacity-50" />
                </div>
              </div>
            </div>

            {/* 3. POS Configuration */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">3. POS Setup</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Captains (Comma separated)</label>
                  <input name="captains" placeholder="Rahul, Suresh, Self Service" defaultValue="Captain, Rahul, Priya, Self Service" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tables (Comma separated)</label>
                  <input name="tables" placeholder="T1, T2, T3" defaultValue="T1, T2, T3, T4, T5, Parcel" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900 text-sm" />
                </div>
              </div>
              
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enable Sidebar Modules</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-3 border rounded-lg">
                {SIDEBAR_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 text-sm text-gray-700">
                    <input type="checkbox" name={`feature_${feature}`} defaultChecked className="rounded text-gray-900 focus:ring-gray-900" />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Interactive Menu Builder */}
            <div>
              <div className="flex justify-between items-end mb-3 border-b pb-2">
                <h3 className="text-sm font-bold text-gray-900">4. Interactive Menu Builder</h3>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsBulkPasting(!isBulkPasting)}
                    className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-bold transition-colors"
                  >
                    Bulk Paste Excel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleLoadDefaultMenu}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" /> Load Default Menu
                  </button>
                </div>
              </div>
              
              {isBulkPasting && (
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Paste your menu from Excel (Format: Name [tab] Price [tab] Category [tab] Type)</p>
                  <textarea 
                    value={bulkMenuText}
                    onChange={(e) => setBulkMenuText(e.target.value)}
                    className="w-full h-32 px-3 py-2 border rounded-lg text-sm"
                    placeholder="Idli Sambar	60	Breakfast	veg&#10;Chicken Biryani	320	Lunch	non-veg"
                  ></textarea>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setIsBulkPasting(false)} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={handleProcessBulkPaste} className="px-3 py-1 text-sm bg-green-600 text-white font-bold rounded hover:bg-green-700">Process</button>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 border rounded-lg p-4 mb-2 max-h-[300px] overflow-y-auto">
                {initialMenu.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm italic">
                    No items added yet. Click &quot;Add Item&quot; or &quot;Load Default Menu&quot;.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {initialMenu.map((item, index) => (
                      <div key={item.id} className="flex gap-2 items-center bg-white p-2 border rounded shadow-sm">
                        <div className="text-xs text-gray-400 font-mono w-4">{index + 1}.</div>
                        <input 
                          type="text" 
                          placeholder="Item Name" 
                          value={item.name} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-gray-900"
                        />
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={item.price} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'price', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-gray-900 text-right"
                        />
                        <select 
                          value={item.category} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'category', e.target.value)}
                          className="w-32 px-2 py-1 text-sm border rounded bg-white focus:ring-1 focus:ring-gray-900"
                        >
                          {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select 
                          value={item.type} 
                          onChange={(e) => handleUpdateMenuItem(item.id, 'type', e.target.value)}
                          className="w-24 px-2 py-1 text-sm border rounded bg-white focus:ring-1 focus:ring-gray-900"
                        >
                          <option value="veg">Veg</option>
                          <option value="non-veg">Non-Veg</option>
                        </select>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMenuItem(item.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
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
                className="text-sm font-bold text-[#4a7b47] hover:text-[#386236] flex items-center gap-1 p-2 hover:bg-[#4a7b47]/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item Manually
              </button>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
              {loading ? 'Saving...' : editingTenantId ? 'Save Tenant Updates' : 'Create & Provision Tenant'}
            </button>
          </form>
        </div>

        {/* Existing Tenants */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex justify-between items-center">
            Active Tenants 
            <span className="bg-gray-100 text-gray-600 text-xs py-1 px-2 rounded-full">{restaurants.length} total</span>
          </h2>
          
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
            {restaurants.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No restaurants provisioned yet.</p>
            ) : (
              restaurants.map(rest => (
                <div key={rest._id} className="p-4 border rounded-xl hover:border-gray-400 transition-colors relative group">
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEditTenant(rest)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-all"
                      title="Edit Tenant"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteRestaurant(rest._id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all"
                      title="Delete Tenant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-start mb-1 pr-8">
                    <h3 className="font-bold text-gray-900">{rest.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{rest.phone} • {rest.address}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rest.sidebarFeatures?.map((f: string) => (
                      <span key={f} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">{f}</span>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t text-[10px] text-gray-400 flex justify-between items-center">
                    <span>ID: {rest._id.substring(rest._id.length - 6)}</span>
                    <div className="flex gap-2">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{rest.captains?.length || 0} Captains</span>
                      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{rest.defaultMenu?.length || 0} Items</span>
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
