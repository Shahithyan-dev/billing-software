import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, User, CreditCard, Smartphone, Banknote, MoreHorizontal, SplitSquareHorizontal, PauseCircle, Printer, Pencil, X, ShoppingBag } from 'lucide-react';
import { RESTAURANT_DETAILS } from '../../config/restaurant';
import { MenuManagerModal } from '../../components/MenuManagerModal';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
  type: 'veg' | 'non-veg';
}

const mockMenu: MenuItem[] = [
  { id: '1', name: 'Veg Biryani', price: 220, category: 'Main Course', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '2', name: 'Chicken Biryani', price: 320, category: 'Main Course', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=200&auto=format&fit=crop', type: 'non-veg' },
  { id: '3', name: 'Paneer Butter Masala', price: 280, category: 'Main Course', img: 'https://images.unsplash.com/photo-1605493724641-7890f5df314d?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '4', name: 'Garlic Naan', price: 60, category: 'Starters', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '5', name: 'Butter Naan', price: 50, category: 'Starters', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '6', name: 'Masala Kulcha', price: 80, category: 'Starters', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '7', name: 'Veg Manchurian', price: 180, category: 'Starters', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '8', name: 'Caesar Salad', price: 150, category: 'Starters', img: 'https://images.unsplash.com/photo-1605493724641-7890f5df314d?q=80&w=200&auto=format&fit=crop', type: 'veg' },
  { id: '9', name: 'Cold Coffee', price: 120, category: 'Beverages', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=200&auto=format&fit=crop', type: 'veg' },
];

export const POS = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('servewell_menu');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Fall through to default
      }
    }
    return mockMenu;
  });

  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [billNo, setBillNo] = useState(273);
  const [orderType, setOrderType] = useState<'Dine-In' | 'Parcel'>('Dine-In');
  const [selectedTable, setSelectedTable] = useState('T3');
  const [acType, setAcType] = useState<'AC' | 'Non-AC'>('AC');
  const [selectedSupplier, setSelectedSupplier] = useState('Supplier');
  const suppliers = ['Supplier', 'Swiggy', 'Zomato', 'Direct', 'Uber Eats', 'Dunzo'];

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];
  
  const filteredMenu = menuItems.filter(i => {
    const matchesCategory = activeCategory === 'All' || i.category === activeCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveMenu = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    localStorage.setItem('servewell_menu', JSON.stringify(newItems));
    
    // Also remove items from cart if they were deleted
    setCart(prev => prev.filter(cartItem => newItems.some(item => item.id === cartItem.id)).map(cartItem => {
      // Update price/name if they changed
      const updatedItem = newItems.find(item => item.id === cartItem.id);
      return { ...cartItem, ...updatedItem };
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 0 ? Math.min(20, subtotal) : 0;
  const tax = (subtotal - discount) * 0.05; 
  const rawTotal = subtotal - discount + tax;
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
      if (i.id === id) {
        return { ...i, quantity: i.quantity + delta };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleCharge = () => {
    if (cart.length === 0) return;
    setCart([]);
    setBillNo(prev => prev + 1);
  };

  const handleHoldBill = () => {
    if (cart.length === 0) return;
    alert('Bill put on hold successfully!');
    setCart([]);
  };

  return (
    <>
      <div className="h-full flex flex-col lg:flex-row gap-6 pb-24 lg:pb-4 print:hidden relative">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
             <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-sm border border-[#e3e3df]">
                  <button 
                    onClick={() => setOrderType('Dine-In')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Dine-In' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500 hover:text-[#2c332c]'}`}>
                    Dine-In
                  </button>
                  <button 
                    onClick={() => setOrderType('Parcel')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${orderType === 'Parcel' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500 hover:text-[#2c332c]'}`}>
                    Parcel
                  </button>
                </div>
                {orderType === 'Dine-In' && (
                  <>
                    <select 
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl text-sm font-bold text-[#2c332c] outline-none shadow-sm flex-1 md:flex-none min-w-[100px]"
                    >
                       <option value="T1">Table T1</option>
                       <option value="T2">Table T2</option>
                       <option value="T3">Table T3</option>
                       <option value="T4">Table T4</option>
                       <option value="T5">Table T5</option>
                    </select>
                    <div className="flex bg-gray-100 p-1 rounded-xl shadow-sm border border-[#e3e3df]">
                      <button 
                        onClick={() => setAcType('AC')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${acType === 'AC' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500 hover:text-[#2c332c]'}`}>
                        AC
                      </button>
                      <button 
                        onClick={() => setAcType('Non-AC')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${acType === 'Non-AC' ? 'bg-[#4a7b47] text-white shadow-sm' : 'text-gray-500 hover:text-[#2c332c]'}`}>
                        Non-AC
                      </button>
                    </div>
                  </>
                )}
             </div>
             <div className="flex flex-wrap items-center gap-3">
               <button 
                 onClick={() => setIsMenuManagerOpen(true)}
                 className="bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl text-sm font-bold text-[#4a7b47] hover:bg-gray-50 flex items-center gap-2 shadow-sm order-2 md:order-none"
               >
                 <Pencil className="w-4 h-4" /> Edit Menu
               </button>
               <select 
                 value={selectedSupplier}
                 onChange={(e) => setSelectedSupplier(e.target.value)}
                 className="bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl text-sm font-bold text-[#2c332c] outline-none shadow-sm flex-1 md:flex-none"
               >
                 {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <div className="flex items-center gap-2 bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl shadow-sm justify-between md:justify-start flex-1 md:flex-none">
                 <span className="text-sm font-medium text-muted-foreground">Cashier</span>
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cashier" alt="Cashier" className="w-6 h-6 rounded-full bg-gray-100" />
               </div>
             </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#4a7b47] text-white shadow-md' : 'bg-white text-muted-foreground border border-[#e3e3df] hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Items..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#e3e3df] rounded-xl text-sm focus:outline-none focus:border-[#4a7b47] shadow-sm font-medium"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-100 rounded-lg">
               <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMenu.map(item => (
                <div 
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-[#e3e3df] rounded-[1.25rem] p-2.5 md:p-3 cursor-pointer hover:border-[#4a7b47] hover:shadow-md transition-all group flex flex-col shadow-sm relative overflow-hidden"
                >
                  <div className="w-full h-28 md:h-32 rounded-xl mb-3 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                     <img 
                       src={item.img} 
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                       onError={(e) => {
                         const target = e.currentTarget as HTMLImageElement;
                         if (!target.src.includes('placehold.co')) {
                           target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Food';
                         }
                       }}
                     />
                     <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-md border border-gray-200 flex items-center justify-center shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     </div>
                  </div>
                  <h3 className="font-black text-[15px] text-[#2c332c] leading-tight line-clamp-2">{item.name}</h3>
                  <p className="text-muted-foreground font-bold text-sm mt-1.5">₹{item.price}</p>
                  
                  <button className="absolute bottom-3 right-3 w-8 h-8 bg-[#f9f7f1] text-[#4a7b47] rounded-full flex items-center justify-center shadow-sm hover:bg-[#4a7b47] hover:text-white transition-colors">
                     <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Cart Overlay */}
        <div 
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${isMobileCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
          onClick={() => setIsMobileCartOpen(false)}
        ></div>

        {/* Cart Section / Mobile Drawer */}
        <div className={`
          fixed bottom-0 left-0 right-0 z-50 h-[85vh] bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col p-6 transition-transform duration-300
          lg:relative lg:h-auto lg:w-[420px] lg:shrink-0 lg:rounded-[2rem] lg:border lg:border-[#e3e3df] lg:shadow-sm lg:translate-y-0 lg:z-0
          ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full'}
        `}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#2c332c]">Current Order</h2>
            <div className="flex items-center gap-3">
              <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors" onClick={() => setCart([])}>Clear</button>
              <button className="lg:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors" onClick={() => setIsMobileCartOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                Cart is empty
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-3 items-start border-b border-[#e3e3df] pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#2c332c]">{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">No Onion</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[#2c332c] font-black text-sm">₹{item.price * item.quantity}</p>
                    <div className="flex items-center gap-4 bg-[#f9f7f1] rounded-full p-1.5 px-3 border border-[#e3e3df]">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-500 hover:text-black active:scale-90 transition-transform">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center text-[#2c332c]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-[#4a7b47] hover:text-[#3d663b] active:scale-90 transition-transform">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className="border border-dashed border-[#e3e3df] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 text-muted-foreground">
               <Plus className="w-5 h-5" />
               <span className="text-sm font-bold">Add Item</span>
            </div>
          </div>

          <div className="pt-6 space-y-4 mt-auto">
            <div className="space-y-2">
               <div className="flex justify-between text-sm font-medium text-muted-foreground">
                 <span>Sub Total</span>
                 <span className="text-[#2c332c] font-bold">₹{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm font-medium text-muted-foreground">
                 <span>Discount</span>
                 <span className="text-green-600 font-bold">- ₹{discount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm font-medium text-muted-foreground border-b border-[#e3e3df] pb-4">
                 <span>CGST (5%)</span>
                 <span className="text-[#2c332c] font-bold">₹{tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-xl font-black pt-2">
                 <span>Total</span>
                 <span className="text-[#4a7b47]">₹{total.toFixed(2)}</span>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button 
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 active:scale-95 transition-all border ${paymentMethod === 'CASH' ? 'bg-[#4a7b47]/10 border-[#4a7b47] text-[#4a7b47]' : 'bg-[#f9f7f1] border-[#e3e3df] text-muted-foreground hover:border-[#4a7b47] hover:text-[#4a7b47]'}`}
              >
                 <Banknote className={`w-6 h-6 mb-2 ${paymentMethod === 'CASH' ? 'text-[#4a7b47]' : 'text-gray-500'}`} />
                 <span className="text-[11px] font-bold uppercase">Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 active:scale-95 transition-all border ${paymentMethod === 'CARD' ? 'bg-[#4a7b47]/10 border-[#4a7b47] text-[#4a7b47]' : 'bg-[#f9f7f1] border-[#e3e3df] text-muted-foreground hover:border-[#4a7b47] hover:text-[#4a7b47]'}`}
              >
                 <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'CARD' ? 'text-[#4a7b47]' : 'text-gray-500'}`} />
                 <span className="text-[11px] font-bold uppercase">Card</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 active:scale-95 transition-all border ${paymentMethod === 'UPI' ? 'bg-[#4a7b47]/10 border-[#4a7b47] text-[#4a7b47]' : 'bg-[#f9f7f1] border-[#e3e3df] text-muted-foreground hover:border-[#4a7b47] hover:text-[#4a7b47]'}`}
              >
                 <Smartphone className={`w-6 h-6 mb-2 ${paymentMethod === 'UPI' ? 'text-[#4a7b47]' : 'text-gray-500'}`} />
                 <span className="text-[11px] font-bold uppercase">UPI</span>
              </button>
            </div>

            <div className="flex gap-2 mb-2">
               <button onClick={() => alert('Split Bill functionality opening...')} className="flex-1 flex gap-2 items-center justify-center bg-white border border-[#e3e3df] text-[#2c332c] font-bold text-sm py-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
                  <SplitSquareHorizontal className="w-4 h-4" /> Split Bill
               </button>
               <button onClick={handleHoldBill} className="flex-1 flex gap-2 items-center justify-center bg-white border border-[#e3e3df] text-[#2c332c] font-bold text-sm py-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
                  <PauseCircle className="w-4 h-4" /> Hold Bill
               </button>
            </div>
            
            <button 
              onClick={() => { 
                if (cart.length === 0) return;
                window.print(); 
                setTimeout(() => handleCharge(), 500); 
                setIsMobileCartOpen(false);
              }} 
              className="w-full flex items-center justify-center gap-2 bg-[#4a7b47] text-white text-xl font-bold py-4 rounded-2xl shadow-md hover:bg-[#3d663b] active:scale-95 transition-all mt-2"
            >
               <Printer className="w-6 h-6" /> Print Bill
            </button>
          </div>
        </div>

        {/* Mobile Sticky Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e3e3df] p-4 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-30 flex items-center justify-between pb-safe">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-muted-foreground">{cart.length} {cart.length === 1 ? 'Item' : 'Items'}</span>
            <span className="text-xl font-black text-[#2c332c]">₹{total.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-[#4a7b47] text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-[#3d663b] active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" /> View Cart
          </button>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: white; width: 80mm; }
        `}
      </style>
      <div className="hidden print:block w-full text-black font-mono text-[13px] p-2 bg-white leading-tight">
        <div className="text-center mb-3">
          <h1 className="font-serif text-2xl font-normal leading-none tracking-wide">{RESTAURANT_DETAILS.name}</h1>
          <p className="font-serif text-[13px] italic mt-1">{RESTAURANT_DETAILS.tagline}</p>
          <p className="text-[13px] mt-1.5">MOB : {RESTAURANT_DETAILS.phone}</p>
          <p className="text-[13px]">GSTIN:{RESTAURANT_DETAILS.gstin}</p>
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
          {selectedSupplier !== 'Supplier' && (
            <div className="flex justify-between gap-2">
              <span>Supplier: {selectedSupplier}</span>
            </div>
          )}
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
        
        <div className="text-[13px] px-1 mb-2">
          <p>Net Total [inclusive of GST]</p>
          <div className="flex justify-between pl-4 pr-1 mt-0.5">
            <span>CGST@2.5</span>
            <span>2.5%</span>
            <span>{(tax / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between pl-4 pr-1 mt-0.5">
            <span>SGST@2.5</span>
            <span>2.5%</span>
            <span>{(tax / 2).toFixed(2)}</span>
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
          <p>FSSAI Lic No. {RESTAURANT_DETAILS.fssai}</p>
          <p className="italic mt-1">THANK YOU !! VISIT AGAIN !!</p>
        </div>
      </div>
      
      <MenuManagerModal 
        isOpen={isMenuManagerOpen} 
        onClose={() => setIsMenuManagerOpen(false)} 
        menuItems={menuItems}
        onSave={handleSaveMenu}
      />
    </>
  );
};
