"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/hooks/useNavigate';;
import Link from 'next/link';;
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

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.restaurant?.businessType !== 'dress') {
          setError('This login portal is only for Dress/Retail shops.');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', result.token);
        localStorage.setItem('restaurantId', result.restaurantId);
        localStorage.setItem('role', result.role);
        
        if (result.captains) localStorage.setItem('servewell_captains', JSON.stringify(result.captains));
        if (result.tables) localStorage.setItem('servewell_tables', JSON.stringify(result.tables));
        if (result.sidebarFeatures) localStorage.setItem('servewell_sidebar', JSON.stringify(result.sidebarFeatures));
        if (result.restaurant) localStorage.setItem('servewell_restaurant_details', JSON.stringify(result.restaurant));
        
        // Only override local menu if backend sent a default one and local is empty
        if (result.defaultMenu && result.defaultMenu.length > 0) {
          const existingMenu = localStorage.getItem(`servewell_menu_${result.restaurantId}`);
          if (!existingMenu || JSON.parse(existingMenu).length === 0) {
            localStorage.setItem(`servewell_menu_${result.restaurantId}`, JSON.stringify(result.defaultMenu));
          }
        }
        
        let redirectPath = '/dashboard';
        navigate(redirectPath);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center bg-[#f0f4f8] p-4 md:p-8 relative">
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#f0f4f8] via-[#e2e8f0]/80 to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 ml-0 md:ml-12 border border-[#e2e8f0]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <Logo className="w-full h-full drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black text-[#1e293b] mb-2 tracking-tight">RetailBill</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
            Dress Shop Billing System
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#1e293b]">Simple Billing.</h2>
          <h2 className="text-xl font-bold text-[#1e293b]">Faster Checkout.</h2>
          <p className="text-sm text-muted-foreground mt-2">All in one solution for retail billing, inventory and WhatsApp receipts.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="email"
              type="email" 
              required
              placeholder="Email address" 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
              placeholder="Password" 
              className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500">
              <input type="checkbox" className="rounded text-rose-500 border-slate-200 focus:ring-rose-500" />
              Remember Me
            </label>
            <a href="#" className="text-rose-600 font-medium hover:underline">Forgot Password?</a>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 text-white">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;
