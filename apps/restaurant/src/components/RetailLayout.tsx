"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingCart, Activity, Users, Settings, LogOut, PackageOpen, LayoutGrid, X, Search, FileText, ChevronDown, CheckCircle2, AlertCircle, ShoppingBag, BarChart2, Globe, AlignJustify, Calendar 
} from 'lucide-react';

const Sidebar = ({ className = "w-64 flex" }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);
  const [planName, setPlanName] = useState<string>('lifetime');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFeatures = localStorage.getItem('zyncobill_sidebar');
      if (storedFeatures) {
        const parsed = JSON.parse(storedFeatures);
        if (!parsed.includes('Analytics')) parsed.push('Analytics');
        if (!parsed.includes('Online Orders')) parsed.push('Online Orders');
        setAllowedFeatures(parsed);
      } else {
        // Fallback to all if not set
        setAllowedFeatures(['Home', 'Analytics', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings']);
      }

      const storedRestaurant = localStorage.getItem('zyncobill_restaurant_details');
      if (storedRestaurant) {
        try {
          const details = JSON.parse(storedRestaurant);
          if (details.subscriptionPlan) {
            setPlanName(details.subscriptionPlan);
          }
          if (details.subscriptionPlan !== 'lifetime') {
            const endDate = details.subscriptionStatus === 'trial' ? details.trialEndsAt : details.subscriptionEndsAt;
            if (endDate) {
              const diffTime = new Date(endDate).getTime() - new Date().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysLeft(diffDays > 0 ? diffDays : 0);
            }
          }
        } catch (e) {}
      }
    }
  }, []);
  const menuItems = [
    { name: 'Home', icon: Activity, path: '/pos' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Parties', icon: Users, path: '/parties' },
    { name: 'Items', icon: PackageOpen, path: '/items' },
    { name: 'Sale Invoices', icon: ShoppingCart, path: '/sales' },
    { name: 'Purchases', icon: ShoppingBag, path: '/purchases' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const visibleMenuItems = menuItems.filter(item => allowedFeatures.includes(item.name));

  return (
    <aside className={`bg-[#0b1a30] border-r border-slate-700 h-screen flex-col z-50 ${className}`}>
      <div className="h-20 flex items-center px-6 gap-3 pt-4 border-b border-slate-700 pb-4">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-slate-800/80 rounded-lg p-1 border border-slate-700/50 shadow-inner">
          <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white leading-none">ZyncoBill</h1>
          <p className="text-[10px] text-amber-400 font-bold mt-1">Smart Billing</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm rounded-xl ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 shadow-sm shadow-amber-500/10' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-5 border-t border-slate-700">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-400/20 p-4 mb-4">
          <h3 className="text-white text-xs font-bold mb-1 capitalize">{planName} Plan</h3>
          <p className="text-amber-400 font-bold text-[10px] mb-3">
            {planName === 'lifetime' 
              ? 'Active Forever' 
              : (daysLeft !== null ? `${daysLeft} days left` : 'Active Subscription')}
          </p>
          <button className="w-full bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/20 text-[#0b1a30] text-xs font-black py-2 transition-colors">
            Support
          </button>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 w-full transition-all font-bold text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [planName, setPlanName] = useState<string>('lifetime');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRestaurant = localStorage.getItem('zyncobill_restaurant_details');
      if (storedRestaurant) {
        try {
          const details = JSON.parse(storedRestaurant);
          if (details.subscriptionPlan) {
            setPlanName(details.subscriptionPlan);
          }
          if (details.subscriptionPlan !== 'lifetime') {
            const endDate = details.subscriptionStatus === 'trial' ? details.trialEndsAt : details.subscriptionEndsAt;
            if (endDate) {
              const diffTime = new Date(endDate).getTime() - new Date().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setDaysLeft(diffDays > 0 ? diffDays : 0);
            }
          }
        } catch (e) {}
      }
    }
  }, []);

  const getPageTitle = (path: string) => {
    if (path.startsWith('/pos')) return 'POS Dashboard';
    if (path.startsWith('/sales')) return 'Sales Invoices';
    if (path.startsWith('/parties')) return 'Parties Directory';
    if (path.startsWith('/items')) return 'Items Inventory';
    if (path.startsWith('/purchases')) return 'Purchase Bills';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);


  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

    const verifySession = async () => {
      if (token === 'local-offline-token') return; // Bypass for local UI testing
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          alert('Your session has expired or is invalid. Please log in again.');
          router.push('/login');
        }
      } catch (e) {
        // Offline or network error, ignore
      }
    };

    verifySession();
    const interval = setInterval(verifySession, 30000);
    return () => clearInterval(interval);
  }, [router]);

  // Sync tenant data + items from backend on every load
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const rid = localStorage.getItem('restaurantId');
    if (!token || !rid || token === 'local-offline-token') return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

    const syncTenant = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/restaurants/${rid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const t = data.data;
          const existingStr = localStorage.getItem('zyncobill_restaurant_details');
          const existing = existingStr ? JSON.parse(existingStr) : {};
          const normalized = {
            ...existing,
            ...t,
            name: t.name || t.restaurantName || t.shopName || 'Retail Store',
            tagline: t.tagline || '',
            phone: t.phone || '',
            gstin: t.gstin || '',
            address: t.address || '',
            logo: t.logo || '',
            whatsappNumber: t.whatsappNumber || '',
            whatsappToken: t.whatsappToken || '',
            whatsappBusinessId: t.whatsappBusinessId || '',
            businessType: t.businessType || existing.businessType || 'retail'
          };
          localStorage.setItem('zyncobill_restaurant_details', JSON.stringify(normalized));


        }
      } catch (e) {
        // Ignore network errors silently
      }
    };

    syncTenant();
  }, []);

  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-white text-slate-800 overflow-hidden print:overflow-visible relative">
      {/* Sidebar Overlay (All screen sizes) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#0b1a30] shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full h-full flex bg-[#0b1a30]" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-white text-slate-800">
        <header className="sticky top-0 z-30 print:hidden">
          {/* Gold accent line */}
          <div className="h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>
          <div className="flex items-center px-4 md:px-6 py-2.5 bg-[#0b1a30] border-b border-slate-700/50 shadow-lg">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all"
              >
                <AlignJustify className="w-5 h-5" />
              </button>
              {/* Desktop Logo */}
              <div className="hidden sm:flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 bg-slate-800/80 flex items-center justify-center shadow-lg shadow-black/20 group-hover:shadow-amber-500/20 transition-all rounded-md p-1 border border-slate-700/50">
                  <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-widest text-white block leading-none">RETAILBILL</span>
                  <span className="text-[8px] text-amber-400/70 font-bold tracking-[0.2em] uppercase">Smart Billing</span>
                </div>
              </div>
              {/* Mobile Logo */}
              <div className="flex sm:hidden items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-slate-800/80 flex items-center justify-center shadow-sm rounded-md p-1 border border-slate-700/50">
                  <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <span className="font-black text-[11px] tracking-widest text-white">RETAILBILL</span>
              </div>
            </div>
            {/* Center area */}
            <div className="flex-1 text-center">
              <h2 className="text-xl font-semibold text-white tracking-wide">{getPageTitle(pathname)}</h2>
              <div className="mt-1 h-0.5 w-24 mx-auto bg-amber-400/70 rounded"></div>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 backdrop-blur-sm px-3 md:px-4 py-2 border border-white/10 text-xs md:text-sm font-bold text-slate-300">
                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0 relative">
          {planName !== 'lifetime' && daysLeft !== null && daysLeft <= 0 ? (
            <div className="absolute inset-0 z-50 bg-[#0b1a30]/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0f2442] border border-red-500/30 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Subscription Expired</h2>
                <p className="text-slate-300 mb-6">Your <strong>{planName}</strong> plan has expired. Please renew your subscription to continue using RetailBill.</p>
                <div className="space-y-3">
                  <button className="w-full bg-amber-500 hover:bg-amber-400 text-[#0b1a30] font-black py-3 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/20">
                    Renew Plan / Contact Support
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      router.push('/login');
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition-colors border border-slate-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
