"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Camera, FileText, Search, User, FileImage, Calendar, FileCheck, CheckCircle2, XCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchRx = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/prescriptions?restaurantId=${rid}`);
        const data = await res.json();
        if (data.success) {
          setPrescriptions(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRx();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prescription Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Upload, verify, and manage digital prescriptions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all text-sm">
            <Camera className="w-4 h-4" /> Scan
          </button>
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-500/30 transition-all text-sm">
            <Upload className="w-4 h-4" /> Upload Rx
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Uploads</span>
            <h3 className="text-2xl font-black text-slate-800">1,284</h3>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block mb-1">Pending Verification</span>
            <h3 className="text-2xl font-black text-teal-700">12</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-500 shadow-sm border border-teal-100">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Linked Invoices</span>
            <h3 className="text-2xl font-black text-amber-700">945</h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
            <FileImage className="w-6 h-6" />
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
              placeholder="Search by Patient, Doctor or Rx ID..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 focus:border-teal-500 rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-sm font-bold text-slate-600 px-4 py-2.5 rounded-xl focus:outline-none">
              <option>All Status</option>
              <option>Verified</option>
              <option>Pending</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                <img src={rx.image} alt="Prescription" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-black text-slate-800 text-lg">{rx.customer}</h4>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    rx.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                    rx.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rx.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> ID: {rx.id}</span>
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {rx.doctor}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {rx.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-lg text-sm transition-all shadow-sm">
                  View File
                </button>
                {rx.status === 'Pending' && (
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm">
                    Verify & Bill
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
