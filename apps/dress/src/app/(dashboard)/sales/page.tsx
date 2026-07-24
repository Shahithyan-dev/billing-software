"use client";

import React, { useState } from 'react';
import { db, Order } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  FileText, 
  Search, 
  Trash2, 
  Smartphone, 
  Calendar, 
  CreditCard, 
  Banknote, 
  Smartphone as UpiIcon, 
  Eye, 
  X 
} from 'lucide-react';

export default function SalesPage() {
  const orders = useLiveQuery(() => db.orders.orderBy('timestamp').reverse().toArray()) || [];
  const menuItems = useLiveQuery(() => db.menuItems.toArray()) || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    // Search by local ID or items
    const matchesSearch = o.id?.toString().includes(searchQuery) || 
                          o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleDeleteOrder = async (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await db.orders.delete(id);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
    }
  };

  const getWhatsAppLink = (order: Order) => {
    let text = `*INVOICE: Invoice #${order.id || 'N/A'}*\n`;
    text += `--------------------------------\n`;
    text += `Date: ${new Date(order.timestamp).toLocaleDateString()}\n`;
    text += `--------------------------------\n`;
    
    order.items.forEach(item => {
      text += `${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    text += `--------------------------------\n`;
    text += `Subtotal: ₹${order.subtotal.toFixed(2)}\n`;
    if (order.discount > 0) text += `Discount: -₹${order.discount.toFixed(2)}\n`;
    text += `GST (5%): ₹${order.tax.toFixed(2)}\n`;
    text += `*GRAND TOTAL: ₹${order.total.toFixed(2)}*\n`;
    text += `--------------------------------\n`;
    text += `Payment Mode: ${order.paymentMethod}\n`;
    text += `\nThank you for shopping with us!`;
    
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const totalSalesVolume = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Title Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sale Invoices</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Review retail sales transactions and dispatch WhatsApp receipts</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-right">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Total Sales (Offline)</span>
          <h3 className="text-2xl font-black text-amber-600">₹ {totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          {['ALL', 'CASH', 'CARD', 'UPI'].map(method => (
            <button
              key={method}
              onClick={() => setPaymentFilter(method)}
              className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${paymentFilter === method ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {method}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice no, item..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Main Content Layout */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No invoices found</h3>
          <p className="text-slate-400 text-sm mt-1">Complete checkouts on the POS screen to log transactions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoices List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center ${selectedOrder?.id === order.id ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200'}`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-500 shrink-0">
                    <FileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Invoice #DR{order.id}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {order.paymentMethod === 'CASH' && <Banknote className="w-3 h-3 text-emerald-500" />}
                        {order.paymentMethod === 'CARD' && <CreditCard className="w-3 h-3 text-blue-500" />}
                        {order.paymentMethod === 'UPI' && <UpiIcon className="w-3 h-3 text-purple-500" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grand Total</span>
                    <span className="font-black text-slate-800 text-sm">₹ {order.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={getWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl border border-transparent transition-colors"
                      title="Resend WhatsApp Receipt"
                    >
                      <Smartphone className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => order.id && handleDeleteOrder(order.id)}
                      className="p-2 hover:bg-amber-50 text-slate-300 hover:text-amber-600 rounded-xl border border-transparent transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Sidebar Panel */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm sticky top-[100px]">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg">Invoice Details</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items Summary Table */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase mb-3">
                      <span>Item Description</span>
                      <div className="flex gap-8">
                        <span>Qty</span>
                        <span>Amount</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-700 font-bold">
                          <span className="line-clamp-1">{item.name}</span>
                          <div className="flex gap-10 shrink-0">
                            <span className="text-slate-400 font-mono w-4 text-center">{item.quantity}</span>
                            <span className="font-mono">₹ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 text-xs font-semibold text-slate-500 px-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-slate-800 font-mono">₹ {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span className="font-mono">- ₹ {selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span>GST (5%)</span>
                      <span className="text-slate-800 font-mono">₹ {selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-800 pt-2">
                      <span>Grand Total</span>
                      <span className="text-amber-600 font-mono">₹ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                    
                    {(() => {
                      const cost = selectedOrder.items.reduce((sum, item) => {
                        const invItem = menuItems.find(mi => mi.name === item.name);
                        return sum + ((invItem?.purchasePrice || 0) * item.quantity);
                      }, 0);
                      const revenue = selectedOrder.subtotal - selectedOrder.discount;
                      const profit = revenue - cost;
                      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                      return (
                        <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                          <div className="flex justify-between font-bold text-slate-500 mb-1">
                            <span>Estimated Cost</span>
                            <span className="font-mono">₹ {cost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Est. Profit Margin</span>
                            <span className={`font-mono font-black ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              ₹ {profit.toFixed(2)} <span className="text-[10px] bg-emerald-50 px-1 rounded ml-1">{margin.toFixed(1)}%</span>
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  <a
                    href={getWhatsAppLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" /> Resend WhatsApp Bill
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-[2rem] p-12 text-center h-[260px] flex flex-col items-center justify-center text-slate-400">
                <Eye className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Select an invoice to view breakdowns</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
