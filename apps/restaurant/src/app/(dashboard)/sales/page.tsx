"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
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
  X,
  RefreshCw,
  Printer
} from 'lucide-react';
import { printInvoice, InvoiceData } from '@/utils/printEngine';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  uuid: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  orderType: string;
  timestamp: number;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.uuid?.includes(searchQuery) ||
      o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const handleDeleteOrder = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/${uuid}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.uuid !== uuid));
        if (selectedOrder?.uuid === uuid) setSelectedOrder(null);
      }
    } catch (e) {
      alert('Failed to delete invoice');
    }
  };

  const getWhatsAppLink = (order: Order) => {
    let text = `*INVOICE: ${order.uuid?.slice(-8).toUpperCase() || 'N/A'}*\n`;
    text += `--------------------------------\n`;
    text += `Date: ${new Date(order.timestamp).toLocaleDateString()}\n`;
    text += `--------------------------------\n`;
    order.items.forEach(item => {
      text += `${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    text += `--------------------------------\n`;
    text += `Subtotal: ₹${order.subtotal.toFixed(2)}\n`;
    if (order.discount > 0) text += `Discount: -₹${order.discount.toFixed(2)}\n`;
    text += `GST: ₹${order.tax.toFixed(2)}\n`;
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
          <p className="text-slate-500 text-sm font-medium mt-1">All sales saved to cloud — accessible from any device</p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-right">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Total Sales</span>
            <h3 className="text-2xl font-black text-amber-600">₹ {totalSalesVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          {['ALL', 'CASH', 'CARD', 'UPI', 'CREDIT'].map(method => (
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
            placeholder="Search invoice, item name..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-sm focus:outline-none transition-all font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-16 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading invoices from cloud...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
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
            {filteredOrders.map((order, index) => (
              <div
                key={order.uuid}
                onClick={() => setSelectedOrder(order)}
                className={`p-5 bg-white border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center ${selectedOrder?.uuid === order.uuid ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-slate-200'}`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-500 shrink-0">
                    <FileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Invoice #{orders.length - index}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.timestamp).toLocaleDateString('en-IN')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {order.paymentMethod === 'CASH' && <Banknote className="w-3 h-3 text-emerald-500" />}
                        {order.paymentMethod === 'CARD' && <CreditCard className="w-3 h-3 text-blue-500" />}
                        {order.paymentMethod === 'UPI' && <UpiIcon className="w-3 h-3 text-purple-500" />}
                        {order.paymentMethod}
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
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
                      onClick={() => handleDeleteOrder(order.uuid)}
                      className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl border border-transparent transition-colors"
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
                      <span>GST</span>
                      <span className="text-slate-800 font-mono">₹ {selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-800 pt-2">
                      <span>Grand Total</span>
                      <span className="text-amber-600 font-mono">₹ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        const restaurantDetails = JSON.parse(localStorage.getItem('zyncobill_restaurant_details') || '{}');
                        const invoiceData: InvoiceData = {
                          businessName: restaurantDetails.name || 'ZyncoBill Business',
                          address: restaurantDetails.address || '',
                          phone: restaurantDetails.phone || '',
                          gstin: restaurantDetails.gstin || '',
                          invoiceNo: selectedOrder.uuid.slice(-8).toUpperCase(),
                          date: new Date(selectedOrder.timestamp).toLocaleDateString(),
                          items: selectedOrder.items.map(i => ({ name: i.name, qty: i.quantity, price: i.price, total: i.price * i.quantity })),
                          subtotal: selectedOrder.subtotal,
                          tax: selectedOrder.tax,
                          discount: selectedOrder.discount,
                          total: selectedOrder.total
                        };
                        printInvoice(invoiceData);
                      }}
                      className="w-full py-3 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-[#1e3a8a]/20 transform hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Print Invoice
                    </button>
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
