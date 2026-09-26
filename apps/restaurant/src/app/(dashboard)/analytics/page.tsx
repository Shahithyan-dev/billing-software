"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { IndianRupee, ShoppingBag, Users, Clock, TrendingUp, MoreHorizontal, Calendar, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

const Dashboard = () => {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState('restaurant');
  const [dateFilter, setDateFilter] = useState('Today');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    const rid = localStorage.getItem('restaurantId');
    if (!rid) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders?restaurantId=${rid}`);
      const data = await res.json();
      if (data.success) {
        setAllOrders(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch analytics orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const details = localStorage.getItem('zyncobill_restaurant_details');
    if (details) {
      try {
        const parsed = JSON.parse(details);
        setBusinessType(parsed.businessType || 'restaurant');
      } catch (e) {}
    }
    fetchOrders();
  }, [fetchOrders]);
  
  // Calculate metrics based on dateFilter
  const filteredOrders = allOrders.filter(o => {
      const orderTime = new Date(o.timestamp).getTime();
      const now = new Date();
      
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);
      const startOfWeek = startOfToday - (now.getDay() * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      if (dateFilter === 'Today') return orderTime >= startOfToday;
      if (dateFilter === 'Yesterday') return orderTime >= startOfYesterday && orderTime < startOfToday;
      if (dateFilter === 'This Week') return orderTime >= startOfWeek;
      if (dateFilter === 'This Month') return orderTime >= startOfMonth;
      return true; // All Time
  });
  
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  // Pending in the context of backend might mean orderStatus !== 'completed' if we have KDS, or just hardcode to 0
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
  const activeTables = filteredOrders.filter(o => o.orderType === 'Dine-In' && o.status === 'pending').length;
  const itemsSold = filteredOrders.reduce((sum, order) => sum + (order.items?.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 0), 0);

  // Compute Sales Data for chart
  const salesDataMap = new Map();
  filteredOrders.forEach(o => {
    if (dateFilter === 'Today' || dateFilter === 'Yesterday') {
      const hour = new Date(o.timestamp).getHours();
      const timeStr = hour > 12 ? `${hour-12} PM` : hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : `${hour} AM`;
      salesDataMap.set(timeStr, (salesDataMap.get(timeStr) || 0) + (o.total || 0));
    } else {
      // Group by date for week/month/all time
      const dateStr = new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesDataMap.set(dateStr, (salesDataMap.get(dateStr) || 0) + (o.total || 0));
    }
  });
  const salesData = Array.from(salesDataMap.entries())
    .map(([time, sales]) => ({ time, sales }))
    .reverse(); 

  // Compute Top Items (Filtered)
  const itemMap = new Map();
  filteredOrders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      const existing = itemMap.get(item.name) || { qty: 0, rev: 0 };
      itemMap.set(item.name, {
        qty: existing.qty + item.quantity,
        rev: existing.rev + (item.quantity * item.price)
      });
    });
  });
  
  const topItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({ 
      name, 
      qty: data.qty, 
      rev: `₹${data.rev.toFixed(2)}`, 
      img: `https://placehold.co/400x300/e2e8f0/64748b?text=${businessType === 'restaurant' ? 'Food' : 'Item'}`
    }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  // Compute Order Status (Filtered)
  let orderStatusData = [
    { name: 'Completed', value: filteredOrders.filter(o => o.status === 'completed' || !o.status).length, color: '#10b981' },
    { name: 'Pending', value: filteredOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Cancelled', value: filteredOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ].filter(d => d.value > 0);
  
  if (orderStatusData.length === 0) {
    orderStatusData = [{ name: 'No Orders', value: 1, color: '#e2e8f0' }];
  }

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      <header className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#2c332c] flex items-center gap-2">
            {getGreeting()}, Admin <span className="text-2xl">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Here's what's happening {dateFilter.toLowerCase()}</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className="flex items-center gap-2 bg-white border border-[#e3e3df] hover:border-[#4a7b47] hover:shadow-md rounded-xl px-4 py-2.5 text-sm font-bold text-[#2c332c] shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-[#4a7b47]" />
            {dateFilter}
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDateDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDateDropdownOpen(false)}
              ></div>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#e3e3df] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {['Today', 'Yesterday', 'This Week', 'This Month', 'All Time'].map((option) => (
                  <button
                    key={option}
                    onClick={() => { setDateFilter(option); setIsDateDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-[#e3e3df]/50 last:border-0 ${dateFilter === option ? 'bg-amber-50 text-amber-700' : 'text-[#2c332c] hover:bg-slate-50 hover:text-[#4a7b47]'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Sales", value: `₹${totalSales.toLocaleString()}`, trend: "Live", icon: IndianRupee, color: "text-green-600", bg: "bg-green-100", up: true },
          { title: "Total Orders", value: totalOrdersCount.toString(), trend: dateFilter, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100", up: true },
          businessType === 'restaurant' 
            ? { title: "Pending Orders", value: pendingOrders.toString(), trend: "Kitchen", icon: Clock, color: "text-orange-600", bg: "bg-orange-100", up: false }
            : { title: "Items Sold", value: itemsSold.toString(), trend: dateFilter, icon: ShoppingBag, color: "text-indigo-600", bg: "bg-indigo-100", up: true },
          { title: "Total Items", value: Array.from(itemMap.keys()).length.toString(), trend: "Unique", icon: Users, color: "text-purple-600", bg: "bg-purple-100", up: true },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-[#e3e3df] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
               <div className={`p-3 rounded-xl ${kpi.bg}`}>
                 <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
               </div>
               <div>
                 <p className="text-sm font-bold text-muted-foreground">{kpi.title}</p>
                 <p className="text-2xl font-black text-[#2c332c]">{kpi.value}</p>
               </div>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
               {kpi.up ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
               <span className="text-muted-foreground font-medium ml-1">{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Area Chart */}
        <div className="lg:col-span-2 bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#2c332c]">Sales Overview</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a7b47" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4a7b47" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e3df" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7269', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7269', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#2c332c', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4a7b47" strokeWidth={4} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#2c332c]">Top Selling Items</h3>
            <a href="#" className="text-sm font-bold text-[#4a7b47]">View All</a>
          </div>
          <div className="space-y-4">
            {topItems.length > 0 ? topItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#2c332c]">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.qty} Orders</p>
                </div>
                <div className="text-sm font-black text-[#2c332c]">{item.rev}</div>
              </div>
            )) : <p className="text-muted-foreground text-sm py-4">No items sold yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <div className={`bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-sm flex flex-col ${businessType === 'restaurant' ? '' : 'lg:col-span-3'}`}>
           <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-[#2c332c]">Order Status</h3>
            <a href="#" className="text-sm font-bold text-[#4a7b47]">View All</a>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="w-32 h-32 relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusData} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-black text-[#2c332c]">{filteredOrders.length}</span>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Orders</span>
               </div>
            </div>
            <div className="space-y-2">
              {orderStatusData.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="font-medium text-[#2c332c] w-20">{s.name}</span>
                  <span className="font-bold text-muted-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Tables Grid */}
        {businessType === 'restaurant' && (
          <div className="lg:col-span-2 bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#2c332c]">Active Tables</h3>
              <a href="#" className="text-sm font-bold text-[#4a7b47]">View All</a>
            </div>
            <div className="grid grid-cols-4 gap-3">
               {[
                 { t: 'T1', s: 'Occupied', g: 3, c: 'bg-green-100 text-green-700 border-green-200' },
                 { t: 'T2', s: 'Empty', g: 0, c: 'bg-gray-50 text-gray-400 border-gray-200' },
                 { t: 'T3', s: 'Reserved', g: 4, c: 'bg-orange-100 text-orange-700 border-orange-200' },
                 { t: 'T4', s: 'Occupied', g: 2, c: 'bg-green-100 text-green-700 border-green-200' },
                 { t: 'T5', s: 'Occupied', g: 5, c: 'bg-green-100 text-green-700 border-green-200' },
                 { t: 'T6', s: 'Empty', g: 0, c: 'bg-gray-50 text-gray-400 border-gray-200' },
                 { t: 'T7', s: 'Empty', g: 0, c: 'bg-gray-50 text-gray-400 border-gray-200' },
                 { t: 'T8', s: 'Occupied', g: 1, c: 'bg-green-100 text-green-700 border-green-200' },
               ].map(t => (
                  <div key={t.t} className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1 ${t.c}`}>
                    <span className="font-bold">{t.t}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">{t.g > 0 ? `${t.g} Guests` : t.s}</span>
                  </div>
               ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white border border-[#e3e3df] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#2c332c]">Recent Orders</h3>
            <a href="#" className="text-sm font-bold text-[#4a7b47]">View All</a>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase font-bold border-b border-[#e3e3df]">
              <tr>
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Time</th>
                <th className="pb-3 font-bold">Items</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((row, i) => (
                <tr key={row._id} className="border-b border-[#e3e3df] last:border-0">
                  <td className="py-4 font-bold text-[#2c332c]">{(row.uuid || '').split('-')[0].toUpperCase()}</td>
                  <td className="py-4 text-[#2c332c] font-medium">{new Date(row.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                  <td className="py-4 text-muted-foreground">{row.items?.length || 0} items</td>
                  <td className="py-4 font-bold text-[#2c332c]">₹{(row.total || 0).toFixed(2)}</td>
                  <td className="py-4 text-muted-foreground">{row.orderType}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'pending' ? 'text-orange-500 bg-orange-100' : 'text-green-500 bg-green-100'}`}>
                      {row.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                  <tr>
                      <td colSpan={6} className="text-center py-6 text-muted-foreground">No orders found.</td>
                  </tr>
              )}
            </tbody>
          </table>
      </div>

    </div>
  );
};

export default Dashboard;
