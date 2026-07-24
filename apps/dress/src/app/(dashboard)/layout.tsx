"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  ChefHat, 
  Users, 
  Calendar, 
  Settings, 
  ShieldCheck, 
  Wallet,
  Activity,
  Cpu,
  PackageOpen,
  Menu,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const Sidebar = ({ className = "w-64 flex" }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFeatures = localStorage.getItem('servewell_sidebar');
      if (storedFeatures) {
        setAllowedFeatures(JSON.parse(storedFeatures));
      } else {
        // Fallback to all if not set
        setAllowedFeatures(['POS', 'Online Orders', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings']);
      }
    }
  }, []);
  const menuItems = [
    { name: 'Home', icon: Activity, path: '/pos' },
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
        <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-amber-400/10 rounded-lg p-1.5 border border-amber-400/30">
          <Logo className="w-full h-full drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white leading-none">RetailBill</h1>
          <p className="text-[10px] text-amber-400 font-bold mt-1">Smart Retail Billing</p>
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
                  className={`flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm ${
                    isActive 
                      ? 'bg-amber-400/10 text-amber-400 border-l-[3px] border-amber-400' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
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
          <h3 className="text-white text-xs font-bold mb-1">Lifetime Plan</h3>
          <p className="text-amber-400 font-bold text-[10px] mb-3">Active Forever</p>
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
          alert('You have been logged out because your account was accessed from another device.');
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

  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-white text-slate-800 overflow-hidden print:overflow-visible relative">
      {/* Sidebar Overlay (Mobile/Tablet) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#0b1a30] shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full h-full flex bg-[#0b1a30]" />
          </div>
        </div>
      )}

      {/* Persistent Sidebar (Desktop) */}
      <div className="hidden lg:block w-64 shrink-0 border-r border-slate-700 bg-[#0b1a30]">
        <Sidebar className="w-full h-full flex bg-[#0b1a30]" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-white text-slate-800">
        <header className="sticky top-0 z-30 print:hidden">
          {/* Gold accent line */}
          <div className="h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400"></div>
          <div className="flex items-center px-4 md:px-6 py-2.5 bg-[#0b1a30] border-b border-slate-700/50 shadow-lg">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-all lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Desktop Logo */}
              <div className="hidden sm:flex items-center gap-3 cursor-pointer group">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all rounded-md p-1">
                  <Logo className="w-full h-full drop-shadow-md" />
                </div>
                <div>
                  <span className="font-black text-sm tracking-widest text-white block leading-none">RETAILBILL</span>
                  <span className="text-[8px] text-amber-400/70 font-bold tracking-[0.2em] uppercase">Smart Billing</span>
                </div>
              </div>
              {/* Mobile Logo */}
              <div className="flex sm:hidden items-center gap-2 cursor-pointer">
                <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm rounded p-0.5">
                  <Logo className="w-full h-full" />
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
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
