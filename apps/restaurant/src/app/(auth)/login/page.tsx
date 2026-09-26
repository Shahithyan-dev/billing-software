"use client";

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, FileText, BarChart2, ShieldCheck, Users, Zap, Shield, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/hooks/useNavigate';
import Link from 'next/link';
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
        localStorage.setItem('token', result.token);
        localStorage.setItem('restaurantId', result.restaurantId);
        localStorage.setItem('role', result.role);
        
        if (result.captains) localStorage.setItem('zyncobill_captains', JSON.stringify(result.captains));
        if (result.tables) localStorage.setItem('zyncobill_tables', JSON.stringify(result.tables));
        if (result.sidebarFeatures) localStorage.setItem('zyncobill_sidebar', JSON.stringify(result.sidebarFeatures));
        if (result.restaurant) localStorage.setItem('zyncobill_restaurant_details', JSON.stringify(result.restaurant));
        
        if (result.defaultMenu && result.defaultMenu.length > 0) {
          const existingMenu = localStorage.getItem(`zyncobill_menu_${result.restaurantId}`);
          if (!existingMenu || JSON.parse(existingMenu).length === 0) {
            localStorage.setItem(`zyncobill_menu_${result.restaurantId}`, JSON.stringify(result.defaultMenu));
          }
        }
        
        let redirectPath = '/pos';
        if (result.sidebarFeatures && result.sidebarFeatures.length > 0) {
          const firstFeature = result.sidebarFeatures[0].toLowerCase();
          const routeMap: Record<string, string> = {
            'pos': '/pos',
            'kitchen': '/kitchen',
            'inventory': '/inventory',
            'reservations': '/reservations',
            'analytics': '/analytics',
            'staff': '/staff',
            'loyalty': '/loyalty',
            'hardware': '/hardware',
            'security': '/security',
            'settings': '/settings',
            'dashboard': '/dashboard'
          };
          redirectPath = routeMap[firstFeature] || '/pos';
        }
        
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
    <div className="min-h-screen w-full bg-[#03132e] flex flex-col md:flex-row relative overflow-hidden font-sans">
      
      {/* Background Abstract Shapes */}
      <div className="absolute top-[-10%] right-[30%] w-[120%] h-[120%] rounded-full border border-blue-500/20 shadow-[inset_0_0_150px_rgba(0,100,255,0.15)] opacity-40 pointer-events-none mix-blend-screen" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Top Right Trust Badge */}
      <div className="absolute top-8 right-8 z-20 hidden md:flex items-center gap-3 bg-[#0a1b38] px-4 py-2 rounded-full border border-blue-900/50 shadow-lg">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <div>
          <p className="text-white text-xs font-bold leading-tight">Trusted by 10,000+</p>
          <p className="text-blue-200 text-[10px] leading-tight">Businesses Across India</p>
        </div>
      </div>

      {/* Left Side: Brand & Marketing */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 z-10 text-white relative pt-12 md:pt-0">
        
        {/* Logo Top Left */}
        <div className="absolute top-8 left-8 md:left-20 flex items-center gap-3">
           <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-lg" /> 
           <div>
             <h1 className="text-2xl font-bold tracking-tight leading-none mb-1">ZyncoBill</h1>
             <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none">Billing Made Better</p>
           </div>
        </div>

        {/* Main Headline */}
        <div className="mt-16 md:mt-0">
          <h2 className="text-5xl md:text-[64px] font-bold leading-[1.1] mb-6 tracking-tight">
            Smart Billing.<br/>
            <span className="text-blue-500">Stronger Business.</span>
          </h2>
          <p className="text-blue-100/80 text-lg md:text-xl max-w-md font-medium leading-relaxed">
            All your billing, invoices & business insights in one secure platform.
          </p>
        </div>

        {/* Feature Icons Grid */}
        <div className="flex flex-wrap gap-6 md:gap-8 mt-12 md:mt-16">
           <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c244c] to-[#061836] border border-blue-800/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,100,255,0.15)] hover:border-blue-500/50 transition-colors">
                <FileText className="w-7 h-7 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-200">Smart Billing</span>
           </div>
           
           <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c244c] to-[#061836] border border-blue-800/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,100,255,0.15)] hover:border-blue-500/50 transition-colors">
                <BarChart2 className="w-7 h-7 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-200">Powerful Reports</span>
           </div>

           <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c244c] to-[#061836] border border-blue-800/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,100,255,0.15)] hover:border-blue-500/50 transition-colors">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-200">Secure & Reliable</span>
           </div>

           <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c244c] to-[#061836] border border-blue-800/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,100,255,0.15)] hover:border-blue-500/50 transition-colors">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-200">For Every Business</span>
           </div>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="w-full md:w-[600px] flex items-center justify-center p-6 md:p-12 z-10">
         <div className="bg-white rounded-[2.5rem] p-10 md:p-14 w-full max-w-[480px] shadow-2xl relative">
            <div className="flex flex-col items-center mb-10">
               <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mb-6 drop-shadow-sm" />
               <h3 className="text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">Welcome Back</h3>
               <p className="text-slate-500 font-medium">Sign in to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-200 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  className="w-full pl-14 pr-4 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Enter your password" 
                  className="w-full pl-14 pr-12 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading} className="w-full py-7 text-[17px] font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all">
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
         </div>
      </div>

      {/* Bottom Floating Badges */}
      <div className="absolute bottom-8 left-0 right-0 hidden md:flex justify-center z-20">
         <div className="flex items-center gap-8 bg-[#0a1b38]/80 backdrop-blur-md px-8 py-4 rounded-full border border-blue-800/40 shadow-xl">
            <div className="flex items-center gap-3">
               <Zap className="text-blue-500 w-5 h-5 fill-blue-500/20" /> 
               <span className="text-sm font-medium text-blue-100">Fast & Easy</span>
            </div>
            <div className="w-px h-5 bg-blue-800/60"></div>
            <div className="flex items-center gap-3">
               <Shield className="text-blue-500 w-5 h-5 fill-blue-500/20" /> 
               <span className="text-sm font-medium text-blue-100">100% Secure</span>
            </div>
            <div className="w-px h-5 bg-blue-800/60"></div>
            <div className="flex items-center gap-3">
               <RefreshCw className="text-blue-500 w-5 h-5" /> 
               <span className="text-sm font-medium text-blue-100">Always Updated</span>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Login;
