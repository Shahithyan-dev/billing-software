"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { MenuItem } from '@/app/(dashboard)/pos/page';
import { 
  Package, 
  Plus, 
  Search, 
  Tag, 
  Barcode, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Camera
} from 'lucide-react';

export default function ItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/inventory/${restaurantId}`);
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (e) {
      console.error('Failed to fetch items', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const saveItems = async (updatedItems: MenuItem[]) => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;
    await fetch(`${API_BASE_URL}/api/v1/inventory/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems }),
    });
    setItems(updatedItems);
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState('');
  const [variants, setVariants] = useState<{size: string, stock: number}[]>([]);
  
  const addVariant = () => setVariants([...variants, { size: '', stock: 0 }]);
  const updateVariant = (index: number, field: 'size'|'stock', value: any) => {
    const newV = [...variants];
    newV[index] = { ...newV[index], [field]: value };
    setVariants(newV);
  };
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const [category, setCategory] = useState('Sarees');
  const [barcode, setBarcode] = useState('');
  const [img, setImg] = useState('');

  // Extract categories dynamically
  const categoriesList = Array.from(new Set(['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', ...items.map(i => i.category)]));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Name and Price are required.");
      return;
    }

    const itemData: MenuItem = {
      id: editingId || crypto.randomUUID(),
      name,
      price: parseFloat(price) || 0,
      purchasePrice: parseFloat(purchasePrice) || 0,
      size: variants.length > 0 ? variants.map(v => v.size).filter(Boolean).join(', ') : size,
      stock: variants.length > 0 ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) : (parseInt(stock) || 0),
      variants,
      category,
      type: (barcode || 'standard') as any,
      img: img || 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=200'
    };

    try {
      const updatedItems = editingId
        ? items.map(i => i.id === editingId ? itemData : i)
        : [...items, itemData];
      await saveItems(updatedItems);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save item:", err);
      alert("Failed to save item to server.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setPurchasePrice(item.purchasePrice ? item.purchasePrice.toString() : '');
    setSize(item.size || '');
    setStock(item.stock ? item.stock.toString() : '');
    if (item.variants && item.variants.length > 0) {
      setVariants(item.variants);
    } else if (item.size || item.stock) {
      setVariants([{ size: item.size || '', stock: item.stock || 0 }]);
    } else {
      setVariants([]);
    }
    setCategory(item.category);
    setBarcode(item.type === 'standard' ? '' : item.type);
    setImg(item.img || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item from inventory?")) {
      const updatedItems = items.filter(i => i.id !== id);
      await saveItems(updatedItems);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setPurchasePrice('');
    setSize('');
    setStock('');
    setVariants([]);
    setCategory('Sarees');
    setBarcode('');
    setImg('');
  };

  // Calculate Inventory Values
  const totalCost = items.reduce((sum, item) => sum + ((item.purchasePrice || 0) * (item.stock || 0)), 0);
  const totalRetail = items.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
  const totalPotentialProfit = totalRetail - totalCost;
  const potentialMargin = totalRetail > 0 ? (totalPotentialProfit / totalRetail) * 100 : 0;
  const totalStockItems = items.reduce((sum, item) => sum + (item.stock || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Apparel Inventory</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage your dress catalog, pricing, and barcodes</p>
          <div className="flex items-center gap-3 w-full md:w-auto mt-3">

            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Stock Units</span>
          <h3 className="text-2xl font-black text-slate-800">{totalStockItems} items</h3>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Cost Value</span>
          <h3 className="text-2xl font-black text-slate-800">₹ {totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1">Estimated Retail Value</span>
          <h3 className="text-2xl font-black text-amber-600">₹ {totalRetail.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Est. Profit ({potentialMargin.toFixed(1)}%)</span>
          <h3 className="text-2xl font-black text-emerald-600">₹ {totalPotentialProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <Package className="w-5 h-5 text-amber-500" />
          <span>{items.length} total items in store</span>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, categories, codes..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Items List Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No items found</h3>
          <p className="text-slate-400 text-sm mt-1">Load default items or add manual items to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setViewingItem(item)}
              className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 relative group flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center relative">
                <img
                  src={item.img || 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=200'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-bold text-slate-600 border border-slate-100 uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              {/* Detail Info */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-extrabold text-slate-800 text-base line-clamp-1 mb-1">{item.name}</h3>
                
                {item.type && item.type !== 'standard' && (
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] mb-1">
                    <Barcode className="w-3.5 h-3.5" />
                    <span>CODE: {item.type}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mb-3">
                  {item.size && <span>Size: <strong className="text-slate-700">{item.size}</strong></span>}
                  {item.purchasePrice ? <span>Purchase: <strong className="text-slate-700">₹{item.purchasePrice.toFixed(2)}</strong></span> : null}
                </div>

                <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sale Price</span>
                    <span className="font-black text-amber-600 text-base">₹ {item.price.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                      className="text-slate-400 hover:text-white hover:bg-amber-500 p-2 rounded-xl border border-transparent hover:border-amber-100 transition-all"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-slate-300 hover:text-white hover:bg-red-500 p-2 rounded-xl border border-transparent hover:border-red-100 transition-all"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">{editingId ? 'Edit Product Item' : 'Add Product Item'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Silk Saree, Kurtis, Jeans..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Sale Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Barcode / Code</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="SS-001"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Purchase Rate</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="1000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Sizes & Quantities</label>
                  <button type="button" onClick={addVariant} className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-amber-100 transition-colors">
                    <Plus className="w-3 h-3"/> Add Size
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {variants.map((v, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input 
                        type="text" 
                        placeholder="Size (e.g. XL)" 
                        value={v.size} 
                        onChange={e => updateVariant(index, 'size', e.target.value)} 
                        className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Qty" 
                        value={v.stock === 0 ? '' : v.stock} 
                        onChange={e => updateVariant(index, 'stock', parseInt(e.target.value) || 0)} 
                        className="w-24 px-3 py-1.5 text-sm font-mono bg-white border border-slate-200 rounded focus:border-amber-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => removeVariant(index)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded hover:border-red-200 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl">No sizes added. Click "Add Size" to track variants.</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-700 text-sm cursor-pointer"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => setImg(e.target.value)}
                    placeholder="https://example.com/item.jpg"
                    className="flex-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-850 text-sm font-mono"
                  />
                  <label className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 px-4 rounded-xl cursor-pointer transition-colors border border-slate-200" title="Take Photo">
                    <Camera className="w-5 h-5" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                           const url = URL.createObjectURL(e.target.files[0]);
                           setImg(url);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/10 transition-colors text-sm"
                >
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Details Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setViewingItem(null)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 mb-6">
                <img 
                  src={viewingItem.img || 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=200'} 
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {viewingItem.category}
              </span>
              <h2 className="text-2xl font-black text-slate-800 mb-2">{viewingItem.name}</h2>
              <div className="flex gap-2 text-slate-500 text-sm font-medium mb-8">
                {viewingItem.type && viewingItem.type !== 'standard' && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><Barcode className="w-3 h-3"/> {viewingItem.type}</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Stock</span>
                  {viewingItem.variants && viewingItem.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {viewingItem.variants.map((v, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="font-bold text-slate-700">{v.size || 'Base'}:</span>
                          <span className="font-mono font-black text-amber-600">{v.stock} pcs</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-black text-slate-800">{viewingItem.stock || 0} <span className="text-xs text-slate-500 font-medium ml-1">pcs</span></span>
                      {viewingItem.size && (
                        <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase">Sizes: {viewingItem.size}</span>
                      )}
                      <span className="text-[9px] text-amber-500 font-bold mt-1 max-w-[200px] text-center">Click Edit (Pencil) to add detailed sizes & quantities</span>
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sale Price</span>
                  <span className="text-xl font-black text-amber-600">₹{viewingItem.price.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchase Price</span>
                  <span className="text-xl font-black text-slate-600">₹{viewingItem.purchasePrice ? viewingItem.purchasePrice.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
