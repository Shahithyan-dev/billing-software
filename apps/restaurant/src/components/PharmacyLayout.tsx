"use client";
// Force rebuild

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { syncEngine } from '@/lib/syncEngine';
import { 
  ShoppingCart, 
  Users, 
  Settings, 
  Activity,
  PackageOpen,
  AlignJustify,
  LogOut,
  FolderTree,
  CornerUpLeft,
  Stethoscope,
  Factory,
  AlertTriangle,
  Printer,
  FileText,
  UserCog,
  Calendar
} from 'lucide-react';

const Sidebar = ({ className = "w-64 flex" }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
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

  const menuItems = [
    { name: 'Dashboard', icon: Activity, path: '/analytics' },
    { name: 'POS Billing', icon: ShoppingCart, path: '/pos' },
    { name: 'Medicines', icon: PackageOpen, path: '/items' },
    { name: 'Categories', icon: FolderTree, path: '/categories' },
    { name: 'Inventory', icon: PackageOpen, path: '/inventory' },
    { name: 'Purchase', icon: ShoppingCart, path: '/purchases' },
    { name: 'Purchase Return', icon: CornerUpLeft, path: '/purchase-returns' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
    { name: 'Sales Return', icon: CornerUpLeft, path: '/sales-returns' },
    { name: 'Customers', icon: Users, path: '/parties' },
    { name: 'Prescriptions', icon: Stethoscope, path: '/prescriptions' },
    { name: 'Suppliers', icon: Users, path: '/parties' },
    { name: 'Manufacturers', icon: Factory, path: '/manufacturers' },
    { name: 'Batch Management', icon: PackageOpen, path: '/inventory/batches' },
    { name: 'Expiry Alerts', icon: AlertTriangle, path: '/inventory/expiry' },
    { name: 'Barcode Printing', icon: Printer, path: '/inventory/barcodes' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Staff', icon: UserCog, path: '/staff' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`bg-white border-r border-slate-200 h-screen flex-col z-50 ${className}`}>
      <div className="h-20 flex items-center px-6 gap-3 pt-4 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-white rounded-lg p-1 border border-slate-100 shadow-sm">
          <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">ZyncoBill</h1>
          <p className="text-[10px] text-teal-600 font-bold mt-1">Pharmacy Edition</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <ul className="space-y-1.5 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'));
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                      : 'text-slate-500 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
          <h3 className="text-slate-900 text-xs font-bold mb-1 capitalize">{planName} Plan</h3>
          <p className="text-teal-600 font-bold text-[10px] mb-3">
            {planName === 'lifetime' 
              ? 'Active Forever' 
              : (daysLeft !== null ? `${daysLeft} days left` : 'Active Subscription')}
          </p>
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm">
            Support
          </button>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default function PharmacyLayout({
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
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('zyncobill_language') as 'en' | 'ta';
      if (savedLang) setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    localStorage.setItem('zyncobill_language', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const initCapgo = async () => {
      try {
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
        await CapacitorUpdater.notifyAppReady();
      } catch (e) {
      }
    };
    initCapgo();
  }, []);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

    const verifySession = async () => {
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
      }
    };

    verifySession();
    const interval = setInterval(verifySession, 30000);
    syncEngine.start();

    return () => {
      clearInterval(interval);
      syncEngine.stop();
    };
  }, [router]);

  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-[#f8fafc] text-[#1e3a8a] overflow-hidden print:overflow-visible relative">
      {/* Sidebar Overlay (All screen sizes) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full h-full flex" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-[#f8fafc]">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 shadow-sm print:hidden transition-all relative overflow-hidden bg-[#0f172a]">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 via-transparent to-[#0b1a30] z-0"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 text-[#1e40af] bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-[#e2e8f0] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <AlignJustify className="w-5 h-5" />
            </button>
            
            {/* Desktop Logo */}
            <div className="hidden sm:flex items-center cursor-pointer hover:scale-105 transition-transform gap-3">
               <img src="/logo.png" alt="ZyncoBill" className="w-12 h-12 object-contain drop-shadow-sm bg-white rounded-xl p-1" />
               <div>
                  <span className="font-black text-white tracking-widest block leading-none">ZYNCOBILL</span>
                  <span className="text-teal-400 text-[10px] font-bold tracking-widest uppercase">Pharmacy</span>
               </div>
            </div>
            
            {/* Mobile Logo */}
            <div className="flex sm:hidden items-center cursor-pointer">
               <img src="/logo.png" alt="ZyncoBill" className="w-10 h-10 object-contain drop-shadow-sm bg-white rounded-lg p-1" />
            </div>
          </div>

          <div className="flex-1 hidden md:block relative z-10"></div>

          <div className="flex items-center gap-3 md:gap-4 relative z-10">
             <div className="flex items-center bg-white/10 p-1 rounded-lg border border-white/20 backdrop-blur-md">
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    language === 'en' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  EN
                </button>
                <button 
                  onClick={() => handleLanguageChange('ta')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    language === 'ta' ? 'bg-white text-[#1e40af] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  தமிழ்
                </button>
             </div>

             <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-sm border border-white/20 text-xs md:text-sm font-bold text-white backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-400" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0 relative">
          {planName !== 'lifetime' && daysLeft !== null && daysLeft <= 0 ? (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border border-red-100 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Subscription Expired</h2>
                <p className="text-slate-500 mb-6">Your <strong>{planName}</strong> plan has expired. Please renew your subscription to continue using ZyncoBill.</p>
                <div className="space-y-3">
                  <button className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md">
                    Renew Plan / Contact Support
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      router.push('/login');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
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
