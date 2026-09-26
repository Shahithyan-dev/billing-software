"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Filter, FileText, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function PurchasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/purchases?restaurantId=${rid}`);
        const data = await res.json();
        if (data.success) {
          setPurchases(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Purchase Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage purchase orders, supplier invoices, and GRN</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <Plus className="w-4 h-4" /> New Purchase Order
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Purchases (This Month)</span>
            <h3 className="text-2xl font-black text-slate-800">₹1,46,450</h3>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Pending Deliveries</span>
            <h3 className="text-2xl font-black text-amber-700">1</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Completed</span>
            <h3 className="text-2xl font-black text-emerald-700">2</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO Number or Supplier..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-slate-800 rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800 shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">PO Number</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Items</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((po) => (
              <tr key={po.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="p-4 pl-6 font-mono font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  {po.id}
                </td>
                <td className="p-4 font-bold text-slate-600">{po.date}</td>
                <td className="p-4 font-bold text-slate-700">{po.supplier}</td>
                <td className="p-4 text-right font-bold text-slate-600">{po.items}</td>
                <td className="p-4 text-right font-black text-slate-800">₹{po.total.toLocaleString()}</td>
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      po.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {po.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
