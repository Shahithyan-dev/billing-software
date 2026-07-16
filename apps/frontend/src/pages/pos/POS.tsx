import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, User, CreditCard, Smartphone, Banknote, MoreHorizontal, SplitSquareHorizontal, PauseCircle, Printer } from 'lucide-react';

interface MenuItem {
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
  const [cart, setCart] = useState<(MenuItem & { quantity: number })[]>([
    { ...mockMenu[1], quantity: 1 },
    { ...mockMenu[2], quantity: 1 },
    { ...mockMenu[3], quantity: 2 },
    { ...mockMenu[8], quantity: 1 },
  ]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [billNo, setBillNo] = useState(273);
  const [orderType, setOrderType] = useState<'Dine-In' | 'Parcel'>('Dine-In');
  const [selectedTable, setSelectedTable] = useState('T3');
  const [acType, setAcType] = useState<'AC' | 'Non-AC'>('AC');
  const [selectedSupplier, setSelectedSupplier] = useState('Supplier');
  const suppliers = ['Supplier', 'Swiggy', 'Zomato', 'Direct', 'Uber Eats', 'Dunzo'];

  const categories = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts'];
  const filteredMenu = activeCategory === 'All' ? mockMenu : mockMenu.filter(i => i.category === activeCategory);

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
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
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
      <div className="h-full flex gap-6 pb-4 print:hidden">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
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
                      className="bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl text-sm font-bold text-[#2c332c] outline-none shadow-sm"
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
             <div className="flex items-center gap-3">
               <select 
                 value={selectedSupplier}
                 onChange={(e) => setSelectedSupplier(e.target.value)}
                 className="bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl text-sm font-bold text-[#2c332c] outline-none shadow-sm"
               >
                 {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <div className="flex items-center gap-2 bg-white border border-[#e3e3df] px-3 py-1.5 rounded-xl shadow-sm">
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
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#4a7b47] text-white shadow-md' : 'bg-white text-muted-foreground border border-[#e3e3df] hover:bg-gray-50'}`}
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
                  className="bg-white border border-[#e3e3df] rounded-2xl p-3 cursor-pointer hover:border-[#4a7b47] hover:shadow-md transition-all group flex flex-col shadow-sm relative overflow-hidden"
                >
                  <div className="w-full h-32 rounded-xl mb-3 overflow-hidden relative">
                     <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-sm border border-gray-200 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     </div>
                  </div>
                  <h3 className="font-bold text-sm text-[#2c332c] line-clamp-1">{item.name}</h3>
                  <p className="text-muted-foreground font-medium text-xs mt-1">₹{item.price}</p>
                  
                  <button className="absolute bottom-3 right-3 w-8 h-8 bg-[#4a7b47] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#3d663b]">
                     <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-[420px] flex flex-col bg-white rounded-[2rem] border border-[#e3e3df] shadow-sm overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-[#2c332c]">Current Order</h2>
            <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors" onClick={() => setCart([])}>Clear All</button>
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
              }} 
              className="w-full flex items-center justify-center gap-2 bg-[#4a7b47] text-white text-xl font-bold py-4 rounded-2xl shadow-md hover:bg-[#3d663b] active:scale-95 transition-all mt-2"
            >
               <Printer className="w-6 h-6" /> Print Bill
            </button>
          </div>
        </div>
      </div>

      <style type="text/css" media="print">
        {`
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: white; width: 80mm; }
        `}
      </style>
      <div className="hidden print:block w-full text-black font-mono text-xs p-2 bg-white leading-tight">
        <div className="text-center mb-1">
          <h1 className="font-bold text-lg">SERVEWELL RESTAURANT</h1>
          <p className="font-bold">SINCE 2024</p>
          <p className="font-bold">MOB : 9876543210</p>
          <p className="font-bold">GSTIN:33AABCU9603R1Z2</p>
        </div>
        
        <div className="border-t border-black my-1"></div>
        
        <div className="flex justify-between mt-1">
          <span>Date: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          <span className="font-bold">{orderType === 'Dine-In' ? `Dine In: ${selectedTable} (${acType})` : 'Parcel'}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Cashier: Admin</span>
          <span>Bill No.: DR{billNo}</span>
        </div>
        {selectedSupplier !== 'Supplier' && (
          <div className="mt-1">
            <span>Supplier: {selectedSupplier}</span>
          </div>
        )}
        
        <div className="border-t border-black my-1 mt-2"></div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left font-normal pb-1">Item</th>
              <th className="text-right font-normal pb-1 w-8 pr-3">Qty.</th>
              <th className="text-right font-normal pb-1 w-14">Price</th>
              <th className="text-right font-normal pb-1 w-16">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index} className="align-top">
                <td className="py-1 pr-1">{item.name}</td>
                <td className="text-right py-1 pr-3">{item.quantity}</td>
                <td className="text-right py-1">{item.price.toFixed(2)}</td>
                <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="border-t border-black my-1"></div>
        
        <div className="flex justify-between text-sm py-1">
          <span>Total Qty: {cart.reduce((s, i) => s + i.quantity, 0)}</span>
          <span>Sub Total {(subtotal - discount).toFixed(2)}</span>
        </div>
        
        <p className="text-sm">Net Total [inclusive of GST]</p>
        <div className="flex justify-between text-sm pl-4 pr-1">
          <span>CGST@2.5</span>
          <span>2.5%</span>
          <span>{(tax / 2).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm pl-4 pr-1">
          <span>SGST@2.5</span>
          <span>2.5%</span>
          <span>{(tax / 2).toFixed(2)}</span>
        </div>
        
        <div className="border-t border-black my-1"></div>
        
        <div className="flex justify-between text-sm py-1">
          <span></span>
          <span>Round off <span className="ml-4">{roundOff > 0 ? '+' : ''}{roundOff.toFixed(2)}</span></span>
        </div>
        
        <div className="text-center font-bold text-xl my-2">
          <span>Grand Total ₹ {total.toFixed(2)}</span>
        </div>
        
        <div className="text-center font-bold text-sm mb-2">
          <span>Mode of Payment: {paymentMethod}</span>
        </div>
        
        <div className="border-t border-black my-1 mb-2"></div>
        
        <div className="text-center font-bold text-sm">
          <p>FSSAI Lic No. 12418003004166</p>
          <p>THANK YOU !! VISIT AGAIN !!</p>
        </div>
      </div>
    </>
  );
};
