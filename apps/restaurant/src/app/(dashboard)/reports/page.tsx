"use client";

import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, TrendingUp, AlertTriangle, ArrowUpRight, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');

  const reportModules = [
    { id: 'sales', name: 'Sales & Revenue', icon: TrendingUp },
    { id: 'inventory', name: 'Inventory & Stock', icon: FileText },
    { id: 'expiry', name: 'Expiry & Batches', icon: AlertTriangle },
    { id: 'gst', name: 'GST & Taxes', icon: DollarSign },
  ];

  const mockReports = [
    { name: 'Daily Sales Register', date: '06 Aug 2026', type: 'PDF', size: '1.2 MB' },
    { name: 'Monthly GST Report (GSTR-1)', date: '01 Aug 2026', type: 'Excel', size: '4.5 MB' },
    { name: 'Near Expiry Stock (90 Days)', date: '06 Aug 2026', type: 'CSV', size: '840 KB' },
    { name: 'Fast Moving Medicines', date: '05 Aug 2026', type: 'PDF', size: '2.1 MB' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reports & Exports</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Generate and download compliance and operational reports</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all text-sm">
          <Calendar className="w-4 h-4" /> Custom Date Range
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {reportModules.map(module => (
          <button
            key={module.id}
            onClick={() => setReportType(module.id)}
            className={`p-5 rounded-2xl border text-left transition-all ${
              reportType === module.id 
                ? 'bg-teal-50 border-teal-200 shadow-sm shadow-teal-500/10' 
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
              reportType === module.id ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <module.icon className="w-5 h-5" />
            </div>
            <h3 className={`font-bold ${reportType === module.id ? 'text-teal-900' : 'text-slate-800'}`}>
              {module.name}
            </h3>
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Generated Reports</h3>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm flex items-center gap-2 shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Report Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockReports.map((report, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                  {report.name}
                </td>
                <td className="p-4 font-bold text-slate-600">{report.date}</td>
                <td className="p-4 font-bold text-slate-500">
                  <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                    report.type === 'PDF' ? 'bg-red-100 text-red-700' :
                    report.type === 'Excel' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {report.type}
                  </span>
                </td>
                <td className="p-4 font-medium text-slate-500">{report.size}</td>
                <td className="p-4 pr-6 text-right">
                   <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-[11px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export
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
