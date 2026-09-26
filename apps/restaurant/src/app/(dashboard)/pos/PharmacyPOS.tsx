"use client";

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '@/config/api';
import { 
  Plus, Trash2, Smartphone, Printer, Save, Search, 
  X, CreditCard, Banknote, Smartphone as UpiIcon, 
  Activity, ArrowRight
} from 'lucide-react';
import { MenuItem } from './StandardPOS';

interface BillingRow {
  id: string;
  itemId?: string;
  name: string;
  batch: string;
  expiry: string;
  mrp: number;
  qty: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export default function PharmacyPOS() {
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [restaurantData, setRestaurantData] = useState({
    name: "Zynco Pharmacy",
    phone: "",
    businessType: "pharmacy",
    whatsappToken: "",
    whatsappBusinessId: "",
    whatsappNumber: "",
  });

  const [toastMessage, setToastMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(11500);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  useEffect(() => {
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyncobill_restaurant_details');
      if (stored) {
        setRestaurantData(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    }
  }, []);

  useEffect(() => {
    const fetchMenuAndOrders = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (rid) {
        try {
          const invRes = await fetch(`${API_BASE_URL}/api/v1/menu/${rid}`);
          const invData = await invRes.json();
          if (invData.success) {
            setDbMenuItems(invData.data || []);
          }

          const res = await fetch(`${API_BASE_URL}/api/v1/orders?restaurantId=${rid}`);
          const data = await res.json();
          if (data.success) {
            setInvoiceNo(11500 + (data.data.length || 0) + 1);
          }
        } catch (e) {
          console.error('Failed to fetch data:', e);
        }
      }
    };
    fetchMenuAndOrders();
  }, []);

  const [rows, setRows] = useState<BillingRow[]>([]);

  const handleAddToCart = (item: MenuItem) => {
    // If the item has variants (batches), grab the first one as default
    const defaultBatch = (item.variants && item.variants.length > 0) ? item.variants[0].batchNo || '--' : item.batchNo || '--';
    const defaultExpiry = (item.variants && item.variants.length > 0) ? item.variants[0].expiryDate || '--' : item.expiryDate || '--';

    const existingIndex = rows.findIndex(r => r.itemId === item.id);
    if (existingIndex >= 0) {
      const updated = [...rows];
      updated[existingIndex].qty += 1;
      
      const r = updated[existingIndex];
      const sub = r.qty * r.mrp;
      const discAmount = sub * (r.discountPercent / 100);
      const taxedBase = sub - discAmount;
      const taxAmount = taxedBase * (r.taxPercent / 100);
      r.total = taxedBase + taxAmount;
      
      setRows(updated);
    } else {
      const newRow: BillingRow = {
        id: crypto.randomUUID(),
        itemId: item.id,
        name: item.name,
        batch: defaultBatch,
        expiry: defaultExpiry,
        mrp: item.price,
        qty: 1,
        discountPercent: 0,
        taxPercent: item.gstPercent || 0,
        total: item.price * (1 + (item.gstPercent || 0) / 100)
      };
      setRows([newRow, ...rows]);
    }
  };

  const updateCartItem = (id: string, field: keyof BillingRow, value: any) => {
    const updated = rows.map(r => {
      if (r.id === id) {
        const newRow = { ...r, [field]: value };
        const sub = newRow.qty * newRow.mrp;
        const discAmount = sub * (newRow.discountPercent / 100);
        const taxedBase = sub - discAmount;
        const taxAmount = taxedBase * (newRow.taxPercent / 100);
        newRow.total = taxedBase + taxAmount;
        return newRow;
      }
      return r;
    });
    setRows(updated);
  };

  const removeCartItem = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const subtotal = rows.reduce((sum, r) => sum + (r.qty * r.mrp), 0);
  const totalDiscount = rows.reduce((sum, r) => sum + ((r.qty * r.mrp) * (r.discountPercent / 100)), 0);
  const taxableValue = subtotal - totalDiscount;
  const totalTax = rows.reduce((sum, r) => {
    const rowBase = (r.qty * r.mrp) - ((r.qty * r.mrp) * (r.discountPercent / 100));
    return sum + (rowBase * (r.taxPercent / 100));
  }, 0);
  
  const rawTotal = taxableValue + totalTax;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  const handleSaveOrder = async () => {
    if (rows.length === 0) {
      alert("Please add at least one item.");
      return false;
    }
    const restaurantId = localStorage.getItem('restaurantId') || 'default';
    const orderData = {
      uuid: crypto.randomUUID(),
      restaurantId,
      items: rows.map(r => ({
        id: r.itemId || 'custom',
        name: `${r.name} (Batch: ${r.batch})`,
        price: r.mrp,
        quantity: r.qty
      })),
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      acCharge: 0,
      total: grandTotal,
      paymentMethod: paymentMethod,
      orderType: 'Pharmacy Invoice',
      timestamp: Date.now(),
      customerName,
      customerPhone,
      doctorName
    };

    try {
      const orderRes = await fetch(`${API_BASE_URL}/api/v1/sync/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!orderRes.ok) throw new Error('Failed to save order');

      setInvoiceNo(prev => prev + 1);
      setRows([]);
      setCustomerName('');
      setCustomerPhone('');
      setDoctorName('');
      setSearchQuery('');
      setToastMessage("Bill Saved Successfully!");
      setTimeout(() => setToastMessage(''), 3000);
      return true;
    } catch (err) {
      alert("Failed to save invoice.");
      return false;
    }
  };

  const handlePrintAndSave = async () => {
    const saved = await handleSaveOrder();
    if (saved) {
      window.print();
    }
  };

  return (
    <>
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative pb-10 print:hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-teal-900/95 backdrop-blur-md text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl z-[9999] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Compact Info */}
      <div className="bg-[#0f172a] text-white p-3 px-6 shadow-sm flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-teal-400" />
          <div>
            <h2 className="text-base font-black uppercase tracking-wider leading-none">{restaurantData.name}</h2>
            <span className="text-[10px] text-teal-400 font-bold tracking-widest">PHARMACY BILLING DESK</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Inv No</span>
            <span className="text-white font-black text-sm">#DR{invoiceNo}</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Patient Name</span>
            <input 
              type="text" placeholder="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none placeholder:text-slate-500 text-sm w-28"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Mobile</span>
            <input 
              type="text" placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none placeholder:text-slate-500 text-sm w-24"
            />
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex flex-col">
            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Doctor Name</span>
            <input 
              type="text" placeholder="Dr. Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none placeholder:text-slate-500 text-sm w-32"
            />
          </div>
        </div>
      </div>

      {/* SEARCH BAR (Barcode Focused) */}
      <div className="bg-white p-4 border-b border-gray-200 shrink-0 shadow-sm relative z-20">
        <div className="max-w-4xl mx-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Scan Barcode or Search by Medicine Name / Composition (Press Enter)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-teal-50/30 border-2 border-teal-100 rounded-xl text-base font-medium focus:outline-none focus:border-teal-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 shadow-inner"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim() !== '') {
                const match = dbMenuItems.find(item => 
                  (item.barcode && item.barcode.toLowerCase() === searchQuery.toLowerCase()) || 
                  item.name.toLowerCase() === searchQuery.toLowerCase() ||
                  (item.variants && item.variants.some(v => v.batchNo && v.batchNo.toLowerCase() === searchQuery.toLowerCase()))
                );
                if (match) {
                  handleAddToCart(match);
                  setSearchQuery('');
                } else {
                  const partialMatches = dbMenuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
                  if (partialMatches.length === 1) {
                     handleAddToCart(partialMatches[0]);
                     setSearchQuery('');
                  }
                }
              }
            }}
          />
          
          {/* Autocomplete Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-teal-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
              {dbMenuItems.filter(item => {
                  const searchLower = searchQuery.toLowerCase();
                  return item.name.toLowerCase().includes(searchLower) || 
                         (item.genericName && item.genericName.toLowerCase().includes(searchLower)) ||
                         (item.variants && item.variants.some(v => v.batchNo && v.batchNo.toLowerCase().includes(searchLower)));
              }).map(item => (
                <div 
                  key={item.id} 
                  className="p-3 border-b border-gray-50 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors"
                  onClick={() => { handleAddToCart(item); setSearchQuery(''); }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    {item.genericName && <span className="text-xs text-teal-600/80">{item.genericName}</span>}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-black text-teal-600">₹{item.price}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Stock: {item.stock || '10+'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DENSE TABULAR BILLING GRID */}
      <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 bg-slate-800 text-white p-3 text-[10px] font-bold uppercase tracking-wider shrink-0 rounded-t-xl">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Item Name</div>
            <div className="col-span-2">Batch / Exp</div>
            <div className="col-span-1 text-center">Qty</div>
            <div className="col-span-1 text-right">MRP</div>
            <div className="col-span-1 text-right">Disc%</div>
            <div className="col-span-1 text-right">GST%</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1 text-center">Act</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 opacity-50">
                <Search className="w-12 h-12 text-teal-200" />
                <p className="text-sm font-semibold">Scan barcode to add medicines</p>
              </div>
            ) : (
              rows.map((row, index) => (
                <div key={row.id} className={`grid grid-cols-12 gap-2 items-center p-2 border-b border-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-teal-50/30`}>
                  <div className="col-span-1 text-center text-xs font-bold text-gray-400">{index + 1}</div>
                  
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{row.name}</p>
                  </div>
                  
                  <div className="col-span-2 flex flex-col gap-1">
                    <input type="text" value={row.batch} onChange={(e) => updateCartItem(row.id, 'batch', e.target.value)} className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 text-xs font-mono px-1 py-0.5 outline-none" placeholder="Batch" />
                    <input type="text" value={row.expiry} onChange={(e) => updateCartItem(row.id, 'expiry', e.target.value)} className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 text-[10px] text-gray-500 font-mono px-1 outline-none" placeholder="MM/YY" />
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <input type="number" value={row.qty} onChange={(e) => updateCartItem(row.id, 'qty', parseInt(e.target.value) || 1)} className="w-12 text-center border border-gray-200 rounded bg-white text-sm font-bold py-1 focus:border-teal-400 outline-none" min="1" />
                  </div>
                  
                  <div className="col-span-1">
                    <input type="number" value={row.mrp} onChange={(e) => updateCartItem(row.id, 'mrp', parseFloat(e.target.value) || 0)} className="w-full text-right bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 text-sm font-mono px-1 outline-none" />
                  </div>

                  <div className="col-span-1">
                    <input type="number" value={row.discountPercent === 0 ? '' : row.discountPercent} onChange={(e) => updateCartItem(row.id, 'discountPercent', parseFloat(e.target.value) || 0)} placeholder="0" className="w-full text-right bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 text-sm font-mono px-1 outline-none text-emerald-600" />
                  </div>

                  <div className="col-span-1">
                    <select value={row.taxPercent} onChange={(e) => updateCartItem(row.id, 'taxPercent', parseInt(e.target.value) || 0)} className="w-full text-right bg-transparent border-b border-dashed border-gray-300 focus:border-teal-500 text-xs font-mono px-1 outline-none cursor-pointer">
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                    </select>
                  </div>

                  <div className="col-span-1 text-right font-black text-teal-700 font-mono text-sm">
                    {row.total.toFixed(2)}
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeCartItem(row.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER TOTALS & ACTIONS */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex gap-8 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub Total</span>
              <span className="font-mono font-bold text-gray-800 text-base">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Discount</span>
              <span className="font-mono font-bold text-emerald-500 text-base">-₹{totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GST Tax</span>
              <span className="font-mono font-bold text-gray-800 text-base">₹{totalTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end bg-teal-50/50 px-4 py-1 rounded-xl border border-teal-100">
              <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Net Amount</span>
              <span className="font-mono font-black text-teal-700 text-3xl">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {['CASH', 'CARD', 'UPI'].map(method => (
                  <button 
                    key={method} onClick={() => setPaymentMethod(method)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${paymentMethod === method ? 'bg-teal-500 text-white border-teal-500 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveOrder} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={handlePrintAndSave} className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/30">
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* Hidden Invoice Template for Image Generation */}
      <style>{`
        @media print {
          @page { size: 100mm auto; margin: 0mm; }
          body { margin: 0; padding: 0; background-color: white; }
        }
      `}</style>
      <div className="absolute top-[-9999px] left-[-9999px] print:static print:top-0 print:left-0 print:flex print:justify-center print:w-full">
        {/* 4-Inch Printer Layout (Green Pre-printed Style) */}
        <div 
          className="mx-auto bg-white text-emerald-950 font-sans text-[11px] leading-tight w-[100mm] print:w-[100mm] hidden print:block pt-2"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start text-[9px] border-b-2 border-emerald-600 pb-1 mb-2 font-bold text-emerald-800">
              <div>TIN : {(restaurantData as any).gstin || '29680889922'}</div>
              <div className="text-center w-1/3">
                TAX INVOICE<br/>
                <span className="text-xs">⚕️ 💊 ⚕️</span>
              </div>
              <div className="text-right">
                ORIGINAL<br/>
                DL No. : {(restaurantData as any).dlNo || 'KA/BNG/111/21/178'}
              </div>
            </div>
            
            <div className="text-center mb-3 text-emerald-700">
              <h1 className="font-bold text-sm tracking-wide uppercase">{restaurantData.name}</h1>
              <p className="text-[9px] mt-0.5 uppercase text-emerald-900">{(restaurantData as any).address || (restaurantData as any).tagline || '# 128, 1st Cross, B.T.M. Layout, Bangalore - 560 076'}</p>
              <p className="text-[9px] text-emerald-900">Phone : {restaurantData.phone || '41209520'}</p>
            </div>

            <div className="border-t-2 border-emerald-600 pt-1 mb-1 text-[9px] flex justify-between font-bold text-emerald-900">
              <div className="w-[60%]">
                <div className="flex mb-1"><span className="w-20 uppercase">PATIENT NAME</span><span>: {customerName ? customerName.toUpperCase() : ''}</span></div>
                <div className="flex"><span className="w-20 uppercase">DOCTOR NAME</span><span>: {doctorName ? doctorName.toUpperCase() : ''}</span></div>
              </div>
              <div className="w-[40%]">
                <div className="flex mb-1"><span className="w-12 uppercase">Bill No.</span><span>: DR{invoiceNo}</span></div>
                <div className="flex"><span className="w-12 uppercase">Date</span><span>: {new Date().toLocaleDateString('en-GB')}</span></div>
              </div>
            </div>
            
            <table className="w-full text-[9px] text-left border-collapse mb-1">
              <thead>
                <tr className="bg-emerald-600 text-white uppercase text-[8px]">
                  <th className="font-bold py-1 border-r border-white w-6 text-center">SL.</th>
                  <th className="font-bold py-1 border-r border-white w-8 text-center">QTY.</th>
                  <th className="font-bold py-1 border-r border-white px-1">DESCRIPTION</th>
                  <th className="font-bold py-1 border-r border-white px-1 w-10 text-center">Mfg.</th>
                  <th className="font-bold py-1 border-r border-white px-1 w-10 text-center">BATCH No.</th>
                  <th className="font-bold py-1 border-r border-white px-1 w-10 text-center">EXP.</th>
                  <th className="font-bold py-1 border-r border-white px-1 w-10 text-right">RATE</th>
                  <th className="font-bold py-1 px-1 w-12 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item, index) => (
                  <tr key={index} className="align-top border-b border-emerald-200">
                    <td className="py-1 border-r border-emerald-200 text-center">{index + 1}</td>
                    <td className="py-1 border-r border-emerald-200 text-center font-bold">{item.qty}</td>
                    <td className="py-1 border-r border-emerald-200 px-1 leading-tight font-bold">{item.name}</td>
                    <td className="py-1 border-r border-emerald-200 px-1 text-center">-</td>
                    <td className="py-1 border-r border-emerald-200 px-1 text-center">{item.batch || '-'}</td>
                    <td className="py-1 border-r border-emerald-200 px-1 text-center">{item.expiry || '-'}</td>
                    <td className="py-1 border-r border-emerald-200 px-1 text-right">{item.mrp.toFixed(2)}</td>
                    <td className="py-1 px-1 text-right font-bold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
                {/* Empty rows to mimic form if few items */}
                {[...Array(Math.max(0, 3 - rows.length))].map((_, idx) => (
                   <tr key={'empty-'+idx} className="align-top border-b border-emerald-200 h-6">
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1 border-r border-emerald-200"></td>
                    <td className="py-1"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex border-b border-emerald-600 mb-1 font-bold text-[10px]">
               <div className="w-[75%] border-r border-emerald-600 px-1 py-1 flex justify-between items-center bg-emerald-100 text-emerald-800">
                  <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-sm uppercase text-[8px]">FLASH</div>
                  <div className="text-[8px]">
                    {totalDiscount > 0 && <span className="mr-2">DISC: {totalDiscount.toFixed(2)}</span>}
                    {totalTax > 0 && <span>GST: {totalTax.toFixed(2)}</span>}
                  </div>
               </div>
               <div className="w-[25%] flex justify-between px-1 py-1 bg-emerald-600 text-white items-center">
                  <span className="text-[8px]">TOTAL</span>
                  <span>{grandTotal.toFixed(2)}</span>
               </div>
            </div>

            <div className="text-[7px] italic mt-1 text-emerald-800 font-serif flex justify-between items-end border-t border-emerald-200 pt-1">
              <div>
                <p>Subject to Bangalore Jurisdiction.</p>
                <p>Medicines once sold cannot be taken back or exchanged.</p>
                <p>Any excess amt. on collection for oversight will be refunded.</p>
              </div>
              <div className="text-right">
                <p>We Wish You A Speedy Recovery...</p>
                <p>All Major Debit or Credit Cards Accepted.</p>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}
