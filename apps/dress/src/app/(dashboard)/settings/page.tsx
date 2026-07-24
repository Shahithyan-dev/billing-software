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
  AlertCircle
} from 'lucide-react';

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

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configuration Settings</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage dress shop branding details and WhatsApp Cloud configurations</p>
        </div>
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
