"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ChefHat, Store, Smartphone, Printer, Monitor, 
  CreditCard, CheckCircle2, Zap, PackageOpen, BarChart3, Scan
} from 'lucide-react';

export default function HowItWorksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'restaurant' | 'retail'>('restaurant');
  const [currentVideo, setCurrentVideo] = useState<'v1' | 'v2'>('v1');

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-900/30">
      
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.05)] p-4 px-4 sm:px-8 flex justify-between items-center z-50 transition-all duration-300">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
            <img src="/logo.png" alt="ZyncoBill Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
            <h1 className="text-2xl font-black text-blue-950 tracking-tight group-hover:text-blue-900 transition-colors">
              Zynco<span className="text-amber-500 drop-shadow-sm">Bill</span>
            </h1>
          </div>
        </div>
        <div>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-950 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-blue-950 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="text-white pt-32 pb-24 px-4 text-center relative overflow-hidden flex flex-col items-center justify-center w-full min-h-[500px] md:min-h-0 md:aspect-video bg-blue-950">
        
        {/* Background Video Sequence */}
        <video 
          key={currentVideo} // Forces reload on src change to ensure autoplay works seamlessly
          src={`/${currentVideo}.mp4`} 
          autoPlay 
          muted 
          playsInline
          onEnded={() => setCurrentVideo(prev => prev === 'v1' ? 'v2' : 'v1')}
          className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-40 scale-[1.30]" 
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-blue-950/60 z-0"></div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight relative z-10 drop-shadow-lg">Onboarding & Setup Guide</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10 relative z-10 drop-shadow-md">
          From configuring your hardware to linking your Swiggy/Zomato accounts, here is exactly how to set up ZyncoBill for your business.
        </p>

        {/* Toggle Switch */}
        <div className="flex justify-center mt-10 relative z-10 mb-8">
          <div className="bg-white/20 backdrop-blur-xl p-1.5 rounded-[1.25rem] flex items-center shadow-2xl border border-white/40">
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'restaurant'
                  ? 'bg-amber-500 text-white shadow-lg scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ChefHat className="w-5 h-5" /> Restaurant Workflow
            </button>
            <button
              onClick={() => setActiveTab('retail')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'retail'
                  ? 'bg-amber-500 text-white shadow-lg scale-105'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Store className="w-5 h-5" /> Retail Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        
        {activeTab === 'restaurant' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Step 1 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">1. Build Your Menu & Tables</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start by going to the <strong>Items</strong> tab (or Menu) to add your dishes, prices, and categories. Next, configure your layout by adding Table Numbers and assigning Captains (waiters) so the system knows where to send the food.
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src="/images/restaurant_menu.png" alt="Menu Setup Screen" className="w-full object-cover" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">2. Setup Swiggy & Zomato Integrations</h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                  To receive live orders, navigate to <strong>Settings {'>'} Integrations</strong>. Select your aggregator (like UrbanPiper or Swiggy Direct), and paste your official <strong>Store ID</strong> and <strong>Secret API Key</strong>. ZyncoBill will now automatically listen for incoming delivery orders!
                </p>
                <button 
                  onClick={() => router.push('/setup-guides/online-orders')}
                  className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 transition-colors"
                >
                  Read the step-by-step Swiggy/Zomato Setup Guide <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              {/* No integration page screenshot available currently, placeholder */}
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">3. Hardware & Printer Configuration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect your thermal receipt printers for the cashier desk and the kitchen. Go to <strong>Settings {'>'} Hardware</strong> to select your paper size (58mm or 80mm). When you click "Print KOT" in the POS, it will automatically route to the kitchen printer.
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src="/images/restaurant_hardware.png" alt="Printer Setup Screen" className="w-full object-cover" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">4. Start Taking Live Orders</h3>
                <p className="text-gray-600 leading-relaxed">
                  You are ready! Open the <strong>Online Orders</strong> page to watch Swiggy orders pop up automatically without refreshing. Use the <strong>POS</strong> page to punch in Dine-In orders, send KOTs to the kitchen, and print the final bills.
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src="/images/restaurant_pos.png" alt="POS Live Orders" className="w-full object-cover" />
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Step 1 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">1. Upload Inventory & Barcodes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start by importing your products into the <strong>Inventory</strong> tab. You can assign custom Barcodes, SKUs, and stock quantities to each item (e.g., clothing sizes, electronics).
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src="/images/retail_inventory.png" alt="Inventory screen" className="w-full object-cover" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">2. Connect Scanner & Printer</h3>
                <p className="text-gray-600 leading-relaxed">
                  Plug in your USB/Bluetooth barcode scanner. Go to <strong>Settings {'>'} Hardware</strong> and choose your default invoice format. For high-value retail (like electronics/clothing), select <strong>A4 Size</strong> for professional GST invoices.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">3. Set Up Loyalty & Discounts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Configure your store's discount rules. When billing, you can capture the customer's phone number to track their purchase history, allowing you to easily apply percentage discounts directly on the POS screen.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">4. Start Selling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Open the <strong>POS</strong> page. Scan an item's barcode to instantly add it to the cart. Click "Pay & Print" to auto-deduct the item from your master inventory and generate the professional invoice for the customer!
                </p>
              </div>
              <div className="w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <img src="/images/retail_scanner.png" alt="POS Scanner" className="w-full object-cover" />
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
