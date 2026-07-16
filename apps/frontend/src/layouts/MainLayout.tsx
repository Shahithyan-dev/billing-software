import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { 
  LayoutDashboard, 
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
  ChevronDown
} from 'lucide-react';

const Sidebar = ({ className = "w-64 hidden md:flex" }: { className?: string }) => {
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

  return (
    <aside className={`bg-card border-r border-border h-screen flex-col z-50 ${className}`}>
      <div className="h-20 flex items-center px-6 gap-3 pt-4">
        <div className="w-10 h-10 bg-[#4a7b47]/10 rounded-full flex items-center justify-center overflow-hidden p-1">
          <img src="/logo.png" alt="ServeWell" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#2c332c]">ServeWell</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'bg-[#4a7b47] text-white shadow-md shadow-[#4a7b47]/20' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
        Enterprise Offline OS v1.0
      </div>
    </aside>
  );
};

export const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-background text-foreground overflow-hidden print:overflow-visible relative">
      <div className="print:hidden h-full flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white" onClick={e => e.stopPropagation()}>
            <Sidebar className="w-full flex" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-background">
        <header className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 z-10 pt-4 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-muted-foreground hover:bg-white rounded-lg hover:shadow-sm transition-all md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-border">
               <img src="/logo.png" alt="ServeWell" className="w-5 h-5 object-contain" />
               <span className="font-bold text-[#2c332c]">ServeWell</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-border text-sm font-medium text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible p-4 md:p-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
