"use client";

import React, { useState } from 'react';
import { Search, Printer, Settings, QrCode, SlidersHorizontal, PackageOpen } from 'lucide-react';

export default function BarcodePrintingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const labelFormats = [
    { id: '25x50', name: '25mm x 50mm - Standard Medicine', columns: 2 },
    { id: '50x50', name: '50mm x 50mm - Large Square', columns: 1 },
    { id: '20x40', name: '20mm x 40mm - Small Vials', columns: 3 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Barcode Generation</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Generate and print GS1-compliant barcodes for loose medicines</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all text-sm">
          <Printer className="w-4 h-4" /> Print Selected
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Search & Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicine to generate barcode..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-slate-800 rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800 shadow-sm"
                />
              </div>
            </div>
            
            <div className="p-6 text-center text-slate-400 py-16">
              <PackageOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-sm">Search and select items to add them to the print queue.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Preview */}
        <div className="space-y-6">
          
          {/* Printer Settings */}
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-slate-800">Print Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Label Format</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-400">
                  {labelFormats.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Include Fields</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    Medicine Name
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    MRP (Price)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    Batch & Expiry Date
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                    Pharmacy Name Header
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm p-6">
             <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-slate-400" />
                <h3 className="font-black text-slate-800">Live Preview</h3>
              </div>
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="w-full aspect-[2/1] bg-slate-100 rounded-xl border border-slate-200 border-dashed flex items-center justify-center p-4">
              <div className="bg-white w-full h-full border border-slate-300 shadow-sm p-3 flex flex-col justify-between">
                <div className="text-[10px] font-black leading-tight">PARACETAMOL 500MG</div>
                <div className="text-center font-mono font-bold tracking-widest my-1 border-y border-slate-200 py-1 flex flex-col items-center">
                  ||||||||||||||||||||||
                  <span className="text-[8px] tracking-normal mt-0.5">8901234567890</span>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-600">
                  <span>B:CV89 Ex:12/26</span>
                  <span className="text-[10px] text-black">₹45.00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
