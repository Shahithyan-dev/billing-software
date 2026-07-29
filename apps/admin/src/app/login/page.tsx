"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Server, Key, Terminal, AlertCircle } from 'lucide-react';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://billing-software-03up.onrender.com';

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e.currentTarget.email.value, password: e.currentTarget.password.value }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.role !== 'superadmin') {
          setError('Access denied. Super Admin role required.');
          setLoading(false);
          return;
        }
        localStorage.setItem('adminToken', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1120] p-4 relative overflow-hidden font-sans selection:bg-amber-500/30">
      
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6 rotate-3 hover:rotate-6 transition-transform">
            <Shield className="w-8 h-8 text-blue-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">ZyncoBill <span className="text-amber-500">System</span></h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Terminal className="w-3 h-3" /> Super Admin Portal
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl text-sm mb-8 border border-rose-500/20 shadow-inner flex items-center gap-2 animate-in slide-in-from-top-2">
             <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Server className="w-5 h-5 text-slate-500" />
              </div>
              <input 
                name="email"
                type="email" 
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-600 transition-all shadow-inner font-medium text-sm"
                placeholder="admin@zyncobill.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Master Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="w-5 h-5 text-slate-500" />
              </div>
              <input 
                name="password"
                type="password" 
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-600 transition-all shadow-inner font-medium text-sm"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 mt-8 text-blue-950 font-black text-base rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-1"
          >
            {loading ? 'Authenticating...' : 'Enter System'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
      
      <div className="absolute bottom-6 text-xs font-medium text-slate-600">
        &copy; {new Date().getFullYear()} ZyncoBill Core Infrastructure
      </div>
    </div>
  );
}
