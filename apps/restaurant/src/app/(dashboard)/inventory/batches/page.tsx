"use client";

import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertCircle, ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function BatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/menu/${rid}`);
        const data = await res.json();
        if (data.success) {
          const allBatches: any[] = [];
          data.data.forEach((item: any) => {
            if (item.variants && Array.isArray(item.variants)) {
              item.variants.forEach((v: any) => {
                if (v.batchNo) {
                  let status = 'Healthy';
                  if (v.stock < 10) status = 'Low Stock';
                  allBatches.push({
                    id: v.batchNo,
                    medicine: item.name,
                    stock: v.stock,
                    expiry: v.expiryDate || 'N/A',
                    status: status,
                    price: v.mrp || item.price
                  });
                }
              });
            }
          });
          setBatches(allBatches);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Batch Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Track medicine batches, stock levels, and pricing</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <Archive className="w-4 h-4" /> Add Batch
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Batch No. or Medicine..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-slate-800 rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800 shadow-sm"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch No</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">MRP</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-mono font-bold text-slate-800">{b.id}</td>
                <td className="p-4 font-bold text-slate-700">{b.medicine}</td>
                <td className="p-4 font-bold text-slate-600">{b.expiry}</td>
                <td className="p-4 text-right font-black text-slate-800">₹{b.price.toFixed(2)}</td>
                <td className="p-4 text-right font-black text-slate-800">{b.stock}</td>
                <td className="p-4 pr-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    b.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' :
                    b.status === 'Near Expiry' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status === 'Healthy' ? <ArrowUpRight className="w-3 h-3" /> : 
                     b.status === 'Near Expiry' ? <AlertCircle className="w-3 h-3" /> : 
                     <ArrowDownRight className="w-3 h-3" />}
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
