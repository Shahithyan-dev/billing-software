"use client";

import React, { useState } from 'react';
import { db, Party, Purchase, PurchaseItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  X, 
  CreditCard, 
  Banknote,
  PlusCircle,
  FileText
} from 'lucide-react';

export default function PurchasesPage() {
  const purchases = useLiveQuery(() => db.purchases.orderBy('timestamp').reverse().toArray()) || [];
  const suppliers = useLiveQuery(() => db.parties.filter(p => p.type === 'supplier').toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [supplierName, setSupplierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  // Transaction Items state
  const [itemsList, setItemsList] = useState<PurchaseItem[]>([
    { name: '', qty: 1, rate: 0, total: 0 }
  ]);

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleAddItemRow = () => {
    setItemsList([...itemsList, { name: '', qty: 1, rate: 0, total: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  const handleUpdateItemRow = (idx: number, field: keyof PurchaseItem, value: any) => {
    const updated = itemsList.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const qty = field === 'qty' ? parseInt(value) || 0 : item.qty;
          const rate = field === 'rate' ? parseFloat(value) || 0 : item.rate;
          newItem.total = qty * rate;
        }
        return newItem;
      }
      return item;
    });
    setItemsList(updated);
  };

  const subtotal = itemsList.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) {
      alert("Please select or enter a supplier.");
      return;
    }
    if (itemsList.some(i => !i.name || i.qty <= 0 || i.rate <= 0)) {
      alert("Please ensure all item names, quantities, and rates are filled correctly.");
      return;
    }

    const selectedSupplierDetails = suppliers.find(s => s.name === supplierName);
    
    if (!selectedSupplierDetails) {
      try {
        await db.parties.add({
          type: 'supplier',
          name: supplierName,
          phone: '',
        });
      } catch(e) {
        console.error("Failed to auto-create supplier", e);
      }
    }

    const newPurchase: Purchase = {
      supplierName,
      phone: selectedSupplierDetails?.phone || '',
      items: itemsList,
      subtotal,
      tax,
      total,
      paymentMethod,
      timestamp: Date.now()
    };

    try {
      await db.purchases.add(newPurchase);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to record purchase invoice:", err);
    }
  };

  const handleDeletePurchase = async (id: number) => {
    if (confirm("Are you sure you want to delete this purchase invoice log?")) {
      await db.purchases.delete(id);
    }
  };

  const resetForm = () => {
    setSupplierName('');
    setPaymentMethod('CASH');
    setItemsList([{ name: '', qty: 1, rate: 0, total: 0 }]);
  };

  const totalPurchaseVolume = purchases.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Purchases</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Log and review stock procurement purchase invoices from suppliers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-right">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Total Purchase Volume</span>
            <h3 className="text-2xl font-black text-amber-600">₹ {totalPurchaseVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Record Purchase
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          <span>{purchases.length} total supplier invoices</span>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, item..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Purchases List Grid */}
      {filteredPurchases.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No purchase records found</h3>
          <p className="text-slate-400 text-sm mt-1">Add a new supplier purchase invoice to track stock costs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 relative group flex flex-col"
            >
              <button
                onClick={() => purchase.id && handleDeletePurchase(purchase.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex gap-3 items-center mb-4">
                <div className="w-9 h-9 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base line-clamp-1">{purchase.supplierName}</h3>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
                    <Calendar className="w-3 h-3" /> {new Date(purchase.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Items List inside card */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 flex-1 mb-4">
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                  <span>Item</span>
                  <div className="flex gap-6">
                    <span>Qty</span>
                    <span>Cost</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {purchase.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-600 font-semibold">
                      <span className="line-clamp-1">{item.name}</span>
                      <div className="flex gap-8 shrink-0">
                        <span className="text-slate-400 font-mono w-4 text-center">{item.qty}</span>
                        <span className="font-mono">₹{item.total.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Spent</span>
                  <span className="font-black text-slate-800 text-sm">₹ {purchase.total.toFixed(2)}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md border border-amber-100">
                  {purchase.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-2xl p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-black text-slate-800">Record Supplier Purchase</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Supplier *</label>
                  <input
                    type="text"
                    list="suppliers-list"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    required
                    placeholder="Enter or select supplier"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-700 text-sm"
                  />
                  <datalist id="suppliers-list">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-700 text-sm cursor-pointer"
                  >
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              {/* Items Entry List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Purchase Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center bg-slate-50 p-2.5 border border-slate-100 rounded-xl">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleUpdateItemRow(idx, 'name', e.target.value)}
                        placeholder="Item Name (e.g. Silk Saree)"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateItemRow(idx, 'qty', parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center font-mono"
                      />
                      <input
                        type="number"
                        required
                        value={item.rate === 0 ? '' : item.rate}
                        onChange={(e) => handleUpdateItemRow(idx, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Cost"
                        className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right font-mono"
                      />
                      <div className="w-24 text-right font-black text-xs text-slate-700 font-mono pr-2">
                        ₹ {item.total.toFixed(0)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={itemsList.length === 1}
                        className="text-slate-300 hover:text-amber-500 p-1 rounded-md transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations footer inside form */}
              <div className="border-t border-slate-100 pt-4 flex flex-col items-end space-y-1.5 text-xs text-slate-500 font-bold px-4 shrink-0">
                <div className="flex justify-between w-64">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-800">₹ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 pb-2 border-b border-slate-100">
                  <span>GST (5%)</span>
                  <span className="font-mono text-slate-800">₹ {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-base font-black text-slate-800 pt-1">
                  <span>Grand Total</span>
                  <span className="font-mono text-amber-600">₹ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-colors text-sm"
                >
                  Record Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
