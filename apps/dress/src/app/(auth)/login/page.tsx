"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/hooks/useNavigate';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

import { API_BASE_URL } from '@/config/api';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // If they already have a token, skip login and go to POS
        navigate('/pos');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e.currentTarget.email.value, password: e.currentTarget.password.value, businessType: 'dress' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role || 'admin');

        // Extract restaurantId from response OR decode JWT payload as fallback
        let rid = data.restaurantId;
        if (!rid && data.token) {
          try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            rid = payload.restaurantId;
            console.log('Got restaurantId from JWT:', rid);
          } catch {}
        }
        localStorage.setItem('restaurantId', rid || 'local-shop');

        if (data.sidebarFeatures) {
          localStorage.setItem('servewell_sidebar', JSON.stringify(data.sidebarFeatures));
        }

        // Clear old cached data so fresh data is always shown
        localStorage.removeItem('servewell_restaurant_details');

        // Fetch tenant details to sync DB
        if (rid && rid !== 'local-shop') {
          try {
            const tenantRes = await fetch(`${API_BASE_URL}/api/v1/restaurants/${rid}`, {
              headers: { Authorization: `Bearer ${data.token}` }
            });
            const tenantData = await tenantRes.json();
            console.log('Tenant sync response:', tenantData);
            if (tenantData.success && tenantData.data) {
              const t = tenantData.data;
              const normalized = {
                name: t.name || t.restaurantName || t.shopName || 'Retail Store',
                tagline: t.tagline || '',
                phone: t.phone || '',
                gstin: t.gstin || '',
                address: t.address || '',
                logo: t.logo || '',
                whatsappNumber: t.whatsappNumber || '',
                whatsappToken: t.whatsappToken || '',
                whatsappBusinessId: t.whatsappBusinessId || ''
              };
              localStorage.setItem('servewell_restaurant_details', JSON.stringify(normalized));

              if (t.defaultMenu && t.defaultMenu.length > 0) {
                const currentCount = await db.menuItems.count();
                if (currentCount === 0) {
                  await db.menuItems.clear();
                  const itemsToInsert = t.defaultMenu.map((m: any) => ({
                    ...m,
                    id: String(m.id || crypto.randomUUID()),
                    price: Number(m.price) || 0,
                    purchasePrice: Number(m.purchasePrice) || 0,
                    stock: Number(m.stock) || 0,
                    type: m.type || 'standard',
                    img: m.img || ''
                  }));
                  await db.menuItems.bulkPut(itemsToInsert);
                  console.log(`✅ Synced ${itemsToInsert.length} items from backend`);
                } else {
                  console.log(`✅ Local DB already has items, skipping backend menu overwrite to preserve stock`);
                }
              }
            }
          } catch (e) {
            console.error("Failed to sync tenant data", e);
          }
        }

        navigate('/pos');
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center bg-black overflow-hidden relative font-sans">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105 transition-transform duration-[20s] hover:scale-100"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      />
      
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-black/90 md:via-black/70 md:to-black/30" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-center px-4 md:px-12 h-screen">
        
        {/* Left Side: Branding / Marketing */}
        <div className="hidden md:flex flex-col text-white max-w-lg pb-20">
          <div className="w-28 h-28 flex items-center justify-center mb-8 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
            <Logo className="w-full h-full drop-shadow-xl" />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tight leading-tight">
            Elevate Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Retail Experience.</span>
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed mt-4 border-l-2 border-rose-500 pl-6">
            State-of-the-art billing, seamless inventory management, and digital WhatsApp receipts designed exclusively for modern fashion boutiques.
          </p>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="w-full max-w-md mx-auto md:mx-0">
          <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/20 relative overflow-hidden group">
            
            {/* Subtle glow effect inside the card */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl transition-opacity duration-700 opacity-50 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex flex-col items-center md:items-start mb-10">
                <div className="md:hidden w-20 h-20 flex items-center justify-center mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                  <Logo className="w-full h-full drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h2>
                <p className="text-sm font-medium text-slate-300">Log in to manage your boutique.</p>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/30 backdrop-blur-md flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      name="email"
                      type="email" 
                      required
                      placeholder="admin@heybro.com" 
                      className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/50 transition-all text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                    <a href="#" className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/50 transition-all text-white placeholder-slate-500"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 pb-4">
                  <input type="checkbox" id="remember" className="rounded-md border-white/20 bg-black/40 text-rose-500 focus:ring-rose-500/50 cursor-pointer" />
                  <label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer select-none">Keep me securely logged in</label>
                </div>

                <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 shadow-lg shadow-rose-500/30 text-white border border-white/10 transition-all duration-300 hover:scale-[1.02]">
                  {loading ? 'Authenticating...' : 'Access Dashboard'}
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Protected by ServeWell Security &copy; 2026
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
