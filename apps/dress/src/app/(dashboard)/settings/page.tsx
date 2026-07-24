"use client";

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';
import { 
  Settings as SettingsIcon, 
  Save, 
  Smartphone, 
  Building, 
  MapPin, 
  Phone, 
  Tag, 
  Lock,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import { db } from '@/lib/db';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('servewell_restaurant_details');
      if (stored) {
        const parsed = JSON.parse(stored);
        setName(parsed.name || '');
        setTagline(parsed.tagline || '');
        setPhone(parsed.phone || '');
        setGstin(parsed.gstin || '');
        setAddress(parsed.address || '');
        setWhatsappNumber(parsed.whatsappNumber || '');
        setWhatsappBusinessId(parsed.whatsappBusinessId || '');
        setWhatsappToken(parsed.whatsappToken || '');
      }

      // Offline retail mode: no need to fetch from backend API.
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const payload = {
      name,
      tagline,
      phone,
      gstin,
      address,
      whatsappNumber,
      whatsappBusinessId,
      whatsappToken
    };

    // Save locally for the offline retail version
    localStorage.setItem('servewell_restaurant_details', JSON.stringify(payload));
    
    setTimeout(() => {
      setSuccess("Settings updated successfully! It will now reflect in your POS and Invoices.");
      setLoading(false);
    }, 400);
  };

  const handleLoadDemoData = async () => {
    if (!confirm("This will clear all current items and load default Dress Store demo data. Are you sure?")) return;
    setLoading(true);
    
    // Set dress store details
    const demoDetails = {
      name: "Sri Murugan Silks",
      tagline: "Exclusive Silk Sarees & Clothing",
      phone: "+91 9876543210",
      gstin: "33ABCDE1234F1Z5",
      address: "123 Shopping Street, City",
      whatsappNumber: "",
      whatsappBusinessId: "",
      whatsappToken: ""
    };
    localStorage.setItem('servewell_restaurant_details', JSON.stringify(demoDetails));
    
    // Update local state
    setName(demoDetails.name);
    setTagline(demoDetails.tagline);
    setPhone(demoDetails.phone);
    setGstin(demoDetails.gstin);
    setAddress(demoDetails.address);

    // Seed Dexie DB with Dress Items
    await db.menuItems.clear();
    await db.menuItems.bulkAdd([
      { id: crypto.randomUUID(), name: 'Kanchipuram Silk Saree', price: 15000, purchasePrice: 12000, category: 'Sarees', type: 'standard', stock: 10, img: 'https://images.unsplash.com/photo-1610189013233-018fcc13dc4e?auto=format&fit=crop&q=80&w=200' },
      { id: crypto.randomUUID(), name: 'Cotton Kurti', price: 850, purchasePrice: 500, category: 'Kurtis', type: 'standard', stock: 50, img: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80&w=200' },
      { id: crypto.randomUUID(), name: 'Designer Lehenga', price: 25000, purchasePrice: 18000, category: 'Lehengas', type: 'standard', stock: 5, img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200' },
      { id: crypto.randomUUID(), name: 'Mens Casual Shirt', price: 1200, purchasePrice: 800, category: 'Shirts', type: 'standard', stock: 30, img: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717?auto=format&fit=crop&q=80&w=200' },
      { id: crypto.randomUUID(), name: 'Denim Jeans', price: 1800, purchasePrice: 1000, category: 'Jeans', type: 'standard', stock: 25, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200' }
    ]);
    
    setSuccess("Demo Data loaded successfully! Go to the POS dashboard to see the items.");
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-100 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuration Settings</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage dress shop branding details and WhatsApp Cloud configurations</p>
        </div>
        <button 
          onClick={handleLoadDemoData}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-2.5 px-4 rounded-xl transition-all text-sm shrink-0"
        >
          <Database className="w-4 h-4" /> Load Demo Data
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-2.5 text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Business Details */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Building className="w-4 h-4 text-amber-500" />
            1. Business Profile
          </h3>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Store / Firm Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Tagline</label>
              <input 
                type="text" 
                value={tagline} 
                onChange={(e) => setTagline(e.target.value)} 
                placeholder="Ex. Quality is our priority"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">GSTIN Number</label>
              <input 
                type="text" 
                value={gstin} 
                onChange={(e) => setGstin(e.target.value.toUpperCase())} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Store Address</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Cloud API configuration */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-emerald-500 animate-pulse" />
            2. WhatsApp API Integration
          </h3>

          <div className="bg-[#25d366]/5 border border-[#25d366]/25 rounded-2xl p-5 mb-6 text-xs leading-relaxed text-[#128c7e] font-semibold">
            Configuring these credentials activates automated invoice deliveries to customer mobile numbers on checkouts via Meta's Cloud API in the background. Leave blank to run in click-to-share manual fallback mode.
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">WhatsApp Business Phone Number (Sender)</label>
              <input 
                type="text" 
                value={whatsappNumber} 
                onChange={(e) => setWhatsappNumber(e.target.value)} 
                placeholder="+91 9999999999"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">WhatsApp Phone Number ID</label>
              <input 
                type="text" 
                value={whatsappBusinessId} 
                onChange={(e) => setWhatsappBusinessId(e.target.value)} 
                placeholder="E.g. 105829188045612"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">WhatsApp Cloud API Access Token</label>
              <textarea 
                value={whatsappToken} 
                onChange={(e) => setWhatsappToken(e.target.value)} 
                placeholder="EAAW..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-400 text-white font-bold text-base tracking-wide rounded-2xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
        >
          {loading ? 'Saving Settings...' : 'Save Configuration Details'}
          {!loading && <Save className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
