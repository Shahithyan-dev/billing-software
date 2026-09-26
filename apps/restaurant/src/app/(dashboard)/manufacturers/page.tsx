"use client";

import React, { useState } from 'react';
import { Search, Plus, Filter, Factory, Building2, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function ManufacturersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const manufacturers = [
    { id: 'MFR-001', name: 'Sun Pharmaceutical Industries Ltd', type: 'Domestic', location: 'Mumbai, MH', email: 'orders@sunpharma.com', phone: '+91 22 4324 4324', products: 124, status: 'Active' },
    { id: 'MFR-002', name: 'Cipla Limited', type: 'Domestic', location: 'Mumbai, MH', email: 'sales@cipla.com', phone: '+91 22 2482 6000', products: 89, status: 'Active' },
    { id: 'MFR-003', name: 'Dr. Reddy\'s Laboratories', type: 'Domestic', location: 'Hyderabad, TS', email: 'contact@drreddys.com', phone: '+91 40 4900 2900', products: 56, status: 'Active' },
    { id: 'MFR-004', name: 'Pfizer Ltd', type: 'Multinational', location: 'New York, USA', email: 'india.sales@pfizer.com', phone: '+1 212 733 2323', products: 42, status: 'Active' },
    { id: 'MFR-005', name: 'Mankind Pharma', type: 'Domestic', location: 'New Delhi, DL', email: 'info@mankindpharma.com', phone: '+91 11 4684 6700', products: 73, status: 'Active' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manufacturers</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage pharmaceutical manufacturers and production partners</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <Plus className="w-4 h-4" /> Add Manufacturer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Manufacturers</span>
            <h3 className="text-2xl font-black text-slate-800">45</h3>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Domestic Partners</span>
            <h3 className="text-2xl font-black text-slate-800">38</h3>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <MapPin className="w-6 h-6" />
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
              placeholder="Search manufacturers..."
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
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Manufacturer Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Details</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Products</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {manufacturers.map((mfr) => (
              <tr key={mfr.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                      <Factory className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{mfr.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{mfr.type}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400"/> {mfr.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400"/> {mfr.phone}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-slate-600">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {mfr.location}</span>
                </td>
                <td className="p-4 text-right font-black text-slate-800">{mfr.products}</td>
                <td className="p-4 pr-6 text-right">
                   <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] uppercase tracking-wider transition-all inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3"/> View
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
