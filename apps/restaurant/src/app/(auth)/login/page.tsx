"use client";

import React, { useState } from 'react';
import { ChefHat, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@/hooks/useNavigate';;
import Link from 'next/link';;

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
        localStorage.setItem('token', result.token);
        localStorage.setItem('restaurantId', result.restaurantId);
        localStorage.setItem('role', result.role);
        
        if (result.captains) localStorage.setItem('zyncobill_captains', JSON.stringify(result.captains));
        if (result.tables) localStorage.setItem('zyncobill_tables', JSON.stringify(result.tables));
        if (result.sidebarFeatures) localStorage.setItem('zyncobill_sidebar', JSON.stringify(result.sidebarFeatures));
        if (result.restaurant) localStorage.setItem('zyncobill_restaurant_details', JSON.stringify(result.restaurant));
        
        // Only override local menu if backend sent a default one and local is empty
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
    <div className="min-h-screen w-full flex items-center bg-gradient-to-br from-blue-950 via-[#0b1a30] to-amber-950 p-4 md:p-8 relative">
      {/* Background styling */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 ml-0 md:ml-12 border border-[#e3e3df]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain mix-blend-multiply p-2 drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black text-[#2c332c] mb-2 tracking-tight">ZyncoBill</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
            Smart Billing System
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#2c332c]">Better Management.</h2>
          <h2 className="text-xl font-bold text-[#2c332c]">Better Business.</h2>
          <p className="text-sm text-muted-foreground mt-2">All in one solution for billing, orders, inventory and more.</p>
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
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              required
              placeholder="Password" 
              className="w-full pl-12 pr-12 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-amber-500 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
              <input type="checkbox" className="rounded text-amber-500 border-[#e3e3df] focus:ring-amber-500" />
              Remember Me
            </label>
            <a href="#" className="text-blue-900 font-bold hover:underline">Forgot Password?</a>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-black rounded-xl bg-blue-900 hover:bg-blue-800 text-white shadow-lg shadow-blue-900/20 transition-all">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;
