"use client";
// Force rebuild

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { syncEngine } from '@/lib/syncEngine';
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
  AlignJustify,
  LogOut,
  ShoppingBag,
  Utensils,
  AlertCircle
} from 'lucide-react';

const Sidebar = ({ className = "w-64 flex", hasUnreadOnlineOrders = false }: { className?: string, hasUnreadOnlineOrders?: boolean }) => {
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
        if (!parsed.includes('Menu')) parsed.push('Menu');
        setAllowedFeatures(parsed);
      } else {
        // Fallback to all if not set
        setAllowedFeatures(['POS', 'Online Orders', 'Menu', 'Kitchen', 'Inventory', 'Analytics', 'Staff', 'Hardware', 'Security', 'Settings']);
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
    { name: 'POS', icon: ShoppingCart, path: '/pos' },
    { name: 'Online Orders', icon: ShoppingBag, path: '/online-orders' },
    { name: 'Menu', icon: Utensils, path: '/items' },
    { name: 'Kitchen', icon: ChefHat, path: '/kitchen' },
    { name: 'Inventory', icon: PackageOpen, path: '/inventory' },
    { name: 'Analytics', icon: Activity, path: '/analytics' },
    { name: 'Staff', icon: Users, path: '/staff' },
    { name: 'Hardware', icon: Cpu, path: '/hardware' },
    { name: 'Security', icon: ShieldCheck, path: '/security' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const visibleMenuItems = menuItems.filter(item => allowedFeatures.includes(item.name));

  return (
    <aside className={`bg-card border-r border-border h-screen flex-col z-50 ${className}`}>
      <div className="h-20 flex items-center px-6 gap-3 pt-4 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-white rounded-lg p-1">
          <img src="/logo.png" alt="ZyncoBill" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">ZyncoBill</h1>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Better Service, Smarter Business</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive 
                      ? 'bg-[#d97706] text-white shadow-md' 
                      : 'text-slate-500 hover:bg-amber-50 hover:text-[#d97706]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {item.name === 'Online Orders' && hasUnreadOnlineOrders && (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ml-auto shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
          <h3 className="text-slate-900 text-xs font-bold mb-1 capitalize">{planName} Plan</h3>
          <p className="text-[#f59e0b] font-bold text-[10px] mb-3">
            {planName === 'lifetime' 
              ? 'Active Forever' 
              : (daysLeft !== null ? `${daysLeft} days left` : 'Active Subscription')}
          </p>
          <button className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm">
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [hasUnreadOnlineOrders, setHasUnreadOnlineOrders] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [planName, setPlanName] = useState<string>('lifetime');
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('zyncobill_language') as 'en' | 'ta';
      if (storedLang) setLanguage(storedLang);
      
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


  const handleLanguageChange = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    localStorage.setItem('zyncobill_language', lang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  React.useEffect(() => {
    setIsSidebarOpen(false);
    if (pathname === '/online-orders') {
      setHasUnreadOnlineOrders(false);
    }
  }, [pathname]);

  React.useEffect(() => {
    const initCapgo = async () => {
      try {
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
        await CapacitorUpdater.notifyAppReady();
      } catch (e) {
        // Not running in Capacitor or updater not available
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
        // Offline or network error, ignore
      }
    };

    verifySession();
    const interval = setInterval(verifySession, 30000);
    
    // Start offline sync engine
    syncEngine.start();

    // Setup Socket connection for real-time KDS alerts
    import('socket.io-client').then(({ io }) => {
      const socket = io(API_BASE_URL);
      
      socket.on('order-updated', (updatedOrder: any) => {
        if (updatedOrder.kitchenStatus === 'ready') {
          import('react-hot-toast').then(({ toast }) => {
            toast.success(`Order #${updatedOrder.uuid.slice(-4)} is Ready!`, {
              duration: 5000,
              icon: '🍽️',
              style: { background: '#333', color: '#fff', fontSize: '16px', fontWeight: 'bold', padding: '16px' },
            });
          });
        }
      });

      const restaurantId = localStorage.getItem('restaurantId');
      if (restaurantId) {
        socket.on(`new_online_order_${restaurantId}`, (newOrder: any) => {
          setHasUnreadOnlineOrders(true);
          
          // Play ring sound using Web Audio API
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.8);
            
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.8);
          } catch (e) {
            console.log('Audio error', e);
          }

          import('react-hot-toast').then(({ toast }) => {
            toast.error(`New Swiggy/Zomato Order!`, {
              duration: 8000,
              icon: '🔔',
              style: { background: '#ef4444', color: '#fff', fontSize: '16px', fontWeight: 'bold', padding: '16px' },
            });
          });
        });
      }

      return () => {
        socket.disconnect();
      };
    });

    return () => {
      clearInterval(interval);
      syncEngine.stop();
    };
  }, [router]);

  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-[#f8fafc] text-[#1e3a8a] overflow-hidden print:overflow-visible relative">
      {/* Sidebar Overlay (All screen sizes) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-[#1e3a8a] shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full h-full flex bg-[#1e3a8a]" hasUnreadOnlineOrders={hasUnreadOnlineOrders} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-[#f8fafc]">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 shadow-sm print:hidden transition-all relative overflow-hidden">
          <img src="/banner.png" alt="Header Background" className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a30]/80 via-transparent to-[#0b1a30]/80 z-0"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 text-[#1e40af] bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-[#e2e8f0] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <AlignJustify className="w-5 h-5" />
            </button>
            
            {/* Desktop Logo */}
            <div className="hidden sm:flex items-center cursor-pointer hover:scale-105 transition-transform">
               <img src="/logo.png" alt="ZyncoBill" className="w-12 h-12 object-contain drop-shadow-sm" />
               {/* <span className="font-black text-sm tracking-wider">ZYNCOBILL</span> */}
            </div>
            
            {/* Mobile Logo */}
            <div className="flex sm:hidden items-center cursor-pointer">
               <img src="/logo.png" alt="ZyncoBill" className="w-10 h-10 object-contain drop-shadow-sm" />
               {/* <span className="font-black text-[11px] tracking-wider ml-2 text-[#1e3a8a]">ZYNCOBILL</span> */}
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
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f59e0b]" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0 relative">
          {planName !== 'lifetime' && daysLeft !== null && daysLeft <= 0 ? (
            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border border-red-100 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Subscription Expired</h2>
                <p className="text-slate-500 mb-6">Your <strong>{planName}</strong> plan has expired. Please renew your subscription to continue using ZyncoBill.</p>
                <div className="space-y-3">
                  <button className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md">
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
