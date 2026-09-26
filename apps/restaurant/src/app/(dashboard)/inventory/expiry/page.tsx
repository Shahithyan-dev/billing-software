"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CalendarX, ShieldAlert } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function ExpiryAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ expired: 0, under30: 0, under90: 0, under180: 0 });

  useEffect(() => {
    const fetchExpiry = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/menu/${rid}`);
        const data = await res.json();
        if (data.success) {
          const allAlerts: any[] = [];
          let exp = 0, u30 = 0, u90 = 0, u180 = 0;
          
          const now = new Date();
          
          data.data.forEach((item: any) => {
            if (item.variants && Array.isArray(item.variants)) {
              item.variants.forEach((v: any) => {
                if (v.batchNo && v.expiryDate) {
                  // Assuming MM/YY format or YYYY-MM-DD
                  let expiryDateStr = v.expiryDate;
                  let expDate;
                  if (expiryDateStr.includes('/')) {
                    const [month, year] = expiryDateStr.split('/');
                    expDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
                  } else {
                    expDate = new Date(expiryDateStr);
                  }
                  
                  const diffTime = expDate.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  let status = 'Healthy';
                  if (diffDays < 0) { status = 'Critical'; exp++; }
                  else if (diffDays <= 30) { status = 'Critical'; u30++; }
                  else if (diffDays <= 90) { status = 'Warning'; u90++; }
                  else if (diffDays <= 180) { status = 'Warning'; u180++; }
                  
                  if (diffDays <= 180) {
                    allAlerts.push({
                      batch: v.batchNo,
                      medicine: item.name,
                      expiry: v.expiryDate,
                      daysLeft: diffDays < 0 ? 0 : diffDays,
                      stock: v.stock,
                      status: status
                    });
                  }
                }
              });
            }
          });
          
          // Sort by days left
          allAlerts.sort((a, b) => a.daysLeft - b.daysLeft);
          
          setAlerts(allAlerts);
          setStats({ expired: exp, under30: u30, under90: u90, under180: u180 });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchExpiry();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Expiry Alerts</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor medicines approaching expiration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-red-600 rounded-2xl p-6 shadow-lg shadow-red-500/20 text-white relative overflow-hidden">
          <ShieldAlert className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-10" />
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">Expired</span>
          <h3 className="text-4xl font-black mb-2">{stats.expired}</h3>
          <p className="text-xs font-medium opacity-90">Requires immediate removal</p>
        </div>
        <div className="bg-amber-500 rounded-2xl p-6 shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 opacity-10" />
          <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-80">Expires &lt; 30 Days</span>
          <h3 className="text-4xl font-black mb-2">{stats.under30}</h3>
          <p className="text-xs font-medium opacity-90">Action needed soon</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Expires &lt; 90 Days</span>
          <h3 className="text-4xl font-black text-slate-800 mb-2">{stats.under90}</h3>
          <p className="text-xs font-medium text-slate-400">Monitor stock movement</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Expires &lt; 180 Days</span>
          <h3 className="text-4xl font-black text-slate-800 mb-2">{stats.under180}</h3>
          <p className="text-xs font-medium text-slate-400">Standard monitoring</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Medicines Requiring Attention</h3>
          <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all shadow-sm">
            Export Report
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch No</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Days Left</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((a) => (
              <tr key={a.batch} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-mono font-bold text-slate-800">{a.batch}</td>
                <td className="p-4 font-bold text-slate-700">{a.medicine}</td>
                <td className="p-4 font-bold text-slate-600">{a.expiry}</td>
                <td className="p-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider ${
                    a.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.daysLeft} Days
                  </span>
                </td>
                <td className="p-4 text-right font-black text-slate-800">{a.stock}</td>
                <td className="p-4 pr-6">
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] uppercase tracking-wider transition-all">
                    Return to Supplier
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
