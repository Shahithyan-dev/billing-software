"use client";

import React, { useState } from 'react';
import { db, Party } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Building, 
  Mail, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  X 
} from 'lucide-react';

export default function PartiesPage() {
  const parties = useLiveQuery(() => db.parties.toArray()) || [];
  
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');

  const filteredParties = parties.filter(p => {
    const matchesTab = p.type === activeTab;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // Totals calculations
  const totalReceivable = parties
    .filter(p => p.type === 'customer')
    .reduce((sum, p) => sum + (Number(p.openingBalance) || 0), 0);

  const totalPayable = parties
    .filter(p => p.type === 'supplier')
    .reduce((sum, p) => sum + (Number(p.openingBalance) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Name and Phone are required.");
      return;
    }

    const newParty: Party = {
      type: activeTab,
      name,
      phone,
      email: email || undefined,
      gstin: gstin || undefined,
      address: address || undefined,
      openingBalance: parseFloat(openingBalance) || 0
    };

    try {
      await db.parties.add(newParty);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add party:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this party?")) {
      await db.parties.delete(id);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setAddress('');
    setOpeningBalance('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Parties Ledger</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage your customer receivables and supplier payables</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Party
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customers Summary */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Customers Receivable</span>
            <h2 className="text-3xl font-black text-emerald-800 mt-2">₹ {totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        {/* Suppliers Summary */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-100 rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total Suppliers Payable</span>
            <h2 className="text-3xl font-black text-amber-800 mt-2">₹ {totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          </div>
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
            <TrendingDown className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none ${activeTab === 'customer' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 md:flex-none ${activeTab === 'supplier' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Suppliers
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}s...`}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Parties List Grid */}
      {filteredParties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No {activeTab}s found</h3>
          <p className="text-slate-400 text-sm mt-1">Add a new party to start tracking their balance history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => (
            <div
              key={party.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 relative group overflow-hidden"
            >
              <button
                onClick={() => party.id && handleDelete(party.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <h3 className="font-extrabold text-lg text-slate-800 mb-4">{party.name}</h3>

              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{party.phone}</span>
                </div>
                {party.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{party.email}</span>
                  </div>
                )}
                {party.gstin && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>GSTIN: {party.gstin}</span>
                  </div>
                )}
                {party.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{party.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</span>
                <span className={`font-black text-sm ${party.openingBalance && party.openingBalance > 0 ? (activeTab === 'customer' ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-500'}`}>
                  ₹ {(party.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-lg p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Add New {activeTab === 'customer' ? 'Customer' : 'Supplier'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Party Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Mobile No *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">GSTIN</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Billing Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-colors text-sm"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
