"use client";

import { API_BASE_URL } from '@/config/api';
import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, MoreHorizontal, Printer, Pencil, X, Heart, ShoppingBag, Home, UtensilsCrossed, LayoutGrid } from 'lucide-react';
import { MenuManagerModal } from '@/components/MenuManagerModal';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
  type: 'veg' | 'non-veg';
}

const mockMenu: MenuItem[] = [
  { id: '1', name: 'Idli Sambar', price: 60, category: 'Breakfast', img: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '2', name: 'Masala Dosa', price: 80, category: 'Breakfast', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '3', name: 'Veg Thali', price: 220, category: 'Lunch', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '4', name: 'Chicken Biryani', price: 320, category: 'Lunch', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=400&auto=format&fit=crop', type: 'non-veg' },
  { id: '5', name: 'Paneer Butter Masala', price: 280, category: 'Dinner', img: 'https://images.unsplash.com/photo-1605493724641-7890f5df314d?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '6', name: 'Garlic Naan', price: 60, category: 'Dinner', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '7', name: 'Veg Manchurian', price: 160, category: 'Snacks', img: 'https://images.unsplash.com/photo-1626201850129-a5b74f1f7c42?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '8', name: 'Veg Fried Rice', price: 150, category: 'Dinner', img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '9', name: 'Dal Tadka', price: 120, category: 'Dinner', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop', type: 'veg' },
  { id: '10', name: 'Cold Coffee', price: 120, category: 'Beverages', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&auto=format&fit=crop', type: 'veg' },
];

const getCurrentTimeSlot = () => {
  if (typeof window === 'undefined') return 'All';
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'Breakfast';
  if (hour >= 12 && hour < 17) return 'Lunch';
  if (hour >= 17 && hour <= 23) return 'Dinner';
  return 'All';
};

// Mobile bottom navigation tab type
type MobileTab = 'menu' | 'orders' | 'tables' | 'more';

const POS = () => {
  const dbMenuItems = useLiveQuery(() => db.menuItems.toArray(), []);

  React.useEffect(() => {
    const initMenu = async () => {
      const count = await db.menuItems.count();
      if (count === 0) {
        let initialMenu = mockMenu;
        if (typeof window !== 'undefined') {
          const restId = localStorage.getItem('restaurantId');
          const storedMenu = localStorage.getItem(`servewell_menu_${restId}`);
          if (storedMenu) {
            try {
              const parsedMenu = JSON.parse(storedMenu);
              if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
                initialMenu = parsedMenu;
              }
            } catch (e) {
              console.error("Failed to parse stored menu", e);
            }
          }
        }
        await db.menuItems.bulkPut(initialMenu);
      }
    };
    initMenu();
  }, []);

  const menuItems = dbMenuItems || mockMenu;

  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('menu');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [restaurantData, setRestaurantData] = useState({
    name: "ServeWell",
    tagline: "",
    phone: "",
    gstin: "",
    fssai: "",
    logo: "/logo.png",
    diningAreas: ["AC", "Non-AC"],
    menuCategories: ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"]
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('servewell_restaurant_details');
      if (stored) setRestaurantData(JSON.parse(stored));

      const restId = localStorage.getItem('restaurantId');
      if (restId) {
        fetch(`${API_BASE_URL}/api/v1/restaurants/${restId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const freshData = {
                name: data.data.name || 'ServeWell',
                tagline: data.data.tagline || '',
                phone: data.data.phone || '',
                gstin: data.data.gstin || '',
                fssai: data.data.fssai || '',
                logo: data.data.logo || '/logo.png',
                diningAreas: data.data.diningAreas || ["AC", "Non-AC"],
                menuCategories: data.data.menuCategories || ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"]
              };
              setRestaurantData(freshData);
              localStorage.setItem('servewell_restaurant_details', JSON.stringify(freshData));
            }
          })
          .catch(err => console.error("Failed to fetch latest restaurant data", err));
      }
    }
  }, []);

  const lastTimeSlotRef = React.useRef(getCurrentTimeSlot());
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentSlot = getCurrentTimeSlot();
      if (currentSlot !== lastTimeSlotRef.current) {
        lastTimeSlotRef.current = currentSlot;
        setActiveCategory(currentSlot);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  React.useEffect(() => {
    setActiveCategory(getCurrentTimeSlot());
  }, []);

  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [billNo, setBillNo] = useState(1);
  const [orderType, setOrderType] = useState<'Dine-In' | 'Parcel'>('Dine-In');
  const [selectedTable, setSelectedTable] = useState('T3');
  const [acType, setAcType] = useState<string>('AC');
  const [selectedCaptain, setSelectedCaptain] = useState('Captain');
  const [captains, setCaptains] = useState<string[]>(['Captain', 'Rahul', 'Priya', 'Self Service']);
  const [tables, setTables] = useState<string[]>(['T1', 'T2', 'T3', 'T4', 'T5', 'Parcel', 'Delivery']);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCaptains = localStorage.getItem('servewell_captains');
      if (storedCaptains) setCaptains(JSON.parse(storedCaptains));

      const storedTables = localStorage.getItem('servewell_tables');
      if (storedTables) {
        const parsedTables = JSON.parse(storedTables);
        setTables(Array.from(new Set([...parsedTables, 'Parcel', 'Delivery'])));
      }

      const storedRestaurant = localStorage.getItem('servewell_restaurant_details');
      if (storedRestaurant) {
        const parsed = JSON.parse(storedRestaurant);
        if (parsed.diningAreas && parsed.diningAreas.length > 0) {
          setAcType(parsed.diningAreas[0]);
        }
      }
    }
  }, []);

  const coreCategories = restaurantData.menuCategories && restaurantData.menuCategories.length > 0
    ? restaurantData.menuCategories
    : ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'];
  const categories = Array.from(new Set(['All', ...coreCategories, ...menuItems.map(i => i.category)]));

  const filteredMenu = menuItems.filter(i => {
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveMenu = async (newItems: MenuItem[]) => {
    await db.menuItems.clear();
    await db.menuItems.bulkPut(newItems);
    setCart(prev => prev.filter(cartItem => newItems.some(item => item.id === cartItem.id)).map(cartItem => {
      const updatedItem = newItems.find(item => item.id === cartItem.id);
      return { ...cartItem, ...updatedItem };
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 0 ? Math.min(30, Math.floor(subtotal * 0.05)) : 0;
  const acCharge = (orderType === 'Dine-In' && acType.toUpperCase().includes('AC') && !acType.toUpperCase().includes('NON')) ? (subtotal - discount) * 0.02 : 0;
  const tax = (subtotal - discount + acCharge) * 0.05;
  const rawTotal = subtotal - discount + acCharge + tax;
  const total = Math.round(rawTotal);
  const roundOff = total - rawTotal;

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) return { ...i, quantity: i.quantity + delta };
      return i;
    }).filter(i => i.quantity > 0));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCharge = async () => {
    if (cart.length === 0) return;
    const newOrder = {
      uuid: crypto.randomUUID(),
      restaurantId: (restaurantData as any).id || 'default_restaurant',
      items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })),
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      orderType,
      timestamp: Date.now(),
      syncStatus: 'pending' as const
    };
    try {
      await db.orders.add(newOrder);
    } catch (e) {
      console.error('Failed to save order offline:', e);
    }
    setCart([]);
    setBillNo(prev => prev + 1);
  };

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ─── Menu Card Component (Desktop Grid) ───────────────────────────────────
  const MenuCard = ({ item }: { item: MenuItem }) => {
    const inCart = cart.find(i => i.id === item.id);
    return (
      <div
        onClick={() => addToCart(item)}
        className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border border-[#e8e8e4] group relative flex flex-col"
      >
        {/* Image */}
        <div className="relative w-full h-36 overflow-hidden bg-gray-100">
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (!t.src.includes('placehold.co')) t.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Food';
            }}
          />
          {/* Veg / Non-veg indicator */}
          <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded border-2 border-gray-300 flex items-center justify-center shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          {/* Heart */}
          <button
            onClick={(e) => toggleFavorite(item.id, e)}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
          {/* In-cart badge */}
          {inCart && (
            <div className="absolute bottom-2 left-2 bg-[#4a7b47] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              x{inCart.quantity}
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <h3 className="font-bold text-[13px] text-[#1a2318] leading-tight line-clamp-2">{item.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="font-black text-[#1a2318] text-sm">₹{item.price}</p>
            <button
              className="w-7 h-7 bg-[#4a7b47] text-white rounded-full flex items-center justify-center shadow hover:bg-[#3d663b] active:scale-90 transition-all"
              onClick={(e) => { e.stopPropagation(); addToCart(item); }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Mobile Menu List Item ────────────────────────────────────────────────
  const MobileMenuItem = ({ item }: { item: MenuItem }) => {
    const inCart = cart.find(i => i.id === item.id);
    return (
      <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-[#e8e8e4] shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center shrink-0">
              <div className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <h3 className="font-bold text-[13px] text-[#1a2318] line-clamp-1">{item.name}</h3>
          </div>
          <p className="font-black text-[#1a2318] text-sm ml-5">₹{item.price}</p>
        </div>
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              if (!t.src.includes('placehold.co')) t.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Food';
            }}
          />
        </div>
        <button
          onClick={() => addToCart(item)}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow transition-all active:scale-90 ${inCart ? 'bg-[#4a7b47]' : 'bg-[#4a7b47]'}`}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    );
  };

  // ─── Order Panel (shared desktop + mobile cart view) ─────────────────────
  const OrderPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-black text-[#1a2318]">Current Order</h2>
        <div className="flex items-center gap-2">
          <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors" onClick={() => setCart([])}>Clear All</button>
          {onClose && (
            <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground py-12">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-bold">Cart is empty</p>
            <p className="text-xs text-center">Add items from the menu</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-[13px] text-[#1a2318] line-clamp-1">{item.name}</h4>
                <p className="text-xs text-muted-foreground font-medium">₹{item.price}</p>
              </div>
              {/* Qty controls */}
              <div className="flex items-center gap-2 bg-[#f5f5f0] rounded-full px-2 py-1 border border-[#e3e3df]">
                <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-black transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-black text-[#1a2318] w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-[#4a7b47] hover:text-[#3d663b] transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <p className="font-black text-[13px] text-[#1a2318] w-12 text-right">₹{item.price * item.quantity}</p>
              <button onClick={() => updateQuantity(item.id, -item.quantity)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + Payment */}
      <div className="pt-4 mt-4 border-t border-[#e8e8e4] space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold text-[#1a2318]">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="font-medium">Discount</span>
            <span className="font-bold text-green-600">- ₹{discount.toFixed(2)}</span>
          </div>
          {acCharge > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="font-medium">AC Charge (2%)</span>
              <span className="font-bold text-[#1a2318]">₹{acCharge.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-muted-foreground pb-3 border-b border-[#e8e8e4]">
            <span className="font-medium">GST (5%)</span>
            <span className="font-bold text-[#1a2318]">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-lg font-black text-[#1a2318]">Total</span>
            <span className="text-2xl font-black text-[#4a7b47]">₹{total}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'CASH', label: 'Cash', icon: Banknote },
            { key: 'CARD', label: 'Card', icon: CreditCard },
            { key: 'UPI', label: 'UPI', icon: Smartphone },
            { key: 'MORE', label: 'More', icon: MoreHorizontal },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPaymentMethod(key)}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                paymentMethod === key
                  ? 'bg-[#4a7b47]/10 border-[#4a7b47] text-[#4a7b47]'
                  : 'bg-[#f9f7f1] border-[#e3e3df] text-gray-500 hover:border-[#4a7b47] hover:text-[#4a7b47]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Print Bill */}
        <button
          onClick={() => {
            if (cart.length === 0) return;
            setIsPreviewOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#4a7b47] text-white text-base font-black py-3.5 rounded-2xl shadow-lg hover:bg-[#3d663b] active:scale-95 transition-all"
        >
          <Printer className="w-5 h-5" />
          Print Bill
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex h-full gap-5">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Order type */}
              <div className="flex bg-gray-100 p-1 rounded-xl border border-[#e3e3df]">
                <button
                  onClick={() => setOrderType('Dine-In')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Dine-In' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500'}`}
                >
                  Dine-In
                </button>
                <button
                  onClick={() => setOrderType('Parcel')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Parcel' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500'}`}
                >
                  Parcel
                </button>
              </div>
              {orderType === 'Dine-In' && (
                <>
                  <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                    <select className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                      {tables.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-xl border border-[#e3e3df]">
                    {restaurantData.diningAreas.map(area => (
                      <button key={area} onClick={() => setAcType(area)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${acType === area ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500'}`}>
                        {area}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search menu or items..."
                  className="pl-9 pr-4 py-2 bg-white border border-[#e3e3df] rounded-xl text-sm focus:outline-none focus:border-[#4a7b47] font-medium w-52"
                />
              </div>
              <button
                onClick={() => setIsMenuManagerOpen(true)}
                className="bg-white border border-[#e3e3df] px-3 py-2 rounded-xl text-sm font-bold text-[#4a7b47] hover:bg-gray-50 flex items-center gap-2 shadow-sm"
              >
                <Pencil className="w-4 h-4" /> Edit Menu
              </button>
              <select
                value={selectedCaptain}
                onChange={e => setSelectedCaptain(e.target.value)}
                className="bg-white border border-[#e3e3df] px-3 py-2 rounded-xl text-sm font-bold text-[#2c332c] outline-none shadow-sm"
              >
                {captains.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#4a7b47] text-white shadow-md'
                    : 'bg-white text-muted-foreground border border-[#e3e3df] hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto pr-1 pb-4">
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredMenu.map(item => <MenuCard key={item.id} item={item} />)}
            </div>
          </div>
        </div>

        {/* Order Panel */}
        <div className="w-[340px] xl:w-[380px] shrink-0 bg-white border border-[#e8e8e4] rounded-2xl p-5 flex flex-col h-[calc(100vh-120px)] shadow-sm">
          <OrderPanel />
        </div>
      </div>

      {/* ── MOBILE LAYOUT (<lg) ──────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col h-full">
        {/* Controls Row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-[#e3e3df]">
            <button onClick={() => setOrderType('Dine-In')} className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Dine-In' ? 'bg-[#4a7b47] text-white' : 'text-gray-500'}`}>
              Dine-In
            </button>
            <button onClick={() => setOrderType('Parcel')} className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Parcel' ? 'bg-[#4a7b47] text-white' : 'text-gray-500'}`}>
              Parcel
            </button>
          </div>
          {orderType === 'Dine-In' && (
            <>
              <div className="bg-gray-100 px-2.5 py-1.5 rounded-xl border border-gray-200">
                <select className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                  {tables.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {restaurantData.diningAreas.slice(0, 2).map(area => (
                <button key={area} onClick={() => setAcType(area)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${acType === area ? 'bg-[#4a7b47] text-white border-[#4a7b47]' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {area}
                </button>
              ))}
            </>
          )}
          <button onClick={() => setIsMenuManagerOpen(true)} className="ml-auto bg-white border border-[#e3e3df] p-2 rounded-xl shadow-sm">
            <Pencil className="w-4 h-4 text-[#4a7b47]" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat ? 'bg-[#4a7b47] text-white shadow-md' : 'bg-white text-muted-foreground border border-[#e3e3df]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search menu or items..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e3e3df] rounded-xl text-sm focus:outline-none focus:border-[#4a7b47] font-medium"
          />
        </div>

        {/* Mobile Content by Tab */}
        {mobileTab === 'menu' && (
          <div className="flex-1 overflow-y-auto space-y-2.5 pb-36">
            {filteredMenu.map(item => <MobileMenuItem key={item.id} item={item} />)}
          </div>
        )}

        {mobileTab === 'orders' && (
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#e8e8e4] p-5 pb-36 shadow-sm">
            <OrderPanel />
          </div>
        )}

        {mobileTab === 'tables' && (
          <div className="flex-1 overflow-y-auto pb-36">
            <div className="grid grid-cols-3 gap-3">
              {tables.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`py-6 rounded-2xl font-black text-lg border-2 transition-all ${selectedTable === t ? 'bg-[#4a7b47] text-white border-[#4a7b47]' : 'bg-white text-[#1a2318] border-[#e8e8e4]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {mobileTab === 'more' && (
          <div className="flex-1 overflow-y-auto pb-36 space-y-3">
            <button onClick={() => setIsMenuManagerOpen(true)} className="w-full flex items-center gap-4 bg-white border border-[#e8e8e4] rounded-2xl p-4 shadow-sm">
              <Pencil className="w-5 h-5 text-[#4a7b47]" />
              <span className="font-bold text-[#1a2318]">Edit Menu</span>
            </button>
            <div className="bg-white border border-[#e8e8e4] rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-bold text-muted-foreground mb-2">Captain</p>
              <select value={selectedCaptain} onChange={e => setSelectedCaptain(e.target.value)} className="w-full bg-transparent text-base font-bold text-[#1a2318] focus:outline-none">
                {captains.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Mobile Bottom Sticky */}
        {cart.length > 0 && mobileTab === 'menu' && (
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-[#e8e8e4] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30">
            <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-medium">
              <span>Total ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground font-medium">
              <span>Discount</span>
              <span className="text-green-600">- ₹{discount}</span>
            </div>
            <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground font-medium">
              <span>GST (5%)</span>
              <span>₹{Math.round(tax)}</span>
            </div>
            <button
              onClick={() => setMobileTab('orders')}
              className="w-full bg-[#4a7b47] text-white font-black py-3.5 rounded-2xl shadow-lg hover:bg-[#3d663b] active:scale-95 transition-all text-base flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Pay ₹{total}
            </button>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e8e4] z-40 flex">
          {[
            { key: 'menu' as MobileTab, label: 'Menu', icon: LayoutGrid },
            { key: 'orders' as MobileTab, label: 'Orders', icon: ShoppingBag, badge: cartCount },
            { key: 'tables' as MobileTab, label: 'Tables', icon: UtensilsCrossed },
            { key: 'more' as MobileTab, label: 'More', icon: MoreHorizontal },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-colors ${mobileTab === key ? 'text-[#4a7b47]' : 'text-gray-400'}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#4a7b47] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">{label}</span>
              {mobileTab === key && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#4a7b47] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRINT STYLES ─────────────────────────────────────────────────────── */}
      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: white; width: 80mm; }
          .print-preview-modal { display: none !important; }
        `}
      </style>

      {/* ── PRINTABLE BILL ────────────────────────────────────────────────────── */}
      <div id="print-bill-content" className="hidden print:block w-full text-black font-mono text-[13px] p-2 bg-white leading-tight">
        <div className="text-center mb-3">
          <h1 className="font-serif text-2xl font-normal leading-none tracking-wide">{restaurantData.name}</h1>
          <p className="font-serif text-[13px] italic mt-1">{restaurantData.tagline}</p>
          <p className="text-[13px] mt-1.5">MOB : {restaurantData.phone}</p>
          <p className="text-[13px]">GSTIN:{restaurantData.gstin}</p>
        </div>
        <div className="border border-black rounded-md p-1.5 mb-2 text-xs leading-relaxed">
          <div className="flex justify-between gap-2">
            <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <span className="text-right">{orderType === 'Dine-In' ? `Dine In: ${selectedTable} (${acType})` : 'Parcel'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Cashier: Admin</span>
            <span className="text-right">Bill No.: DR{billNo}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Captain: {selectedCaptain === 'Captain' ? 'Self Service' : selectedCaptain}</span>
          </div>
        </div>
        <div className="border border-black mb-2">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="border-b border-black">
                <th className="font-normal p-1 border-r border-black uppercase">ITEM</th>
                <th className="font-normal p-1 border-r border-black text-center uppercase w-10">QTY.</th>
                <th className="font-normal p-1 border-r border-black text-center uppercase w-[4.5rem]">PRICE (₹)</th>
                <th className="font-normal p-1 text-center uppercase w-[4.5rem]">AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="p-1 border-r border-black pr-2 leading-snug">{item.name}</td>
                  <td className="p-1 border-r border-black text-center">{item.quantity}</td>
                  <td className="p-1 border-r border-black text-right">{item.price.toFixed(2)}</td>
                  <td className="p-1 text-right">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between text-[13px] mb-2 px-1">
          <span>Total Qty: {cart.reduce((s, i) => s + i.quantity, 0)}</span>
          <span>Sub Total {(subtotal - discount).toFixed(2)}</span>
        </div>
        {acCharge > 0 && (
          <div className="flex justify-between text-[13px] mb-2 px-1">
            <span>AC Charge (2%)</span>
            <span>{acCharge.toFixed(2)}</span>
          </div>
        )}
        <div className="text-[13px] px-1 mb-2">
          <p>Net Total [inclusive of GST]</p>
          <div className="flex justify-between pl-4 pr-1 mt-0.5">
            <span>CGST@2.5</span><span>2.5%</span><span>{(tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between pl-4 pr-1 mt-0.5">
            <span>SGST@2.5</span><span>2.5%</span><span>{(tax / 2).toFixed(2)}</span>
          </div>
        </div>
        <div className="border-t border-black my-1"></div>
        <div className="flex justify-end text-[13px] py-1 pr-1">
          <span>Round off <span className="ml-4">{roundOff.toFixed(2)}</span></span>
        </div>
        <div className="border-t border-black my-1"></div>
        <div className="flex justify-between items-center text-lg py-1.5 px-1">
          <span className="font-normal uppercase tracking-wide">GRAND TOTAL</span>
          <span className="font-normal">₹ {total.toFixed(2)}</span>
        </div>
        <div className="border-t border-black my-1"></div>
        <div className="text-center text-[13px] py-1.5">
          <span>Mode of Payment: {paymentMethod}</span>
        </div>
        <div className="border-t border-black my-1 mb-2"></div>
        <div className="text-center text-[13px]">
          {restaurantData.fssai && <p>FSSAI Lic No. {restaurantData.fssai}</p>}
          <p className="italic mt-1">THANK YOU !! VISIT AGAIN !!</p>
        </div>
      </div>

      <MenuManagerModal
        isOpen={isMenuManagerOpen}
        onClose={() => setIsMenuManagerOpen(false)}
        menuItems={menuItems}
        onSave={handleSaveMenu}
      />

      {/* Print Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center print:items-start print:justify-start print:static print:z-auto print-preview-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="bg-white border border-[#e3e3df] rounded-2xl shadow-2xl z-10 w-full max-w-[420px] max-h-[90vh] flex flex-col m-4 overflow-hidden animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none print:m-0 print:max-h-none print:h-auto print:w-full print:max-w-none">
            <div className="p-4 border-b border-[#e3e3df] flex justify-between items-center bg-gray-50 print:hidden">
              <h2 className="text-lg font-bold text-[#2c332c] flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#4a7b47]" /> Print Preview
              </h2>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100 print:overflow-visible print:p-0 print:bg-white">
              <div className="mx-auto bg-white shadow-md text-black font-mono text-[13px] p-4 leading-tight w-[80mm] min-h-[300px] print:shadow-none print:w-[80mm]">
                <div className="text-center mb-3">
                  <h1 className="font-serif text-2xl font-normal leading-none tracking-wide">{restaurantData.name}</h1>
                  <p className="font-serif text-[13px] italic mt-1">{restaurantData.tagline}</p>
                  <p className="text-[13px] mt-1.5">MOB : {restaurantData.phone}</p>
                  <p className="text-[13px]">GSTIN:{restaurantData.gstin}</p>
                </div>
                <div className="border border-black rounded-md p-1.5 mb-2 text-xs leading-relaxed">
                  <div className="flex justify-between gap-2">
                    <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    <span className="text-right">{orderType === 'Dine-In' ? `Dine In: ${selectedTable} (${acType})` : 'Parcel'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Cashier: Admin</span>
                    <span className="text-right">Bill No.: {billNo}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Captain: {selectedCaptain === 'Captain' ? 'Self Service' : selectedCaptain}</span>
                  </div>
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
                      {cart.map((item, index) => (
                        <tr key={index} className="align-top">
                          <td className="p-1 border-r border-black pr-2 leading-snug">{item.name}</td>
                          <td className="p-1 border-r border-black text-center">{item.quantity}</td>
                          <td className="p-1 border-r border-black text-right">{item.price.toFixed(2)}</td>
                          <td className="p-1 text-right">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between text-[13px] mb-2 px-1">
                  <span>Total Qty: {cart.reduce((s, i) => s + i.quantity, 0)}</span>
                  <span>Sub Total {(subtotal - discount).toFixed(2)}</span>
                </div>
                {acCharge > 0 && (
                  <div className="flex justify-between text-[13px] mb-2 px-1">
                    <span>AC Charge (2%)</span><span>{acCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="text-[13px] px-1 mb-2">
                  <p>Net Total [inclusive of GST]</p>
                  <div className="flex justify-between pl-4 pr-1 mt-0.5">
                    <span>CGST@2.5</span><span>2.5%</span><span>{(tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pl-4 pr-1 mt-0.5">
                    <span>SGST@2.5</span><span>2.5%</span><span>{(tax / 2).toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-black my-1"></div>
                <div className="flex justify-end text-[13px] py-1 pr-1">
                  <span>Round off <span className="ml-4">{roundOff.toFixed(2)}</span></span>
                </div>
                <div className="border-t border-black my-1"></div>
                <div className="flex justify-between items-center text-lg py-1.5 px-1">
                  <span className="font-normal uppercase tracking-wide">GRAND TOTAL</span>
                  <span className="font-normal">₹ {total.toFixed(2)}</span>
                </div>
                <div className="border-t border-black my-1"></div>
                <div className="text-center text-[13px] py-1.5">
                  <span>Mode of Payment: {paymentMethod}</span>
                </div>
                <div className="border-t border-black my-1 mb-2"></div>
                <div className="text-center text-[13px]">
                  {restaurantData.fssai && <p>FSSAI Lic No. {restaurantData.fssai}</p>}
                  <p className="italic mt-1">THANK YOU !! VISIT AGAIN !!</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#e3e3df] flex gap-3 bg-white print:hidden">
              <button onClick={() => setIsPreviewOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).require) {
                    try {
                      const { ipcRenderer } = (window as any).require('electron');
                      ipcRenderer.send('print-bill');
                    } catch (e) {
                      window.print();
                    }
                  } else {
                    window.print();
                  }
                  setTimeout(() => handleCharge(), 500);
                  setIsPreviewOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#4a7b47] hover:bg-[#3d663b] shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Printer className="w-5 h-5" /> Print Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POS;
