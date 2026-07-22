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
  LogOut
} from 'lucide-react';

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
        setAllowedFeatures(['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings']);
      }
    }
  }, []);
  const menuItems = [
    { name: 'POS', icon: ShoppingCart, path: '/pos' },
    { name: 'Kitchen', icon: ChefHat, path: '/kitchen' },
    { name: 'Inventory', icon: PackageOpen, path: '/inventory' },
    { name: 'Reservations', icon: Calendar, path: '/reservations' },
    { name: 'Analytics', icon: Activity, path: '/analytics' },
    { name: 'Staff', icon: Users, path: '/staff' },
    { name: 'Loyalty', icon: Wallet, path: '/loyalty' },
    { name: 'Hardware', icon: Cpu, path: '/hardware' },
    { name: 'Security', icon: ShieldCheck, path: '/security' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const visibleMenuItems = menuItems.filter(item => allowedFeatures.includes(item.name));

  return (
    <aside className={`bg-card border-r border-border h-screen flex-col z-50 ${className}`}>
      <div className="h-20 flex items-center px-6 gap-3 pt-4">
        <div className="w-16 h-16 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="ServeWell" className="w-full h-full object-contain mix-blend-multiply p-2" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#2c332c]">ServeWell</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'bg-[#4a7b47] text-white shadow-md shadow-[#4a7b47]/20' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
      
      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Enterprise Offline OS v1.0
        </div>
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

  React.useEffect(() => {
    setIsSidebarOpen(false);
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
    <div className="flex h-screen print:h-auto print:min-h-0 bg-background text-foreground overflow-hidden print:overflow-visible relative">
      {/* Sidebar Overlay (All screen sizes) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full flex" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-background">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm print:hidden transition-all">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 text-[#2c332c] bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-[#e3e3df] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop Logo */}
            <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-[#2c332c] to-gray-800 text-white px-4 py-2.5 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5">
               <div className="bg-white p-1 rounded-lg shadow-sm">
                 <img src="/logo.png" alt="ServeWell" className="w-6 h-6 object-contain" />
               </div>
               <span className="font-black text-sm tracking-wider">SERVEWELL</span>
            </div>
            
            {/* Mobile Logo */}
            <div className="flex sm:hidden items-center gap-2 bg-gradient-to-r from-[#2c332c] to-gray-800 text-white px-3 py-2 rounded-xl shadow-md cursor-pointer">
               <div className="bg-white p-0.5 rounded shadow-sm">
                 <img src="/logo.png" alt="ServeWell" className="w-5 h-5 object-contain" />
               </div>
               <span className="font-black text-[11px] tracking-wider">SERVEWELL</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
             <div className="flex items-center gap-1.5 md:gap-2 bg-white/80 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl shadow-sm border border-[#e3e3df] text-xs md:text-sm font-bold text-[#2c332c] backdrop-blur-sm">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#4a7b47]" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            

          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
