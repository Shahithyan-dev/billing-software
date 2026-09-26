"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PackageOpen, TrendingDown, AlertTriangle, Plus, Search, X, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  status: string;
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    quantity: 0,
    unit: 'pcs',
    minThreshold: 10
  });

  const fetchInventory = useCallback(async () => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/inventory/${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, restaurantId })
      });
      const data = await res.json();
      if (data.success) {
        // Trigger pre-save status by re-fetching
        fetchInventory();
        setIsModalOpen(false);
        setFormData({ name: '', sku: '', category: 'General', quantity: 0, unit: 'pcs', minThreshold: 10 });
      } else {
        alert("Error saving item: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/inventory/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setInventory(inventory.filter(i => i._id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (i.sku && i.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [inventory, searchTerm]);

  // KPIs
  const totalSkus = inventory.length;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.quantity <= i.minThreshold).length;
  // Estimate depletion value randomly for visual purposes if no actual cost is recorded, or zero.
  const estDepletion = "$0"; 

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <PackageOpen className="w-8 h-8 text-indigo-500" />
            Inventory & Supply Chain
          </h1>
          <p className="text-muted-foreground mt-1">Real-time stock tracking and low-inventory alerts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <PackageOpen className="w-6 h-6 text-indigo-500" />
            <h3 className="text-muted-foreground font-medium">Total SKUs Active</h3>
          </div>
          <p className="text-3xl font-bold">{totalSkus}</p>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -z-10" />
          <div className="flex items-center gap-4 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-muted-foreground font-medium">Low Stock Alerts</h3>
          </div>
          <p className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>{lowStockCount}</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <TrendingDown className="w-6 h-6 text-orange-500" />
            <h3 className="text-muted-foreground font-medium">Est. Depletion (24h)</h3>
          </div>
          <p className="text-3xl font-bold">{estDepletion}</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search SKUs or Ingredient Names..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-sm sticky top-0">
              <tr>
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">In Stock</th>
                <th className="p-4 font-medium text-right">Min. Threshold</th>
                <th className="p-4 font-medium text-right">Status</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                  const isLowStock = item.status === 'Low Stock' || item.quantity <= item.minThreshold;
                  return (
                    <tr key={item._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4 text-muted-foreground font-mono text-xs">{item.sku || '-'}</td>
                      <td className="p-4 text-muted-foreground">{item.category}</td>
                      <td className="p-4 text-right font-bold">
                        {item.quantity} <span className="text-muted-foreground font-normal text-xs">{item.unit}</span>
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {item.minThreshold} {item.unit}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          isLowStock 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                            : 'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}>
                          {isLowStock ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                          <button onClick={() => handleDelete(item._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </td>
                    </tr>
                  )
              })}
              {filteredInventory.length === 0 && !loading && (
                  <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">No items in inventory.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Add Inventory Item</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Tomatoes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="ING-001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Produce"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Min Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
