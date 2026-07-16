import React from 'react';
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
  Bell,
  Menu,
  ChevronDown
} from 'lucide-react';

const Sidebar = () => {
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
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col hidden md:flex z-20">
      <div className="h-20 flex items-center px-6 gap-3 pt-4">
        <div className="w-10 h-10 bg-[#4a7b47]/10 rounded-full flex items-center justify-center">
          <ChefHat className="w-6 h-6 text-[#4a7b47]" />
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
  return (
    <div className="flex h-screen print:h-auto print:min-h-0 bg-background text-foreground overflow-hidden print:overflow-visible">
      <div className="print:hidden h-full flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible bg-background">
        <header className="h-20 bg-transparent flex items-center justify-between px-8 z-10 pt-4 print:hidden">
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:bg-white rounded-lg hover:shadow-sm transition-all md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-border">
               <ChefHat className="w-5 h-5 text-[#4a7b47]" />
               <span className="font-bold text-[#2c332c]">ServeWell</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-border text-sm font-medium text-muted-foreground cursor-pointer hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              May 23, 2024
              <ChevronDown className="w-4 h-4 ml-1" />
            </div>
            <div className="relative cursor-pointer">
              <Bell className="w-6 h-6 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-background">4</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
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
