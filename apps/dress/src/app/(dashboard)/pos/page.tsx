"use client";

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '@/config/api';
import { db, Party } from '@/lib/db';
import { Logo } from '@/components/Logo';
import { useLiveQuery } from 'dexie-react-hooks';
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  purchasePrice?: number;
  size?: string;
  stock?: number;
  variants?: { size: string; stock: number }[];
  category: string;
  type: string;
  img?: string;
}
import { 
  Plus, 
  Trash2, 
  Smartphone, 
  Printer, 
  Save, 
  Calendar, 
  Search, 
  PlusCircle, 
  X,
  CreditCard,
  Banknote,
  Smartphone as UpiIcon,
  ShoppingBag,
  FileText,
  Barcode,
  Shirt,
  Package,
  Info,
  Star,
  QrCode,
  Phone,
  MapPin
} from 'lucide-react';

interface BillingRow {
  id: string;
  itemId?: string;
  name: string;
  size: string;
  mrp: number;
  qty: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = Math.round(num)) === 0) return 'Zero';

  const n = ('000000000' + num).substring(num.toString().length > 9 ? 0 : 9 - num.toString().length).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return num + " Rupees only";
  
  let str = '';
  str += Number(n[1]) != 0 ? (a[Number(n[1])] || b[Number(n[1].toString()[0])] + ' ' + a[Number(n[1].toString()[1])]) + 'Crore ' : '';
  str += Number(n[2]) != 0 ? (a[Number(n[2])] || b[Number(n[2].toString()[0])] + ' ' + a[Number(n[2].toString()[1])]) + 'Lakh ' : '';
  str += Number(n[3]) != 0 ? (a[Number(n[3])] || b[Number(n[3].toString()[0])] + ' ' + a[Number(n[3].toString()[1])]) + 'Thousand ' : '';
  str += Number(n[4]) != 0 ? a[Number(n[4])] + 'Hundred ' : '';
  str += Number(n[5]) != 0 ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5].toString()[0])] + ' ' + a[Number(n[5].toString()[1])]) + 'Rupees ' : 'Rupees ';
  return str + 'only';
}

export default function POSPage() {
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const dbParties = useLiveQuery(() => db.parties.toArray()) || [];
  
  useEffect(() => {
    const fetchMenu = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (rid) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/inventory/${rid}`);
          const data = await res.json();
          if (data.success) setDbMenuItems(data.data || []);
        } catch (e) {
          console.error('Failed to fetch menu:', e);
        }
      }
    };
    fetchMenu();
  }, []);
  
  const [restaurantData, setRestaurantData] = useState({
    name: "Sri Murugan Silks",
    tagline: "Premium Clothing Store",
    phone: "9876543210",
    gstin: "33ABCDE1234F1Z5",
    logo: "",
    whatsappNumber: "",
    whatsappToken: "",
    whatsappBusinessId: "",
    address: "123 Shopping Street, City"
  });

  // Load store config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // For this local retail version, we bypass backend fetch to prevent "Failed to fetch" errors.
      const stored = localStorage.getItem('servewell_restaurant_details');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If it accidentally loaded old restaurant data like SUVAI, we can override or let them update via settings.
        setRestaurantData(parsed);
      }
    }
  }, []);

  // Form Header State
  const [isCredit, setIsCredit] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(11590);
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [stateOfSupply, setStateOfSupply] = useState('Local');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Autocomplete UI States
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Billing Rows state (Cart)
  const [rows, setRows] = useState<BillingRow[]>([
    { id: crypto.randomUUID(), name: '', size: '', mrp: 0, qty: 1, discountPercent: 0, taxPercent: 5, total: 0 }
  ]);
  
  // POS Grid States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Load next Invoice Number
  useEffect(() => {
    const fetchNextInvoiceNo = async () => {
      const ordersCount = await db.orders.count();
      setInvoiceNo(11500 + ordersCount + 1);
    };
    fetchNextInvoiceNo();
  }, []);

  // Add item to cart from grid
  const handleAddToCart = (item: MenuItem) => {
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
        size: '',
        mrp: item.price,
        qty: 1,
        discountPercent: 0,
        taxPercent: 5, // Default GST
        total: item.price * 1.05
      };
      setRows([...rows, newRow]);
    }
  };

  const incrementQty = (id: string) => {
    const updated = rows.map(r => {
      if (r.id === id) {
        const qty = r.qty + 1;
        const sub = qty * r.mrp;
        const discAmount = sub * (r.discountPercent / 100);
        const taxedBase = sub - discAmount;
        const taxAmount = taxedBase * (r.taxPercent / 100);
        return { ...r, qty, total: taxedBase + taxAmount };
      }
      return r;
    });
    setRows(updated);
  };

  const decrementQty = (id: string) => {
    const row = rows.find(r => r.id === id);
    if (row && row.qty > 1) {
      const updated = rows.map(r => {
        if (r.id === id) {
          const qty = r.qty - 1;
          const sub = qty * r.mrp;
          const discAmount = sub * (r.discountPercent / 100);
          const taxedBase = sub - discAmount;
          const taxAmount = taxedBase * (r.taxPercent / 100);
          return { ...r, qty, total: taxedBase + taxAmount };
        }
        return r;
      });
      setRows(updated);
    } else if (row && row.qty === 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const removeCartItem = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
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

  // Select Party from dropdown
  const handleSelectParty = (party: Party) => {
    setCustomerName(party.name);
    setCustomerPhone(party.phone);
    setShowPartyDropdown(false);
  };

  // Calculation summaries
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

  // Save Order to MongoDB backend
  const handleSaveOrder = async (preGeneratedUuid?: string) => {
    const validRows = rows.filter(r => r.name.trim() !== '');
    if (validRows.length === 0) {
      alert("Please add at least one item to the invoice.");
      return false;
    }

    const restaurantId = localStorage.getItem('restaurantId') || 'default';
    const uuid = preGeneratedUuid || crypto.randomUUID();

    const orderData = {
      uuid,
      restaurantId,
      items: validRows.map(r => ({
        id: r.itemId || 'custom',
        name: `${r.name}${r.size ? ` (${r.size})` : ''}`,
        price: r.mrp,
        quantity: r.qty
      })),
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total: grandTotal,
      paymentMethod: isCredit ? 'CREDIT' : paymentMethod,
      orderType: 'Retail Invoice',
      timestamp: Date.now(),
    };

    try {
      // 1. Save order to backend MongoDB
      const orderRes = await fetch(`${API_BASE_URL}/api/v1/sync/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!orderRes.ok) throw new Error('Failed to save order to server');

      // 2. Deduct stock in backend MongoDB
      const deductions = validRows
        .filter(r => r.itemId || r.name)
        .map(r => ({ itemId: r.itemId || '', name: r.name, qty: r.qty }));

      if (deductions.length > 0 && restaurantId !== 'default') {
        await fetch(`${API_BASE_URL}/api/v1/inventory/${restaurantId}/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deductions }),
        });
      }

      // 3. Reset POS form
      setInvoiceNo(prev => prev + 1);
      setRows([{ id: '1', name: '', size: '', mrp: 0, qty: 1, discountPercent: 0, taxPercent: 5, total: 0 }]);
      setCustomerName('');
      setCustomerPhone('');
      setIsCredit(false);
      return true;
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice to server. Please check your internet connection.");
      return false;
    }
  };


  // WhatsApp formatted receipt
  const getWhatsAppBillText = (uuid: string) => {
    let text = `Greetings from ${restaurantData.name}\n\n`;
    text += `Invoice Amount: ${grandTotal.toFixed(2)}\n`;
    text += `Balance: 0.00\n\n`;
    text += `Thanks for doing business with us.\n`;
    text += `Regards,\n`;
    text += `${restaurantData.name}\n\n`;
    
    // Generate an invoice link pointing to our public receipt view page
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002';
    text += `Invoice Link:\n${origin}/invoice/view?uuid=${uuid}`;
    
    return encodeURIComponent(text);
  };

  const handleWhatsAppCheckout = async () => {
    if (!customerPhone.trim()) {
      alert("Please enter customer mobile number to send WhatsApp bill.");
      return;
    }
    
    // Pre-open WhatsApp window IMMEDIATELY (before any async work)
    // This avoids browser popup blocker which blocks window.open() after async operations
    const waWindow = window.open('about:blank', '_blank');

    // Show a loading feedback to the user
    const loadingToast = document.createElement('div');
    loadingToast.className = "fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs py-3 px-6 rounded-2xl shadow-2xl z-[9999] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4";
    loadingToast.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating WhatsApp Receipt Image...';
    document.body.appendChild(loadingToast);

    try {
      const activeUuid = crypto.randomUUID();
      const billText = getWhatsAppBillText(activeUuid);
      
      // Render invoice image using html2canvas
      const element = document.getElementById('invoice-capture-element');
      let imageFile: File | null = null;
      let blob: Blob | null = null;

      if (element) {
        // Wait a tiny fraction of a second to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Convert canvas to base64 and upload to backend
        const imageBase64 = canvas.toDataURL('image/png');
        try {
          await fetch(`${API_BASE_URL}/api/v1/orders/upload-image/${activeUuid}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageBase64 })
          });
        } catch (uploadErr) {
          console.error("Failed to upload receipt image to server:", uploadErr);
        }

        // Convert canvas to File blob for local share/clipboard fallback
        blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          imageFile = new File([blob], `invoice_DR${invoiceNo}.png`, { type: 'image/png' });
        }
      }

      // Save order
      const saved = await handleSaveOrder(activeUuid);
      
      // Remove loading indicator
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }

      if (saved) {
        const cleanPhone = customerPhone.replace(/\D/g, '');
        let formattedPhone = cleanPhone;
        if (cleanPhone.length === 10) {
          formattedPhone = '91' + cleanPhone;
        } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
          formattedPhone = '91' + cleanPhone.substring(1);
        }

        const restDetails = restaurantData as any;
        
        // Automated Flow: Send image and text directly in the background using Meta Cloud API
        if (restDetails.whatsappToken && restDetails.whatsappBusinessId && restDetails.whatsappNumber) {
          try {
            // 1. Send Image directly
            const imgRes = await fetch(`https://graph.facebook.com/v19.0/${restDetails.whatsappBusinessId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${restDetails.whatsappToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "image",
                image: {
                  link: `${API_BASE_URL}/public/invoices/${activeUuid}.png`
                }
              })
            });

            // 2. Send Invoice text link directly
            const textRes = await fetch(`https://graph.facebook.com/v19.0/${restDetails.whatsappBusinessId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${restDetails.whatsappToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: formattedPhone,
                type: "text",
                text: {
                  preview_url: false,
                  body: decodeURIComponent(billText)
                }
              })
            });

            if (imgRes.ok && textRes.ok) {
              setToastMessage("WhatsApp Invoice Image and Link sent directly!");
              setTimeout(() => setToastMessage(''), 4000);
              return;
            }
          } catch (err) {
            console.error("Direct API sending failed, falling back to manual share:", err);
          }
        }

        // Fallback Manual Flow: Personal WhatsApp Redirect
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // On mobile, use native Share sheet (it opens WhatsApp app directly)
        if (isMobile && imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          try {
            await navigator.share({
              files: [imageFile],
              title: `Invoice #DR${invoiceNo}`,
              text: decodeURIComponent(billText)
            });
            return;
          } catch (shareErr) {
            console.warn("Direct file sharing dismissed:", shareErr);
          }
        }

        // On desktop, copy the invoice image directly to the clipboard so they can just press Ctrl+V in WhatsApp
        let copiedToClipboard = false;
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            copiedToClipboard = true;
          } catch (clipErr) {
            console.warn("Clipboard copy failed, using download fallback:", clipErr);
          }
        }

        // Fallback: Download image if clipboard write is blocked by browser policy
        if (!copiedToClipboard && imageFile) {
          const downloadUrl = URL.createObjectURL(imageFile);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `invoice_DR${invoiceNo}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }

        // Open WhatsApp using anchor click (bypasses popup blockers)
        const waUrl = `https://wa.me/${formattedPhone}?text=${billText}`;
        const waLink = document.createElement('a');
        waLink.href = waUrl;
        waLink.target = '_blank';
        waLink.rel = 'noopener noreferrer';
        document.body.appendChild(waLink);
        waLink.click();
        document.body.removeChild(waLink);

        // Close the pre-opened blank window if still open
        if (waWindow && !waWindow.closed) waWindow.close();

        setToastMessage(
          copiedToClipboard
            ? "WhatsApp opened! Right-click in the chat and select 'Paste' (or press Ctrl+V on your keyboard) to attach the image."
            : "WhatsApp opened! Attach the downloaded invoice image."
        );
        setTimeout(() => setToastMessage(''), 8000);
      }
    } catch (err) {
      console.error(err);
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
      alert("Something went wrong during checkout. Saved order locally instead.");
      await handleSaveOrder();
    }
  };

  const itemsCount = rows.filter(r => r.name.trim() !== '').length;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 pb-24 lg:pb-4 relative">
      
      {/* Toast Notification overlay */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl z-[9999] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 print:hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25d366] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* LEFT PANEL: Interactive Spreadsheet Billing table */}
      <div className="flex-1 flex flex-col gap-5 overflow-hidden print:hidden">
        
        {/* Invoice Info Bar */}
        <div className="bg-[#0b1a30] text-white p-4 px-6 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Shirt className="w-7 h-7 text-blue-300" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider leading-none">{restaurantData.name || 'Retail Store'}</h2>
              {restaurantData.phone && <p className="text-[10px] text-blue-300 font-bold mt-0.5">{restaurantData.phone}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Invoice No</span>
              <span className="text-white font-black text-sm">#DR{invoiceNo}</span>
            </div>
            <div className="h-8 w-px bg-slate-600"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Date</span>
              <input 
                type="date" 
                value={invoiceDate} 
                onChange={(e) => setInvoiceDate(e.target.value)} 
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-sm"
              />
            </div>
            <div className="h-8 w-px bg-slate-600"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Supply State</span>
              <select 
                value={stateOfSupply} 
                onChange={(e) => setStateOfSupply(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-sm"
              >
                <option value="Local" className="text-slate-800">Local</option>
                <option value="Out of State" className="text-slate-800">Out of State</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid Layout */}
        <div className="bg-white border-x border-b border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products by name or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:bg-white transition-colors text-gray-800"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {Array.from(new Set(dbMenuItems.map(item => item.category))).filter(Boolean).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Products */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {dbMenuItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Package className="w-12 h-12 text-gray-300" />
                <p className="text-sm font-semibold">No products found</p>
                <p className="text-xs">Add items from the Items page</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dbMenuItems
                  .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                  .filter(item => 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(item => (
                    <div 
                      key={item.id}
                      onClick={() => handleAddToCart(item)}
                      className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all group active:scale-95"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</span>
                        <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="font-black text-lg text-gray-900">₹{item.price}</span>
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The Original Style Order Summary Panel */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 h-[85vh] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col p-6 transition-transform duration-300 print:hidden
        lg:relative lg:h-[calc(100vh-144px)] lg:w-[480px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-gray-200 lg:shadow-none lg:translate-y-0 lg:z-0
        ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        
        {/* Title Header */}
        <div className="flex justify-between items-start mb-4 bg-gradient-to-r from-amber-100 to-amber-200 p-3 rounded-xl">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-800">Order Summary</h2>
            <span className="text-[10px] font-bold text-amber-500 uppercase mt-0.5">
              Invoice #DR{invoiceNo}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-lg transition-colors" onClick={() => setRows([{ id: '1', name: '', size: '', mrp: 0, qty: 1, discountPercent: 0, taxPercent: 5, total: 0 }])}>Clear All</button>
            <button className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors" onClick={() => setIsMobileCartOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Details input (WhatsApp) */}
        <div className="bg-white/90 border border-gray-200 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Customer Details
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2 relative">
            <div className="relative">
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setPartySearchQuery(e.target.value);
                  setShowPartyDropdown(true);
                }}
                onFocus={() => setShowPartyDropdown(true)}
                placeholder="Name" 
                className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-medium text-gray-800 placeholder:text-gray-400"
              />
              
              {showPartyDropdown && partySearchQuery && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-40 overflow-y-auto p-1">
                  {dbParties
                    .filter(p => p.type === 'customer' && (p.name.toLowerCase().includes(partySearchQuery.toLowerCase()) || p.phone.includes(partySearchQuery)))
                    .map(party => (
                      <div 
                        key={party.id}
                        onClick={() => handleSelectParty(party)}
                        className="flex justify-between items-center px-2 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors text-xs font-medium text-gray-800"
                      >
                        <span className="text-gray-800">{party.name}</span>
                        <span className="text-gray-400 font-mono">{party.phone}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>

            <input 
              type="tel" 
              value={customerPhone} 
              onChange={(e) => setCustomerPhone(e.target.value)} 
              placeholder="WhatsApp No." 
              className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-amber-400 font-medium font-mono text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Live Bill totals calculations */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {itemsCount === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs font-bold gap-2">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
              <span>Cart is empty</span>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Items Added</span>
              <div className="space-y-1 pr-1">
                {rows.filter(r => r.name.trim() !== '').map((item, index) => (
                  <div key={item.id} className="flex flex-col gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-800 font-bold line-clamp-2 pr-2">{item.name}</span>
                      <button onClick={() => removeCartItem(item.id)} className="text-gray-400 hover:text-red-500 mt-0.5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Inline edit fields */}
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Size</label>
                        <input type="text" value={item.size} onChange={(e) => updateCartItem(item.id, 'size', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white" placeholder="--" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Rate</label>
                        <input type="number" value={item.mrp === 0 ? '' : item.mrp} onChange={(e) => updateCartItem(item.id, 'mrp', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Disc%</label>
                        <input type="number" value={item.discountPercent === 0 ? '' : item.discountPercent} onChange={(e) => updateCartItem(item.id, 'discountPercent', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">GST%</label>
                        <select value={item.taxPercent} onChange={(e) => updateCartItem(item.id, 'taxPercent', Number(e.target.value))} className="w-full px-1.5 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono">
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200/60">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-0.5">
                        <button onClick={() => decrementQty(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md">
                          <span className="text-lg leading-none mb-0.5">-</span>
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => incrementQty(item.id)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-md">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-amber-600 shrink-0 text-sm font-mono font-black">
                        ₹{item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Calculations and Actions Footer */}
        <div className="pt-4 border-t border-gray-200 space-y-4 mt-auto shrink-0">
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Sub Total</span>
              <span className="text-gray-800 font-bold font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-xs font-semibold text-emerald-500">
                <span>Discount</span>
                <span className="font-bold font-mono">- ₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>GST Tax</span>
              <span className="text-gray-800 font-bold font-mono">₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
              <span>Round off</span>
              <span className="text-gray-800 font-bold font-mono">{(roundOff >= 0 ? '+' : '')}{roundOff.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-1.5">
              <span className="text-gray-900">Total Bill</span>
              <span className="text-amber-600 font-mono">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method selectors */}
          {!isCredit && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', icon: Banknote, label: 'Cash' },
                { id: 'CARD', icon: CreditCard, label: 'Card' },
                { id: 'UPI', icon: UpiIcon, label: 'UPI' }
              ].map(m => (
                <button 
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg active:scale-95 transition-all border ${paymentMethod === m.id ? 'bg-amber-50 border-amber-500 text-amber-600 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50/50 shadow-sm'}`}
                >
                  <m.icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action button trigger controls */}
          <div className="grid grid-cols-2 gap-3.5 mt-1">
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 rounded-xl active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              WhatsApp Bill
            </button>
            <button
              type="button"
              onClick={() => setShowPrintConfirm(true)}
              className="py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-sm tracking-wide shadow-lg transition-all flex justify-center items-center gap-2 rounded-xl active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>

          {/* Print Confirm Modal */}
          {showPrintConfirm && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
              <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full">
                <h3 className="text-lg font-black text-slate-800 mb-1">Confirm Sale?</h3>
                <p className="text-sm text-slate-500 mb-6">This will save the invoice to Sales records and open the Print dialog.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPrintConfirm(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowPrintConfirm(false);
                      const saved = await handleSaveOrder();
                      if (saved) window.print();
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-black"
                  >
                    Save &amp; Print
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile drawer toggle view cart bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0b1a30] border-t border-slate-700 p-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-30 flex items-center justify-between pb-safe print:hidden">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-400">{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</span>
          <span className="text-lg font-black text-amber-400">₹{grandTotal.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => setIsMobileCartOpen(true)}
          className="bg-amber-500 text-[#0b1a30] px-5 py-2.5 font-black flex items-center gap-2 shadow-md hover:bg-amber-400 active:scale-95 transition-all text-xs"
        >
          <ShoppingBag className="w-4 h-4" /> Order Summary
        </button>
      </div>

      {/* Hidden Vyapar Invoice Template for Image Generation */}
      {/* Hidden Invoice Template for Image Generation */}
      <div className="absolute top-[-9999px] left-[-9999px] print:static print:top-0 print:left-0 print:block print:w-full">
        <div 
          id="invoice-capture-element"
          className="bg-white border border-slate-300 w-[900px] print:w-full text-slate-800 rounded-[2rem] print:rounded-none print:border-none overflow-hidden p-0 shadow-sm print:shadow-none"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          {/* Header Section */}
          <div className="flex relative bg-slate-50 border-b border-slate-200">
              {/* Left Deep Blue area */}
             <div style={{background:'#0b1a30',color:'white',padding:'24px 32px',flex:'0.65',borderBottomRightRadius:'4rem',display:'flex',flexDirection:'column',justifyContent:'center',position:'relative',zIndex:10}}>
                 {/* Store name row */}
                 <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
                    <div style={{width:'56px',height:'56px',background:'rgba(255,255,255,0.1)',borderRadius:'16px',padding:'8px',border:'1px solid rgba(255,255,255,0.2)',flexShrink:0}}>
                      <Logo className="w-full h-full drop-shadow-md" />
                    </div>
                    <div>
                       <h1 style={{fontSize:'1.5rem',fontWeight:900,letterSpacing:'0.1em',textTransform:'uppercase',lineHeight:1.2,margin:0}}>{restaurantData.name || 'RETAIL STORE'}</h1>
                       <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'4px'}}>
                         <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#60a5fa',display:'inline-block'}}></span>
                         <span style={{color:'#93c5fd',fontStyle:'italic',fontSize:'1rem',fontFamily:'Georgia, serif'}}>{restaurantData.tagline || 'Premium Quality'}</span>
                         <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#60a5fa',display:'inline-block'}}></span>
                       </div>
                    </div>
                 </div>
                 {/* Contact info row - always below store name */}
                 <div style={{display:'flex',alignItems:'center',gap:'24px',fontSize:'11px',color:'#cbd5e1'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{background:'#1e293b',padding:'6px',borderRadius:'50%',flexShrink:0,display:'flex'}}><Phone style={{width:'12px',height:'12px',color:'#94a3b8'}}/></div>
                      <span>{restaurantData.phone || '9876543210'}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{background:'#1e293b',padding:'6px',borderRadius:'50%',flexShrink:0,display:'flex'}}><MapPin style={{width:'12px',height:'12px',color:'#94a3b8'}}/></div>
                      <span>{restaurantData.address || '123 Retail Street, City'}</span>
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
                  <span className="text-slate-700 font-mono text-right">{invoiceNo}</span>
                  <span className="text-[#0b1a30]">Date</span>
                  <span className="text-slate-700 font-mono text-right">{invoiceDate.split('-').reverse().join('/')}</span>
               </div>
             </div>
          </div>

          {/* Bill To */}
          <div className="px-8 pt-6 pb-4">
            <span className="text-blue-600 font-bold text-xs block mb-1">Bill To</span>
            <h2 className="text-2xl font-black text-[#0b1a30] uppercase">{customerName || 'Walk-in Customer'}</h2>
            {customerPhone && (
              <p className="text-[11px] font-bold text-[#0b1a30] mt-1">Contact No.: <span className="font-medium text-slate-700">{customerPhone}</span></p>
            )}
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
                    {rows.filter(r => r.name.trim() !== '').map((item, idx) => {
                      const itemSubtotal = item.qty * item.mrp;
                      const itemDiscount = itemSubtotal * (item.discountPercent / 100);
                      
                      return (
                        <tr key={idx} className="border-b border-slate-100 font-bold text-slate-700">
                           <td className="py-3 px-3 text-center border-r border-slate-100">{idx + 1}</td>
                           <td className="py-3 px-3 border-r border-slate-100 uppercase">{item.name}</td>
                           <td className="py-3 px-3 border-r border-slate-100"></td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {item.mrp.toFixed(2)}</td>
                           <td className="py-3 px-3 text-center border-r border-slate-100 font-mono">{item.qty}</td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {item.mrp.toFixed(2)}</td>
                           <td className="py-3 px-3 text-right border-r border-slate-100 font-mono">₹ {itemDiscount.toFixed(2)} ({item.discountPercent}%)</td>
                           <td className="py-3 px-3 text-right font-mono text-slate-800">₹ {item.total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                 </tbody>
                 <tfoot>
                    <tr className="bg-[#eaf3fc] font-bold text-blue-900 border-t border-blue-200">
                       <td colSpan={4} className="py-2.5 px-4 text-left border-r border-blue-200">Total</td>
                       <td className="py-2.5 px-3 text-center font-mono border-r border-blue-200">
                         {rows.filter(r => r.name.trim() !== '').reduce((sum, r) => sum + r.qty, 0)}
                       </td>
                       <td colSpan={2} className="py-2.5 px-3 text-right font-mono border-r border-blue-200 text-blue-700">₹ {totalDiscount.toFixed(2)}</td>
                       <td className="py-2.5 px-3 text-right font-mono text-blue-700">₹ {grandTotal.toFixed(2)}</td>
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
                    <span className="text-[11px] text-slate-700 font-bold italic">{numberToWords(grandTotal)}</span>
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
                 <p className="text-[10px] font-bold text-slate-800">For : {restaurantData.name || 'RETAIL STORE'}</p>
                 <div className="h-10 mt-1 italic text-3xl font-serif text-slate-800 opacity-80 line-clamp-1" style={{ fontFamily: 'Brush Script MT, cursive' }}>{restaurantData.name || 'Retail Store'}</div>
                 <div className="h-px bg-slate-400 w-48 mb-1"></div>
                 <p className="text-[10px] font-bold text-slate-800">Authorized Signatory</p>
               </div>
            </div>

            {/* Right Calculations Box */}
            <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-[11px]">
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200">
                 <span className="font-bold text-slate-700">Sub Total</span>
                 <span className="font-mono font-bold">₹ {subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200">
                 <span className="font-bold text-slate-700">Discount</span>
                 <span className="font-mono font-bold">₹ {totalDiscount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 bg-[#1e5eb3] text-white">
                 <span className="font-bold text-sm">Total</span>
                 <span className="font-mono font-bold text-sm">₹ {grandTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200 bg-white">
                 <span className="font-bold text-slate-700">Received</span>
                 <span className="font-mono font-bold">₹ {grandTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 border-b border-slate-200 bg-white">
                 <span className="font-bold text-slate-700">Balance</span>
                 <span className="font-mono font-bold">₹ 0.00</span>
               </div>
               <div className="flex justify-between py-2.5 px-4 bg-white">
                 <span className="font-bold text-slate-700">You Saved</span>
                 <span className="font-mono font-bold text-blue-600">₹ {totalDiscount.toFixed(2)}</span>
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

    </div>
  );
}
