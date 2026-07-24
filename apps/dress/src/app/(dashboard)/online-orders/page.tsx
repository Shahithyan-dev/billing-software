"use client";

import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Search, LayoutGrid, Phone, User, Check, X } from 'lucide-react';

type Platform = 'swiggy' | 'zomato' | 'dineout' | 'all';
type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered';

interface OnlineOrder {
  id: string;
  platform: 'swiggy' | 'zomato' | 'dineout';
  customerName: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  time: string;
}

const mockOrders: OnlineOrder[] = [
  {
    id: '#SWG-8921',
    platform: 'swiggy',
    customerName: 'Rahul Kumar',
    phone: '+91 9876543210',
    items: [{ name: 'Paneer Butter Masala', qty: 1, price: 280 }, { name: 'Garlic Naan', qty: 3, price: 180 }],
    total: 460,
    status: 'new',
    time: '10:30 AM'
  },
  {
    id: '#ZOM-4432',
    platform: 'zomato',
    customerName: 'Priya Sharma',
    phone: '+91 8765432109',
    items: [{ name: 'Chicken Biryani', qty: 2, price: 640 }],
    total: 640,
    status: 'preparing',
    time: '10:15 AM'
  },
  {
    id: '#DIN-1109',
    platform: 'dineout',
    customerName: 'Amit Patel',
    phone: '+91 7654321098',
    items: [{ name: 'Veg Thali', qty: 1, price: 220 }],
    total: 220,
    status: 'ready',
    time: '09:55 AM'
  }
];

export default function OnlineOrdersPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>('all');
  const [orders, setOrders] = useState<OnlineOrder[]>(mockOrders);

  const filteredOrders = activePlatform === 'all' 
    ? orders 
    : orders.filter(o => o.platform === activePlatform);

  const newOrders = filteredOrders.filter(o => o.status === 'new');
  const activeOrders = filteredOrders.filter(o => ['preparing', 'ready'].includes(o.status));
  const pastOrders = filteredOrders.filter(o => o.status === 'delivered');

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const platformColors = {
    swiggy: 'bg-orange-500',
    zomato: 'bg-red-500',
    dineout: 'bg-blue-500'
  };

  const OrderCard = ({ order }: { order: OnlineOrder }) => (
    <div className="bg-white rounded-2xl p-4 border border-[#e8e8e4] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold text-white uppercase ${platformColors[order.platform]}`}>
              {order.platform}
            </span>
            <span className="font-bold text-[#1a2318]">{order.id}</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {order.time}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-lg text-[#4a7b47]">₹{order.total}</p>
          <span className="text-xs font-bold text-gray-500 uppercase">{order.items.length} items</span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-bold text-[#1a2318] flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" /> {order.customerName}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
          <Phone className="w-4 h-4 text-gray-400" /> {order.phone}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{item.qty}x {item.name}</span>
            <span className="font-bold text-[#1a2318]">₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>

      {order.status === 'new' && (
        <div className="flex gap-2">
          <button 
            onClick={() => updateStatus(order.id, 'preparing')}
            className="flex-1 bg-[#4a7b47] hover:bg-[#3d663b] text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
          <button 
            className="px-4 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {order.status === 'preparing' && (
        <button 
          onClick={() => updateStatus(order.id, 'ready')}
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 rounded-xl font-bold transition-colors"
        >
          Mark as Food Ready
        </button>
      )}

      {order.status === 'ready' && (
        <button 
          onClick={() => updateStatus(order.id, 'delivered')}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-bold transition-colors"
        >
          Handed to Rider
        </button>
      )}
    </div>
  );

  return (
    <div className="p-6 h-full flex flex-col bg-[#f9f9f9]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#1a2318]">Online Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage orders from all aggregators in one place.</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-[#e8e8e4] p-1 shadow-sm">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'swiggy', label: 'Swiggy' },
            { id: 'zomato', label: 'Zomato' },
            { id: 'dineout', label: 'Dineout' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id as Platform)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activePlatform === tab.id 
                  ? 'bg-[#4a7b47] text-white shadow' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
        <LayoutGrid className="w-4 h-4" />
        This is a simulated UI. To receive real orders, you will need to enter your API credentials from Swiggy, Zomato, and Dineout in the Settings page.
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        
        {/* New Orders Column */}
        <div className="flex-1 min-w-[320px] bg-white rounded-2xl p-4 border border-[#e8e8e4] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="font-black text-lg flex items-center gap-2 text-[#1a2318]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> New Orders
            </h2>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold">{newOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {newOrders.map(o => <OrderCard key={o.id} order={o} />)}
            {newOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-10 font-medium">No new orders</p>}
          </div>
        </div>

        {/* Active/Preparing Column */}
        <div className="flex-1 min-w-[320px] bg-white rounded-2xl p-4 border border-[#e8e8e4] flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="font-black text-lg flex items-center gap-2 text-[#1a2318]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span> Preparing
            </h2>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold">{activeOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
            {activeOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-10 font-medium">No active orders</p>}
          </div>
        </div>

        {/* Delivered Column */}
        <div className="flex-1 min-w-[320px] bg-white rounded-2xl p-4 border border-[#e8e8e4] flex flex-col opacity-75 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <h2 className="font-black text-lg flex items-center gap-2 text-[#1a2318]">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Completed
            </h2>
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs font-bold">{pastOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {pastOrders.map(o => <OrderCard key={o.id} order={o} />)}
            {pastOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-10 font-medium">No completed orders today</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
