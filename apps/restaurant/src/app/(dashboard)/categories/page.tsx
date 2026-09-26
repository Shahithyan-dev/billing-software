"use client";

import React, { useState } from 'react';
import { Search, Plus, Filter, FolderTree, Pill, Syringe, Activity, Droplets } from 'lucide-react';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'CAT-001', name: 'Tablets & Capsules', count: 1245, icon: Pill, color: 'text-blue-500', bg: 'bg-blue-100' },
    { id: 'CAT-002', name: 'Syrups & Suspensions', count: 432, icon: Droplets, color: 'text-amber-500', bg: 'bg-amber-100' },
    { id: 'CAT-003', name: 'Injections & Vials', count: 189, icon: Syringe, color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { id: 'CAT-004', name: 'First Aid & Surgical', count: 320, icon: Activity, color: 'text-red-500', bg: 'bg-red-100' },
    { id: 'CAT-005', name: 'OTC & General', count: 856, icon: FolderTree, color: 'text-purple-500', bg: 'bg-purple-100' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Medicine Categories</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Organize your inventory by formulation and product type</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <Plus className="w-4 h-4" /> Add Category
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
              placeholder="Search categories..."
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
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Items Count</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
                      <cat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{cat.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{cat.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-black text-slate-800 text-xl">{cat.count.toLocaleString()}</td>
                <td className="p-4 pr-6 text-right">
                   <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] uppercase tracking-wider transition-all">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
