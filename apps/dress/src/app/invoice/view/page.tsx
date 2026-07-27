"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/config/api';
import { Printer, Share2, Phone, MapPin, Building, Calendar, FileText, CheckCircle, Shirt, Package, Info, Star, QrCode } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetails {
  uuid: string;
  localId?: number;
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

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = Math.round(num)) === 0) return 'Zero';

  const n = ('000000000' + num).substring(num.toString().length > 9 ? 0 : 9 - num.toString().length).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) {
    // Simple fallback
    return num + " Rupees only";
  }
  
  let str = '';
  str += Number(n[1]) != 0 ? (a[Number(n[1])] || b[Number(n[1].toString()[0])] + ' ' + a[Number(n[1].toString()[1])]) + 'Crore ' : '';
  str += Number(n[2]) != 0 ? (a[Number(n[2])] || b[Number(n[2].toString()[0])] + ' ' + a[Number(n[2].toString()[1])]) + 'Lakh ' : '';
  str += Number(n[3]) != 0 ? (a[Number(n[3])] || b[Number(n[3].toString()[0])] + ' ' + a[Number(n[3].toString()[1])]) + 'Thousand ' : '';
  str += Number(n[4]) != 0 ? a[Number(n[4])] + 'Hundred ' : '';
  str += Number(n[5]) != 0 ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5].toString()[0])] + ' ' + a[Number(n[5].toString()[1])]) + 'Rupees ' : 'Rupees ';
  return str + 'only';
}

function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get('uuid');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [store, setStore] = useState({
    name: "Retail Store",
    tagline: "",
    phone: "9876543210",
    gstin: "",
    address: "123 Retail Street, City, State"
  });

  useEffect(() => {
    if (!uuid) return;

    // Fetch synced order details from backend MongoDB
    fetch(`${API_BASE_URL}/api/v1/orders/public/${uuid}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setOrder(res.data);
          
          // Load store details for this business
          fetch(`${API_BASE_URL}/api/v1/restaurants/${res.data.restaurantId}`)
            .then(r => r.json())
            .then(storeRes => {
              if (storeRes.success && storeRes.data) {
                setStore({
                  name: storeRes.data.name || 'Retail Store',
                  tagline: storeRes.data.tagline || '',
                  phone: storeRes.data.phone || '',
                  gstin: storeRes.data.gstin || '',
                  address: storeRes.data.address || ''
                });
              }
            }).catch(e => console.error("Store fetch err", e));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Order fetch err", err);
        setLoading(false);
      });
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-bold text-slate-500">Loading Invoice Details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <FileText className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-extrabold text-slate-800">Invoice Not Found</h2>
        <p className="text-slate-400 max-w-sm text-sm">We couldn&apos;t retrieve this invoice. It may still be syncing or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0">
      
      {/* Floating Action Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white border border-slate-200 shadow-sm p-4 rounded-2xl print:hidden">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
          <CheckCircle className="w-5 h-5" />
          Verified Invoice
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Invoice from ${store.name}`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Receipt URL copied to clipboard!");
              }
            }}
            className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>
        </div>
      </div>

      {/* Main Invoice Document Box */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 w-full text-slate-800 rounded-[2rem] overflow-hidden p-0 shadow-xl print:shadow-none print:border-none print:p-0">
        
          {/* Header Section */}
          <div className="flex relative bg-slate-50 border-b border-slate-200">
             {/* Left Deep Blue area */}
             <div className="bg-[#0b1a30] text-white p-8 pb-10 flex-[0.6] rounded-br-[5rem] flex flex-col justify-center relative z-10">
                 <div className="flex items-center gap-6">
                    <Shirt className="w-16 h-16 text-white stroke-[1.5]" />
                       <h1 className="text-[2.25rem] font-black tracking-widest uppercase leading-none line-clamp-1 max-w-[300px]">{store.name || 'RETAIL STORE'}</h1>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                         <span className="text-blue-300 italic text-xl font-serif line-clamp-1 max-w-[250px]">{store.tagline || 'Premium Quality'}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                       </div>
                    </div>
                 </div>
                 
                 {/* Contact section absolute positioned to the right of the blue area */}
                 <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 text-[10px] text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-800 p-1.5 rounded-full"><Phone className="w-3.5 h-3.5 text-slate-300"/></div>
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-slate-800 p-1.5 rounded-full"><MapPin className="w-3.5 h-3.5 text-slate-300"/></div> 
                      <span className="max-w-[100px] leading-tight">{store.address}</span>
                    </div>
                 </div>
             </div>

             {/* Right White area */}
             <div className="flex-[0.4] bg-slate-50 p-8 flex flex-col justify-center items-start pl-12 relative overflow-hidden">
               {/* Decorative dots in top right */}
               <div className="absolute top-4 right-4 grid grid-cols-4 gap-1 opacity-20">
                 {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>)}
               </div>
               
               <h1 className="text-3xl font-black text-[#0b1a30] tracking-wide mb-6 uppercase">TAX INVOICE</h1>
               <div className="grid grid-cols-2 gap-y-2.5 text-xs font-bold w-full">
                  <span className="text-[#0b1a30]">Invoice No.</span>
                  <span className="text-slate-700 font-mono text-right">#DR{order.localId || 'N/A'}</span>
                  <span className="text-[#0b1a30]">Date</span>
                  <span className="text-slate-700 font-mono text-right">{new Date(order.timestamp).toLocaleDateString()}</span>
               </div>
             </div>
          </div>

          {/* Bill To */}
          <div className="px-8 pt-6 pb-4">
            <span className="text-blue-600 font-bold text-xs block mb-1">Bill To</span>
            <h2 className="text-2xl font-black text-[#0b1a30] uppercase">Walk-in Customer</h2>
          </div>

          {/* Table */}
          <div className="px-8 pb-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
               <table className="w-full text-left text-[11px] border-collapse">
                 <thead>
                   <tr className="bg-[#0b1a30] text-white">
                     <th className="py-3 px-3 text-center border-r border-[#1a2f4c]">#</th>
                     <th className="py-3 px-3 border-r border-[#1a2f4c] whitespace-nowrap"><Shirt className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-slate-300"/> Item Name</th>
                     <th className="py-3 px-3 text-center border-r border-[#1a2f4c]">HSN / SAC</th>
                     <th className="py-3 px-3 text-right border-r border-[#1a2f4c]">MRP (₹)</th>
                     <th className="py-3 px-3 text-center border-r border-[#1a2f4c]">Quantity <Package className="inline w-3.5 h-3.5 ml-1 mb-0.5 text-slate-300"/></th>
                     <th className="py-3 px-3 text-right border-r border-[#1a2f4c]">Price / Unit (₹)</th>
                     <th className="py-3 px-3 text-right border-r border-[#1a2f4c]">Discount (₹)</th>
                     <th className="py-3 px-3 text-right">Amount (₹)</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white">
                    {order.items.map((item, idx) => {
                      const itemSubtotal = item.quantity * item.price;
                      const itemDiscount = 0;
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 font-bold text-slate-700">
                           <td className="py-3 px-3 text-center border-r border-slate-100">{idx + 1}</td>
                           <td className="py-3 px-3 border-r border-slate-100 uppercase">{item.name}</td>
                           <td className="py-3 px-3 border-r border-slate-100"></td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {item.price.toFixed(2)}</td>
                           <td className="py-3 px-3 text-center border-r border-slate-100 font-mono">{item.quantity}</td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {item.price.toFixed(2)}</td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {itemDiscount.toFixed(2)} (0%)</td>
                           <td className="py-3 px-3 text-right font-mono text-slate-800">₹ {itemSubtotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                 </tbody>
                 <tfoot>
                    <tr className="bg-[#eaf3fc] font-bold text-blue-900 border-t border-blue-200">
                       <td colSpan={4} className="py-2.5 px-4 text-left border-r border-blue-200">Total</td>
                       <td className="py-2.5 px-3 text-center font-mono border-r border-blue-200">
                         {order.items.reduce((sum, r) => sum + r.quantity, 0)}
                       </td>
                       <td colSpan={2} className="py-2.5 px-3 text-right font-mono border-r border-blue-200 text-blue-700">₹ {order.discount.toFixed(2)}</td>
                       <td className="py-2.5 px-3 text-right font-mono text-blue-700">₹ {order.total.toFixed(2)}</td>
                    </tr>
                 </tfoot>
               </table>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-8 flex justify-between items-start pb-4">
            {/* Left Info Box */}
            <div className="flex-1 pr-12 space-y-4">
               <div className="flex gap-3 items-start">
                  <div className="bg-blue-600 text-white p-2 rounded-lg shrink-0"><FileText className="w-5 h-5"/></div>
                  <div>
                    <span className="text-[10px] text-blue-700 font-bold block mb-0.5">Invoice Amount In Words</span>
                    <span className="text-[11px] text-slate-700 font-bold italic">{numberToWords(order.total)}</span>
                  </div>
               </div>
               <div className="h-px bg-slate-200 w-full"></div>
               <div className="flex gap-3 items-start">
                  <div className="bg-blue-600 text-white p-2 rounded-full shrink-0"><Info className="w-5 h-5"/></div>
                  <div>
                    <span className="text-[10px] text-blue-700 font-bold block mb-0.5">Terms And Conditions</span>
                    <span className="text-[11px] text-slate-700 font-medium">Thanks for doing business with us!</span>
                  </div>
               </div>

               <div className="pt-2">
                 <p className="text-[10px] font-bold text-slate-800">For : {store.name || 'RETAIL STORE'}</p>
                 <div className="h-10 mt-1 italic text-3xl font-serif text-slate-800 opacity-80 line-clamp-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>{store.name || 'Retail Store'}</div>
                 <div className="h-px bg-slate-400 w-48 mb-1"></div>
                 <p className="text-[10px] font-bold text-slate-800">Authorized Signatory</p>
               </div>
            </div>

            {/* Right Calculations Box */}
            <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-[11px]">
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200">
                 <span className="font-bold text-slate-700">Sub Total</span>
                 <span className="font-mono font-bold">₹ {order.subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200">
                 <span className="font-bold text-slate-700">Discount</span>
                 <span className="font-mono font-bold">₹ {order.discount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 bg-[#1e5eb3] text-white">
                 <span className="font-bold text-sm">Total</span>
                 <span className="font-mono font-bold text-sm">₹ {order.total.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200 bg-white">
                 <span className="font-bold text-slate-700">Received</span>
                 <span className="font-mono font-bold">₹ {order.total.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200 bg-white">
                 <span className="font-bold text-slate-700">Balance</span>
                 <span className="font-mono font-bold">₹ 0.00</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 bg-white">
                 <span className="font-bold text-slate-700">You Saved</span>
                 <span className="font-mono font-bold text-blue-600">₹ {order.discount.toFixed(2)}</span>
               </div>
            </div>
          </div>

          {/* Deep Blue Bottom Banner */}
          <div className="bg-[#0b1a30] text-white p-5 rounded-t-[2.5rem] mt-2 mx-0 flex justify-between items-center px-10 relative overflow-hidden">
            {/* Decorative dots in bottom right */}
            <div className="absolute bottom-4 right-4 grid grid-cols-4 gap-1 opacity-20">
              {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>)}
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="bg-blue-400 text-white p-2.5 rounded-full shadow-lg"><Star className="w-5 h-5 fill-white"/></div>
              <div>
                <p className="text-blue-300 text-[9px] uppercase tracking-wider font-bold">Thank you for your purchase!</p>
                <p className="text-[11px] font-bold">We look forward to serving you again.</p>
              </div>
            </div>
            <div className="flex gap-4 items-center pl-8 border-l border-slate-700/50">
              <div className="bg-blue-400 text-white p-2.5 rounded-full shadow-lg"><Shirt className="w-5 h-5 fill-white"/></div>
              <div>
                <p className="text-blue-300 text-[9px] uppercase tracking-wider font-bold">Trendy Looks</p>
                <p className="text-[11px] font-bold">Better Choices</p>
              </div>
            </div>
            <div className="flex gap-3 items-center bg-white text-slate-800 p-2 rounded-xl shadow-lg relative z-10 ml-8">
              <QrCode className="w-8 h-8"/>
              <div className="text-[9px] font-bold leading-tight pr-2">
                <p className="text-[#1e5eb3]">Scan to Connect</p>
                <p className="text-slate-500">Stay updated with</p>
                <p className="text-slate-500">our latest collections</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default function InvoiceViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <InvoiceViewContent />
    </Suspense>
  );
}
