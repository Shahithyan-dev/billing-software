"use client";

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '@/config/api';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  purchasePrice?: number;
  size?: string;
  stock?: number;
  variants?: { size: string; stock: number; batchNo?: string; expiryDate?: string; mfgDate?: string; purchasePrice?: number; mrp?: number; price?: number }[];
  category: string;
  type: string;
  img?: string;
  
  // Phase 2 Pharmacy Fields
  genericName?: string;
  brandName?: string;
  manufacturer?: string;
  composition?: string;
  hsnCode?: string;
  gstPercent?: number;
  barcode?: string;
  sku?: string;
  batchNo?: string;
  expiryDate?: string;
  mfgDate?: string;
  mrp?: number;
  discountPercent?: number;
  minStock?: number;
  rackNo?: string;
  storageType?: string;
  prescriptionRequired?: boolean;
  schedule?: string;
  dosage?: string;
  strength?: string;
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
  MapPin,
  Utensils,
  Users,
  ChevronDown,
  Activity
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
  batchNo?: string;
  expiryDate?: string;
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

const mockMenu: MenuItem[] = [
  { id: '1', name: 'Idli Sambar', price: 60, category: 'Breakfast', type: 'veg' },
  { id: '2', name: 'Masala Dosa', price: 80, category: 'Breakfast', type: 'veg' },
  { id: '3', name: 'Veg Thali', price: 220, category: 'Lunch', type: 'veg' },
  { id: '4', name: 'Chicken Biryani', price: 320, category: 'Lunch', type: 'non-veg' },
  { id: '5', name: 'Paneer Butter Masala', price: 280, category: 'Dinner', type: 'veg' },
  { id: '6', name: 'Garlic Naan', price: 60, category: 'Dinner', type: 'veg' },
  { id: '7', name: 'Veg Manchurian', price: 180, category: 'Snacks', type: 'veg' },
  { id: '8', name: 'Cold Coffee', price: 120, category: 'Beverages', type: 'veg' },
];

const mockRetailMenu: MenuItem[] = [
  { id: '101', name: 'Formal Shirt', price: 1499, category: 'Shirts', type: 'retail' },
  { id: '102', name: 'Casual T-Shirt', price: 799, category: 'Shirts', type: 'retail' },
  { id: '103', name: 'Regular Fit Jeans', price: 1799, category: 'Jeans', type: 'retail' },
  { id: '104', name: 'Slim Fit Jeans', price: 1999, category: 'Jeans', type: 'retail' },
  { id: '105', name: 'Chinos', price: 1599, category: 'Trousers', type: 'retail' },
  { id: '106', name: 'Cargo Pants', price: 1899, category: 'Pants', type: 'retail' },
  { id: '107', name: 'Track Pants', price: 999, category: 'Sportswear', type: 'retail' },
  { id: '108', name: 'Shorts', price: 799, category: 'Bottom Wear', type: 'retail' },
];

const tamilDictionary: Record<string, string> = {
  'Idli Sambar': 'இட்லி சாம்பார்',
  'Masala Dosa': 'மசால் தோசை',
  'Veg Thali': 'சைவ சாப்பாடு',
  'Chicken Biryani': 'சிக்கன் பிரியாணி',
  'Paneer Butter Masala': 'பன்னீர் பட்டர் மசாலா',
  'Garlic Naan': 'பூண்டு நான்',
  'Veg Manchurian': 'வெஜ் மஞ்சூரியன்',
  'Cold Coffee': 'கூல் காபி'
};

export default function StandardPOS() {
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const [acDbMenuItems, setAcDbMenuItems] = useState<MenuItem[]>([]);
  const [dbParties, setDbParties] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMenuAndParties = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (rid) {
        try {
          const [invRes, parRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/menu/${rid}`),
            fetch(`${API_BASE_URL}/api/v1/parties?restaurantId=${rid}`)
          ]);
          const invData = await invRes.json();
          const parData = await parRes.json();
          if (invData.success) {
            setDbMenuItems(invData.data || []);
            setAcDbMenuItems(invData.acMenu || []);
          }
          if (parData.success) setDbParties(parData.data || []);
        } catch (e) {
          console.error('Failed to fetch data:', e);
          alert("Network Error: Could not reach the live server. You are currently viewing offline cached data.");
        }
      }
    };
    fetchMenuAndParties();
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
    address: "123 Shopping Street, City",
    businessType: "retail", // can be 'retail' or 'restaurant'
    menuCategories: [],
    diningAreas: [],
    preferences: {
      acBillingType: "per_head",
      acPerHeadAmount: 0
    }
  });

  // Restaurant-specific states
  const [orderType, setOrderType] = useState<'Dine-In' | 'Parcel'>('Dine-In');
  const [selectedTable, setSelectedTable] = useState('T1');
  const [acType, setAcType] = useState('AC');
  const [guests, setGuests] = useState(1);
  const [tables, setTables] = useState<string[]>(['T1', 'T2', 'T3', 'T4', 'T5']);
  const [selectedCaptain, setSelectedCaptain] = useState('Captain');
  const [captains, setCaptains] = useState<string[]>(['Captain', 'Rahul', 'Priya']);

  // Load store config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zyncobill_restaurant_details');
      const rid = localStorage.getItem('restaurantId');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRestaurantData({
          ...parsed,
          preferences: {
            acBillingType: 'per_head',
            acPerHeadAmount: 0,
            ...(parsed.preferences || {})
          }
        });
      }

      // Fetch dynamic staff (Captains/Servers)
      if (rid) {
        fetch(`${API_BASE_URL}/api/v1/staff/${rid}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data.length > 0) {
              const staffCaptains = data.data
                .filter((s: any) => s.role === 'Captain' || s.role === 'Server')
                .map((s: any) => s.name);
              
              if (staffCaptains.length > 0) {
                // Ensure 'Captain' or 'Self Service' is always an option if needed, or just replace entirely
                setCaptains(['Self Service', ...staffCaptains]);
                setSelectedCaptain(staffCaptains[0]);
              }
            }
          })
          .catch(err => console.error('Failed to fetch staff for POS captains:', err));
      }
    }
  }, []);

  // Form Header State
  const [isCredit, setIsCredit] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(11590);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  useEffect(() => {
    setInvoiceDate(new Date().toISOString().split('T')[0]);
  }, []);

  const [stateOfSupply, setStateOfSupply] = useState('Local');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Autocomplete UI States
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const requestedTranslations = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleLangChange = () => {
      setLanguage(localStorage.getItem('zyncobill_language') as 'en' | 'ta' || 'en');
    };
    handleLangChange();
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  const getTranslatedName = (name: string) => {
    if (language !== 'ta') return name;
    if (tamilDictionary[name]) return tamilDictionary[name];
    if (dynamicTranslations[name]) return dynamicTranslations[name];
    return name;
  };

  // Billing Rows state (Cart)
  const [rows, setRows] = useState<BillingRow[]>([
    { id: '1', name: '', size: '', mrp: 0, qty: 1, discountPercent: 0, taxPercent: 5, total: 0 }
  ]);
  
  // POS Grid States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Load next Invoice Number
  useEffect(() => {
    const fetchNextInvoiceNo = async () => {
      const rid = localStorage.getItem('restaurantId');
      if (!rid) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/orders?restaurantId=${rid}`);
        const data = await res.json();
        if (data.success) {
          const ordersCount = data.data.length || 0;
          setInvoiceNo(11500 + ordersCount + 1);
        }
      } catch (e) {
        console.error('Failed to fetch orders count for invoice no', e);
      }
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
  const handleSelectParty = (party: any) => {
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
  
  const isPerHead = restaurantData.preferences?.acBillingType === 'per_head' || !restaurantData.preferences?.acBillingType;
  const acChargeTotal = (restaurantData.businessType === 'restaurant' && orderType === 'Dine-In' && acType === 'AC' && isPerHead) 
    ? (guests * (restaurantData.preferences?.acPerHeadAmount || 0)) 
    : 0;

  const rawTotal = taxableValue + totalTax + acChargeTotal;
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
      acCharge: acChargeTotal,
      total: grandTotal,
      paymentMethod: isCredit ? 'CREDIT' : paymentMethod,
      orderType: restaurantData.businessType === 'restaurant' ? orderType : 'Retail Invoice',
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
        await fetch(`${API_BASE_URL}/api/v1/menu/${restaurantId}/deduct`, {
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


  const acMenuToUse = (restaurantData.preferences?.acBillingType === 'separate_menu' && acType === 'AC' && acDbMenuItems.length > 0) ? acDbMenuItems : dbMenuItems;
  const activeMenu = acMenuToUse.length > 0 ? acMenuToUse : (
    restaurantData.businessType === 'restaurant' ? mockMenu : 
    restaurantData.businessType === 'pharmacy' ? [] : mockRetailMenu
  );

  useEffect(() => {
    if (language === 'ta') {
      let needsUpdate = false;
      const newTranslations: Record<string, string> = {};
      
      const fetchPromises = activeMenu.map(async (item) => {
        const name = item.name;
        if (!tamilDictionary[name] && !dynamicTranslations[name] && !requestedTranslations.current.has(name)) {
          requestedTranslations.current.add(name);
          try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(name)}`);
            const data = await res.json();
            if (data && data[0] && data[0][0]) {
              newTranslations[name] = data[0][0][0];
              needsUpdate = true;
            }
          } catch (e) {
            console.error('Translation failed', e);
          }
        }
      });

      Promise.all(fetchPromises).then(() => {
        if (needsUpdate) {
          setDynamicTranslations(prev => ({ ...prev, ...newTranslations }));
        }
      });
    }
  }, [language, activeMenu, dynamicTranslations]);

  return (
    <div className={`h-full flex flex-col ${restaurantData.businessType === 'pharmacy' ? 'lg:flex-col' : 'lg:flex-row'} gap-6 pb-24 lg:pb-4 relative`}>
      
      {/* Toast Notification overlay */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl z-[9999] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 print:hidden">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25d366] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* LEFT PANEL: Interactive Spreadsheet Billing table */}
      <div className={`${restaurantData.businessType === 'pharmacy' ? 'flex flex-col gap-5 shrink-0 z-20' : 'flex-1 flex flex-col gap-5 overflow-hidden'} print:hidden`}>
        
        {/* Invoice Info Bar */}
        <div className="bg-[#0b1a30] text-white p-4 px-6 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {restaurantData.businessType === 'restaurant' ? (
              <Utensils className="w-7 h-7 text-amber-400" />
            ) : restaurantData.businessType === 'pharmacy' ? (
              <Activity className="w-7 h-7 text-teal-400" />
            ) : (
              <Shirt className="w-7 h-7 text-blue-300" />
            )}
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider leading-none">{restaurantData.name || 'Retail Store'}</h2>
              {restaurantData.phone && <p className="text-[10px] text-blue-300 font-bold mt-0.5">{restaurantData.phone}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            {restaurantData.businessType === 'restaurant' ? (
              <>
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">Type</span>
                  <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setOrderType('Dine-In')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${orderType === 'Dine-In' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Dine-In
                    </button>
                    <button 
                      onClick={() => setOrderType('Parcel')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${orderType === 'Parcel' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Parcel
                    </button>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-500/50 mx-2"></div>
                <div className={`flex flex-col justify-center ${orderType === 'Parcel' ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">Table</span>
                  <div className="relative flex items-center">
                    <select 
                      value={selectedTable} 
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="appearance-none bg-transparent text-white font-bold focus:outline-none cursor-pointer text-sm pr-5 z-10"
                      disabled={orderType === 'Parcel'}
                    >
                      {tables.map(t => <option key={t} value={t} className="text-slate-800">{t}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white absolute right-0 pointer-events-none" />
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-500/50 mx-2"></div>
                <div className={`flex flex-col ${orderType === 'Parcel' ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-1">A/C</span>
                  <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                    <button 
                      onClick={() => setAcType('AC')}
                      disabled={orderType === 'Parcel'}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${acType === 'AC' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      AC
                    </button>
                    <button 
                      onClick={() => setAcType('Non-AC')}
                      disabled={orderType === 'Parcel'}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${acType === 'Non-AC' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}
                    >
                      Non-AC
                    </button>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-500/50 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-0.5">Captain</span>
                  <div className="relative flex items-center">
                    <select 
                      value={selectedCaptain} 
                      onChange={(e) => setSelectedCaptain(e.target.value)}
                      className="appearance-none bg-transparent text-white font-bold focus:outline-none cursor-pointer text-sm pr-5 z-10"
                    >
                      {captains.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white absolute right-0 pointer-events-none" />
                  </div>
                </div>
              </>
            ) : (
              <>
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
                {restaurantData.businessType === 'pharmacy' ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Patient / Customer</span>
                      <input 
                        type="text"
                        placeholder="Name or Mobile"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="bg-transparent text-white font-bold focus:outline-none placeholder:text-slate-400 text-sm w-32"
                      />
                    </div>
                    <div className="h-8 w-px bg-slate-600"></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-blue-300 font-bold uppercase tracking-widest">Prescribing Doctor</span>
                      <input 
                        type="text"
                        placeholder="Dr. Name"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="bg-transparent text-white font-bold focus:outline-none placeholder:text-slate-400 text-sm w-32"
                      />
                    </div>
                  </>
                ) : (
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
                )}
              </>
            )}
          </div>
        </div>

        {/* Product Grid Layout */}
        <div className={`bg-white border-x border-b border-gray-200 shadow-sm flex flex-col ${restaurantData.businessType === 'pharmacy' ? 'rounded-b-2xl relative' : 'flex-1 overflow-hidden'}`}>
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products by name or category..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white transition-colors text-gray-800 ${restaurantData.businessType === 'pharmacy' ? 'focus:border-teal-400' : 'focus:border-amber-400'}`}
                autoFocus={restaurantData.businessType === 'pharmacy'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim() !== '') {
                    const match = activeMenu.find(item => 
                      (item.barcode && item.barcode.toLowerCase() === searchQuery.toLowerCase()) || 
                      item.name.toLowerCase() === searchQuery.toLowerCase() ||
                      (item.variants && item.variants.some(v => v.batchNo && v.batchNo.toLowerCase() === searchQuery.toLowerCase()))
                    );
                    if (match) {
                      handleAddToCart(match);
                      setSearchQuery('');
                    } else {
                      const partialMatches = activeMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
                      if (partialMatches.length === 1) {
                         handleAddToCart(partialMatches[0]);
                         setSearchQuery('');
                      }
                    }
                  }
                }}
              />
              
              {/* Autocomplete Dropdown for Pharmacy */}
              {restaurantData.businessType === 'pharmacy' && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {activeMenu.filter(item => {
                      const searchLower = searchQuery.toLowerCase();
                      return item.name.toLowerCase().includes(searchLower) || 
                             item.category.toLowerCase().includes(searchLower) ||
                             (item.genericName && item.genericName.toLowerCase().includes(searchLower)) ||
                             (item.variants && item.variants.some(v => v.batchNo && v.batchNo.toLowerCase().includes(searchLower)));
                  }).map(item => (
                    <div 
                      key={item.id} 
                      className="p-3 border-b border-gray-100 hover:bg-teal-50 cursor-pointer flex justify-between items-center transition-colors"
                      onClick={() => {
                        handleAddToCart(item);
                        setSearchQuery('');
                      }}
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                        {item.genericName && <p className="text-[10px] text-gray-500">{item.genericName}</p>}
                      </div>
                      <span className="font-black text-teal-600">₹{item.price}</span>
                    </div>
                  ))}
                  {activeMenu.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-xs font-bold">No products found</div>
                  )}
                </div>
              )}
            </div>
            
            {restaurantData.businessType !== 'pharmacy' && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {Array.from(new Set(activeMenu.map(item => item.category))).filter(Boolean).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
              </div>
            )}
          </div>

          {/* Grid of Products */}
          {restaurantData.businessType !== 'pharmacy' && (
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {activeMenu.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Package className="w-12 h-12 text-gray-300" />
                <p className="text-sm font-semibold">No products found</p>
                <p className="text-xs">Add items from the Items page</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeMenu
                  .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
                  .filter(item => {
                    const searchLower = searchQuery.toLowerCase();
                    return item.name.toLowerCase().includes(searchLower) || 
                           item.category.toLowerCase().includes(searchLower) ||
                           (item.genericName && item.genericName.toLowerCase().includes(searchLower)) ||
                           (item.variants && item.variants.some(v => v.batchNo && v.batchNo.toLowerCase().includes(searchLower)));
                  })
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
                      <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{getTranslatedName(item.name)}</h4>
                      {restaurantData.businessType === 'pharmacy' && item.genericName && (
                        <p className="text-[9px] text-slate-500 line-clamp-1">{item.genericName}</p>
                      )}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="font-black text-lg text-gray-900">₹{item.price}</span>
                      </div>
                    </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: The Original Style Order Summary Panel */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col p-6 transition-transform duration-300 print:hidden
        lg:relative lg:shrink-0 lg:rounded-none lg:shadow-none lg:translate-y-0
        ${restaurantData.businessType === 'pharmacy' 
          ? 'lg:flex-1 lg:h-auto lg:border lg:border-gray-200 lg:rounded-2xl' 
          : 'h-[85vh] lg:h-[calc(100vh-144px)] lg:w-[480px] lg:border-l lg:border-gray-200'}
        ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        
        {/* Title Header */}
        <div className={`flex justify-between items-start mb-4 p-3 rounded-xl bg-gradient-to-r ${restaurantData.businessType === 'pharmacy' ? 'from-teal-100 to-teal-200' : 'from-amber-100 to-amber-200'}`}>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-gray-800">{restaurantData.businessType === 'pharmacy' ? 'Pharmacy Bill' : 'Order Summary'}</h2>
            <span className={`text-[10px] font-bold uppercase mt-0.5 ${restaurantData.businessType === 'pharmacy' ? 'text-teal-600' : 'text-amber-500'}`}>
              Invoice #DR{invoiceNo}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {restaurantData.businessType === 'restaurant' && orderType === 'Dine-In' && acType === 'AC' && isPerHead && (
              <div className="flex items-center bg-white/50 rounded-lg border border-amber-300 overflow-hidden shadow-sm mr-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase px-2 py-1.5 border-r border-amber-300 bg-amber-100">Guests</span>
                <input 
                  type="number" 
                  min="1"
                  value={guests} 
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="w-12 text-sm font-bold text-center py-1 bg-transparent text-gray-800 focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            )}
            <button className={`text-sm font-bold text-white px-3 py-1 rounded-lg transition-colors ${restaurantData.businessType === 'pharmacy' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-amber-500 hover:bg-amber-600'}`} onClick={() => setRows([{ id: '1', name: '', size: '', mrp: 0, qty: 1, discountPercent: 0, taxPercent: 5, total: 0 }])}>Clear All</button>
            <button className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors" onClick={() => setIsMobileCartOpen(false)}>
              <X className="w-5 h-5" />
            </button>
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
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${restaurantData.businessType === 'pharmacy' ? 'text-teal-500' : 'text-amber-400'}`}>Items Added</span>
              <div className="space-y-1 pr-1">
                {rows.filter(r => r.name.trim() !== '').map((item, index) => (
                  <div key={item.id} className="flex flex-col gap-2 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-800 font-bold line-clamp-2 pr-2">{getTranslatedName(item.name)}</span>
                      <button onClick={() => removeCartItem(item.id)} className="text-gray-400 hover:text-red-500 mt-0.5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Inline edit fields */}
                    <div className={`grid ${restaurantData.businessType === 'restaurant' ? 'grid-cols-2' : 'grid-cols-4'} gap-1.5 mt-1`}>
                      {restaurantData.businessType !== 'restaurant' && (
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                            {restaurantData.businessType === 'pharmacy' ? 'Batch/Pk' : 'Size'}
                          </label>
                          <input type="text" value={item.size} onChange={(e) => updateCartItem(item.id, 'size', e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono" placeholder={restaurantData.businessType === 'pharmacy' ? 'Batch' : '--'} />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Rate</label>
                        <input type="number" value={item.mrp === 0 ? '' : item.mrp} onChange={(e) => updateCartItem(item.id, 'mrp', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono" />
                      </div>
                      {restaurantData.businessType !== 'restaurant' && (
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Disc%</label>
                          <input type="number" value={item.discountPercent === 0 ? '' : item.discountPercent} onChange={(e) => updateCartItem(item.id, 'discountPercent', Number(e.target.value))} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-amber-400 focus:outline-none bg-white font-mono" />
                        </div>
                      )}
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
                      <span className={`shrink-0 text-sm font-mono font-black ${restaurantData.businessType === 'pharmacy' ? 'text-teal-600' : 'text-amber-600'}`}>
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
            {acChargeTotal > 0 && (
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>AC Charge ({guests} {guests === 1 ? 'Guest' : 'Guests'})</span>
                <span className="text-gray-800 font-bold font-mono">₹{acChargeTotal.toFixed(2)}</span>
              </div>
            )}
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
            {restaurantData.businessType === 'restaurant' ? (
              <button
                type="button"
                onClick={() => {
                   setToastMessage("KOT Printed to Kitchen!");
                   setTimeout(() => setToastMessage(''), 3000);
                }}
                className="py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 rounded-xl active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print KOT
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2 rounded-xl active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                WhatsApp Bill
              </button>
            )}
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
          {/* WhatsApp Modal */}
          {isWhatsAppModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
              <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-slate-800 mb-1">Send WhatsApp Bill</h3>
                <p className="text-sm text-slate-500 mb-6">Enter customer details to send the digital receipt.</p>
                
                <div className="space-y-4 mb-6 relative">
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Customer Name</label>
                    <input 
                      type="text" 
                      value={customerName} 
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setPartySearchQuery(e.target.value);
                        setShowPartyDropdown(true);
                      }}
                      onFocus={() => setShowPartyDropdown(true)}
                      placeholder="Enter Name" 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium text-gray-800 placeholder:text-gray-400"
                    />
                    
                    {showPartyDropdown && partySearchQuery && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-40 overflow-y-auto p-1">
                        {dbParties
                          .filter(p => p.type === 'customer' && (p.name.toLowerCase().includes(partySearchQuery.toLowerCase()) || p.phone.includes(partySearchQuery)))
                          .map(party => (
                            <div 
                              key={party.id}
                              onClick={() => {
                                handleSelectParty(party);
                                setShowPartyDropdown(false);
                              }}
                              className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-800"
                            >
                              <span className="text-gray-800">{party.name}</span>
                              <span className="text-gray-400 font-mono">{party.phone}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">WhatsApp Number *</label>
                    <input 
                      type="tel" 
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)} 
                      placeholder="e.g. 9876543210" 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-medium font-mono text-gray-800 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsWhatsAppModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsWhatsAppModalOpen(false);
                      handleWhatsAppCheckout();
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-xl text-sm font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Send Bill
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

      {/* Hidden Invoice Template for Image Generation */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0mm; }
          body { margin: 0; padding: 0; background-color: white; }
        }
      `}</style>
      <div className="absolute top-[-9999px] left-[-9999px] print:static print:top-0 print:left-0 print:flex print:justify-center print:w-full">
        {/* Thermal Printer Layout (Always Printed for both Restaurant and Retail) */}
        <div 
          id={restaurantData.businessType === 'restaurant' ? "invoice-capture-element-restaurant" : "invoice-print-element-retail"}
          className={`mx-auto bg-white text-black font-mono text-[13px] leading-tight w-[80mm] print:w-[80mm] ${restaurantData.businessType !== 'restaurant' ? 'hidden print:block' : ''}`}
          style={{ fontFamily: 'monospace', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
            <div className="text-center mb-3">
              <h1 className="font-serif text-2xl font-normal leading-none tracking-wide">{restaurantData.name}</h1>
              <p className="font-serif text-[13px] italic mt-1">{restaurantData.tagline}</p>
              <p className="text-[13px] mt-1.5">MOB : {restaurantData.phone}</p>
              <p className="text-[13px]">GSTIN:{restaurantData.gstin}</p>
            </div>
            
            <div className="border border-black rounded-md p-1.5 mb-2 text-xs leading-relaxed">
              <div className="flex justify-between gap-2">
                <span>Date: {invoiceDate.split('-').reverse().join('/')}</span>
                <span className="text-right">
                  {restaurantData.businessType === 'restaurant' 
                    ? (orderType === 'Dine-In' ? `Dine In: ${selectedTable} (${acType})` : 'Parcel') 
                    : 'Retail Sale'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Cashier: Admin</span>
                <span className="text-right">Bill No.: {invoiceNo}</span>
              </div>
              {restaurantData.businessType === 'restaurant' && (
                <div className="flex justify-between gap-2">
                  <span>Captain: {selectedCaptain === 'Captain' ? 'Self Service' : selectedCaptain}</span>
                </div>
              )}
            </div>
            
            <div className="border border-black mb-2">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-black">
                    <th className="font-normal p-1 border-r border-black uppercase">ITEM</th>
                    <th className="font-normal p-1 border-r border-black text-center uppercase w-10">QTY.</th>
                    <th className="font-normal p-1 border-r border-black text-center uppercase w-[4.5rem]">PRICE</th>
                    <th className="font-normal p-1 text-center uppercase w-[4.5rem]">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.filter(r => r.name.trim() !== '').map((item, index) => (
                    <tr key={index} className="align-top">
                      <td className="p-1 border-r border-black pr-2 leading-snug">{getTranslatedName(item.name)}</td>
                      <td className="p-1 border-r border-black text-center">{item.qty}</td>
                      <td className="p-1 border-r border-black text-right">{item.mrp.toFixed(2)}</td>
                      <td className="p-1 text-right">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between text-[13px] mb-2 px-1">
              <span>Total Qty: {rows.filter(r => r.name.trim() !== '').reduce((s, i) => s + i.qty, 0)}</span>
              <span>Sub Total {subtotal.toFixed(2)}</span>
            </div>
            
            {acChargeTotal > 0 && (
              <div className="flex justify-between text-[13px] mb-2 px-1">
                <span>AC Charge ({guests} {guests === 1 ? 'Guest' : 'Guests'})</span>
                <span>{acChargeTotal.toFixed(2)}</span>
              </div>
            )}
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-[13px] mb-2 px-1">
                <span>Discount</span>
                <span>{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="text-[13px] px-1 mb-2">
              <p>Net Total [inclusive of GST]</p>
              <div className="flex justify-between pl-4 pr-1 mt-0.5">
                <span>CGST@2.5</span>
                <span>2.5%</span>
                <span>{(totalTax / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pl-4 pr-1 mt-0.5">
                <span>SGST@2.5</span>
                <span>2.5%</span>
                <span>{(totalTax / 2).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-black my-1"></div>
            <div className="flex justify-end text-[13px] py-1 pr-1">
              <span>Round off <span className="ml-4">{roundOff.toFixed(2)}</span></span>
            </div>
            
            <div className="border-t border-black my-1"></div>
            <div className="flex justify-between items-center text-lg py-1.5 px-1">
              <span className="font-normal uppercase tracking-wide">GRAND TOTAL</span>
              <span className="font-normal">₹ {grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="border-t border-black my-1"></div>
            <div className="text-center text-[13px] py-1.5">
              <span>Mode of Payment: {paymentMethod}</span>
            </div>
            
            <div className="border-t border-black my-1 mb-2"></div>
            <div className="text-center text-[13px]">
              {restaurantData.gstin && restaurantData.businessType === 'restaurant' && <p>FSSAI Lic No. {restaurantData.gstin}</p>}
              <p className="italic mt-1">THANK YOU !! VISIT AGAIN !!</p>
            </div>
          </div>

        {/* WhatsApp Image Layout (A4 size, NEVER printed, used only by html2canvas for Retail) */}
        {restaurantData.businessType !== 'restaurant' && (
          <div 
            id="invoice-capture-element"
            className="bg-white border border-slate-300 w-[900px] text-slate-800 rounded-[2rem] overflow-hidden p-0 shadow-sm print:hidden"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* Header Section */}
            <div className="flex relative bg-slate-50 border-b border-slate-200">
                {/* Left Deep Blue area */}
               <div style={{background:'#0b1a30',color:'white',padding:'24px 32px',flex:'0.65',borderBottomRightRadius:'4rem',display:'flex',flexDirection:'column',justifyContent:'center',position:'relative',zIndex:10}}>
                   {/* Store name row */}
                   <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
                      <div style={{width:'56px',height:'56px',background:'rgba(255,255,255,0.1)',borderRadius:'16px',padding:'8px',border:'1px solid rgba(255,255,255,0.2)',flexShrink:0}}>
                        <Shirt style={{width:'100%',height:'100%',color:'white'}} />
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
                   <div style={{display:'flex',alignItems:'center',gap:'24px',fontSize:'11px',color:'#cbd5e1',flexWrap:'wrap',wordBreak:'break-word'}}>
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
                             <td className="py-3 px-3 border-r border-slate-100 uppercase">{getTranslatedName(item.name)}</td>
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
        )}
      </div>

    </div>
  );
}
