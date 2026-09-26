"use client";

import React, { useState, useEffect } from 'react';
import { CornerUpLeft, Search, Plus, Filter, FileText, ArrowRight } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function PurchaseReturnsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/purchase-returns?restaurantId=${rid}`);
        const data = await res.json();
        if (data.success) {
          setReturns(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReturns();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Purchase Returns</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage expired and damaged goods returned to suppliers</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <CornerUpLeft className="w-4 h-4" /> New Return
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
              placeholder="Search Return ID or Supplier..."
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
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Return ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {returns.map((ret) => (
              <tr key={ret.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="p-4 pl-6 font-mono font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  {ret.id}
                </td>
                <td className="p-4 font-bold text-slate-600">{ret.date}</td>
                <td className="p-4 font-bold text-slate-700">{ret.supplier}</td>
                <td className="p-4 font-bold text-slate-500">{ret.reason}</td>
                <td className="p-4 text-right font-black text-slate-800">₹{ret.total.toLocaleString()}</td>
                <td className="p-4 pr-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      ret.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ret.status}
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
