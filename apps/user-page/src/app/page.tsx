"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChefHat, PackageOpen, Monitor, Smartphone, CheckCircle2, X, ArrowRight, 
  Zap, Shield, TrendingUp, Calculator, BarChart3, Cloud, MessageSquare, 
  Printer, UserCheck, Play, ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'restaurant' | 'dress'>('restaurant');
  const [pricingIndustry, setPricingIndustry] = useState<'restaurant' | 'retail'>('restaurant');
  const [pricingTier, setPricingTier] = useState<'standard' | 'unlimited'>('unlimited');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Mock variables for available lifetime spots (fetch from backend later)
  const lifetimeSpotsTotal = 50;
  const lifetimeSpotsSold = 30;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

  const openRegistration = (type: 'restaurant' | 'dress') => {
    setSelectedType(type);
    setIsModalOpen(true);
    setSuccess(false);
    setError('');
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      businessName: formData.get('businessName') as string,
      password: formData.get('password') as string,
      businessType: selectedType
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error || 'Failed to submit registration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-900/30 overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}} />

      {/* Enhanced SaaS Navigation */}
      <nav className="fixed w-full bg-white border-b border-gray-200 shadow-sm p-4 px-4 sm:px-8 flex justify-between items-center z-50 transition-all">
        <div className="flex items-center gap-8">
          {/* ZyncoBill Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src="/logo.png" alt="ZyncoBill Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-black text-blue-950 tracking-tight">
              Zynco<span className="text-amber-500">Bill</span>
            </h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-blue-900/70">
            <a href="#features" className="hover:text-blue-950 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-950 transition-colors">How it Works</a>
            <a href="#industries" className="hover:text-blue-950 transition-colors">Industries</a>
            <a href="#" className="hover:text-blue-950 transition-colors flex items-center gap-1">Pricing <ArrowUpRight className="w-3 h-3"/></a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('http://localhost:3001/login')}
            className="text-sm font-bold text-blue-900 hover:text-blue-950 hidden sm:block transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('industries')?.offsetTop || 0, behavior: 'smooth' })}
            className="text-sm font-bold text-white bg-blue-950 hover:bg-blue-900 px-6 py-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section (Vyapar Style) */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-50/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-sm font-bold mb-6 shadow-sm animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                #1 Billing & POS Software in India
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-950 tracking-tight mb-6 leading-[1.15] animate-fade-in-up delay-100">
                Simple & Secure Billing <br className="hidden md:block"/>
                For <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Modern Businesses</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium animate-fade-in-up delay-200 lg:max-w-xl">
                Manage your invoicing, inventory, accounting, and customers seamlessly. ZyncoBill works offline and syncs online across all your devices.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 animate-fade-in-up delay-300">
                <button 
                  onClick={() => window.scrollTo({ top: document.getElementById('industries')?.offsetTop || 0, behavior: 'smooth' })} 
                  className="w-full sm:w-auto px-8 py-4 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-blue-900/20 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                >
                  <Monitor className="w-5 h-5" /> Desktop App
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: document.getElementById('industries')?.offsetTop || 0, behavior: 'smooth' })} 
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-950 text-blue-950 font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
                >
                  <Smartphone className="w-5 h-5" /> Mobile App
                </button>
              </div>
              <p className="mt-6 text-sm font-bold text-slate-500 animate-fade-in-up delay-400">Available for Windows, macOS, Android, and iOS.</p>
            </div>
            
            {/* Right Image */}
            <div className="relative w-full max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-400 perspective-[2000px]">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 bottom-[-20px] pointer-events-none"></div>
              <img 
                src="/hero.png" 
                alt="ZyncoBill Dashboard" 
                className="w-full h-auto object-contain mix-blend-multiply animate-float transform lg:-rotate-y-6 lg:rotate-x-3 transition-transform duration-700 hover:rotate-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-[#F8FAFC] py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4 tracking-tight">How ZyncoBill Works</h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-600 font-medium max-w-2xl mx-auto">Get your business digitized and start billing in less than 3 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Desktop connecting line */}
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200 via-amber-200 to-blue-200 -z-0 -translate-y-8"></div>
            
            {[
              { 
                step: "1", 
                icon: UserCheck, 
                title: "Register Business", 
                desc: "Sign up with your basic details and select your industry (Restaurant or Retail) to get a tailored workspace." 
              },
              { 
                step: "2", 
                icon: Cloud, 
                title: "Instant Provisioning", 
                desc: "Our cloud system instantly generates a secure, dedicated environment configured exactly for your needs." 
              },
              { 
                step: "3", 
                icon: Calculator, 
                title: "Start Billing", 
                desc: "Add items via barcode or menu, generate GST compliant invoices, and share receipts instantly via WhatsApp." 
              }
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-16 h-16 bg-blue-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-6 shadow-lg shadow-blue-900/30 group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-300">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-3">{item.title}</h3>
                <p className="text-slate-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Features Grid */}
      <div id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4 tracking-tight">Everything You Need to Run Your Business</h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full mb-6"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { icon: Printer, title: "Professional Invoicing", desc: "Create GST and non-GST bills in seconds. Choose from multiple professional templates and print directly." },
              { icon: PackageOpen, title: "Inventory Management", desc: "Track stock in real-time. Get low stock alerts, manage batches, and handle returns effortlessly." },
              { icon: MessageSquare, title: "WhatsApp Integration", desc: "Send invoices, payment reminders, and greetings directly to your customers' WhatsApp." },
              { icon: BarChart3, title: "Business Reports", desc: "Access 20+ comprehensive reports including Sales, Profit & Loss, GST reports, and Day Book." },
              { icon: Smartphone, title: "Multi-Device Sync", desc: "Use on Mobile, Desktop, and Web. Your data syncs instantly and securely across all devices." },
              { icon: Shield, title: "100% Data Security", desc: "Your data is end-to-end encrypted with automatic daily cloud backups. Never lose a single invoice." }
            ].map((feat, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="shrink-0 w-12 h-12 bg-blue-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors">
                  <feat.icon className="w-6 h-6 text-blue-600 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-950 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industry Specializations */}
      <div id="industries" className="py-24 bg-blue-950 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-800 rounded-full blur-3xl opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Tailored For Your Industry</h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full mb-6"></div>
            <p className="text-blue-200 font-medium max-w-2xl mx-auto">Get a specialized dashboard with tools built specifically for how you work.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Restaurant POS */}
            <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl flex flex-col items-start group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 group-hover:scale-105 transition-transform">
                <ChefHat className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-3xl font-black text-blue-950 mb-4">Restaurant POS</h3>
              <ul className="space-y-3 mb-10 w-full">
                {["Dine-in Table Management", "Kitchen Display System (KDS)", "Recipe & Raw Material Tracking", "Swiggy/Zomato Integration Support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              
              {/* <button 
                onClick={() => openRegistration('restaurant')}
                className="mt-auto w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
              >
                Start Restaurant Free Trial
              </button> */}
            </div>

            {/* Retail POS */}
            <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-2xl flex flex-col items-start group">
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-8 border border-amber-100 group-hover:scale-105 transition-transform">
                <PackageOpen className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-3xl font-black text-blue-950 mb-4">Retail & Garments POS</h3>
              <ul className="space-y-3 mb-10 w-full">
                {["Barcode Generation & Scanning", "Size & Color Variant Management", "Customer Loyalty Points", "Supplier Ledger & Payables"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              
              {/* <button 
                onClick={() => openRegistration('dress')}
                className="mt-auto w-full bg-amber-500 hover:bg-amber-600 text-blue-950 font-black py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
              >
                Start Retail Free Trial
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-blue-950 mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <div className="w-24 h-1.5 bg-amber-400 mx-auto rounded-full mb-8"></div>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">Choose the plan that best fits your business. No hidden fees.</p>
            
            {/* Industry Toggle */}
            <div className="inline-flex bg-slate-100 p-1.5 rounded-full shadow-inner mb-4">
              <button 
                onClick={() => setPricingIndustry('restaurant')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${pricingIndustry === 'restaurant' ? 'bg-white text-blue-950 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Restaurant & Cafe
              </button>
              <button 
                onClick={() => setPricingIndustry('retail')}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${pricingIndustry === 'retail' ? 'bg-white text-blue-950 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Retail & Boutique
              </button>
            </div>

            <div className="w-full mb-8">
              {/* Tier Toggle */}
              <div className="inline-flex bg-blue-50/50 border border-blue-100 p-1 rounded-full shadow-inner">
                <button 
                  onClick={() => setPricingTier('standard')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${pricingTier === 'standard' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Standard Access
                </button>
                <button 
                  onClick={() => setPricingTier('unlimited')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${pricingTier === 'unlimited' ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Unlimited Access 🔥
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Monthly Plan */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Monthly</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">{pricingTier === 'unlimited' ? 'Unlimited access, billed monthly' : 'Perfect for getting started'}</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-blue-950">₹{pricingTier === 'unlimited' ? '499' : '299'}</span>
                <span className="text-slate-500 font-medium">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {(pricingIndustry === 'restaurant' ? (
                  pricingTier === 'standard' ? [
                    'Basic Invoicing', 'Table Management', 'Standard KOTs', 'Basic Inventory', 'Email Receipts'
                  ] : [
                    'Unlimited Invoicing', 'Advanced Table & KOT', 'Kitchen Display System', 'Advanced Inventory', 'WhatsApp Receipts'
                  ]
                ) : (
                  pricingTier === 'standard' ? [
                    'Basic Invoicing', 'Barcode Scanning', 'Simple Inventory', 'Supplier List', 'Email Receipts'
                  ] : [
                    'Unlimited Invoicing', 'Advanced Barcode', 'Variant Inventory (Sizes/Colors)', 'Supplier Management', 'WhatsApp Receipts'
                  ]
                )).map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => { setSelectedType(pricingIndustry === 'restaurant' ? 'restaurant' : 'dress'); setIsModalOpen(true); }} className="w-full py-4 rounded-xl font-bold text-blue-950 bg-white border-2 border-slate-200 hover:border-blue-950 transition-all">Start Free Trial</button>
            </div>

            {/* Yearly Plan */}
            <div className="bg-blue-950 rounded-3xl p-8 border border-blue-900 shadow-2xl relative transform md:-translate-y-4 flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-blue-950 text-xs font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Yearly</h3>
              <p className="text-blue-200/70 text-sm mb-6 font-medium">Save ₹{pricingTier === 'unlimited' ? '1,989' : '589'} annually</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">₹{pricingTier === 'unlimited' ? '3,999' : '2,999'}</span>
                <span className="text-blue-200/70 font-medium">/yr</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {(pricingIndustry === 'restaurant' ? (
                  pricingTier === 'standard' ? [
                    'Everything in Monthly', 'Basic Recipe Costing', 'Single-user Access', 'Standard Support'
                  ] : [
                    'Everything in Monthly', 'Advanced Recipe Costing', 'Waiter Ordering App', 'Multi-user Access', 'Priority Support'
                  ]
                ) : (
                  pricingTier === 'standard' ? [
                    'Everything in Monthly', 'Basic Stock Alerts', 'Single-user Access', 'Standard Support'
                  ] : [
                    'Everything in Monthly', 'Advanced Stock Alerts', 'Sales Analytics', 'Multi-user Access', 'Priority Support'
                  ]
                )).map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-blue-50 font-medium text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => { setSelectedType(pricingIndustry === 'restaurant' ? 'restaurant' : 'dress'); setIsModalOpen(true); }} className="w-full py-4 rounded-xl font-black text-blue-950 bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all">Get Yearly Plan</button>
            </div>

            {/* Lifetime Plan */}
            {lifetimeSpotsSold < lifetimeSpotsTotal && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200 shadow-sm flex flex-col relative overflow-hidden group">
                {/* Shine Effect */}
                <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shine z-0 pointer-events-none"></div>
                
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-bl-xl shadow-sm z-10">
                  {lifetimeSpotsSold}/{lifetimeSpotsTotal} Spots Claimed
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-2">Lifetime</h3>
                <p className="text-amber-700/70 text-sm mb-6 font-medium">{pricingTier === 'unlimited' ? 'Unlimited access, pay once, use forever' : 'Pay once, use forever'}</p>
                <div className="mb-8 relative z-10">
                  <span className="text-4xl font-extrabold text-amber-900">₹{pricingTier === 'unlimited' ? '34,999' : '29,999'}</span>
                  <span className="text-amber-700/70 font-medium"> one-time</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1 relative z-10">
                  {(pricingIndustry === 'restaurant' ? (
                    pricingTier === 'standard' ? [
                      'Everything in Yearly', 'No Recurring Fees', 'Standard Updates', 'Community Support'
                    ] : [
                      'Everything in Yearly', 'No Recurring Fees', 'Free Lifetime Updates', 'Dedicated Account Manager', 'Custom Data Export'
                    ]
                  ) : (
                    pricingTier === 'standard' ? [
                      'Everything in Yearly', 'No Recurring Fees', 'Standard Updates', 'Community Support'
                    ] : [
                      'Everything in Yearly', 'No Recurring Fees', 'Free Lifetime Updates', 'Dedicated Account Manager', 'Custom Data Export'
                    ]
                  )).map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-amber-900 font-medium text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setSelectedType(pricingIndustry === 'restaurant' ? 'restaurant' : 'dress'); setIsModalOpen(true); }} className="w-full py-4 rounded-xl font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 transition-all relative z-10">Start Free Trial & Lock Price</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Robust SaaS Footer */}
      <footer className="bg-blue-950 pt-20 pb-10 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6 bg-white px-3 py-2 rounded-xl shadow-lg w-max">
                <img src="/logo.png" alt="ZyncoBill Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-2xl font-black text-blue-950 tracking-tight">
                  Zynco<span className="text-amber-500">Bill</span>
                </h2>
              </div>
              <p className="text-blue-200/70 font-medium leading-relaxed max-w-sm mb-6">
                Empowering millions of Indian businesses with simple, secure, and modern billing solutions.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Mockup */}
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-800 transition-colors">f</div>
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-800 transition-colors">t</div>
                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white cursor-pointer hover:bg-blue-800 transition-colors">in</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Products</h4>
              <ul className="space-y-4 text-blue-200/70 font-medium text-sm">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Restaurant POS</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Retail POS</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Mobile Billing App</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Desktop Billing App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4 text-blue-200/70 font-medium text-sm">
                <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Partner Program</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4 text-blue-200/70 font-medium text-sm">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-blue-900 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-200/50 text-sm font-medium">© {new Date().getFullYear()} ZyncoBill Technologies Pvt Ltd. All rights reserved.</p>
            <p className="text-blue-200/50 text-sm font-medium flex items-center gap-1">Made with <span className="text-rose-500">♥</span> in India</p>
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden transform transition-all scale-100 border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-slate-50/50">
              <h2 className="text-xl font-extrabold text-blue-950 flex items-center gap-2 tracking-tight">
                <span className="w-2 h-6 rounded-full bg-amber-500 block"></span>
                Join ZyncoBill {selectedType === 'restaurant' ? 'Dining' : 'Retail'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-blue-950 mb-3 tracking-tight">Welcome to ZyncoBill!</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                    Your registration request has been successfully submitted. Our team will review your application and provision your workspace shortly.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-900/20 text-lg"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-2 shadow-inner">
                      <Shield className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-900/70 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                    <input name="name" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 focus:bg-white text-blue-950" placeholder="John Doe" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-900/70 uppercase tracking-wider mb-2 ml-1">Business Name</label>
                    <input name="businessName" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 focus:bg-white text-blue-950" placeholder={selectedType === 'restaurant' ? 'The Golden Spoon Cafe' : 'Aura Boutique'} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-900/70 uppercase tracking-wider mb-2 ml-1">Phone</label>
                      <input name="phone" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 focus:bg-white text-blue-950" placeholder="10-digit number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-900/70 uppercase tracking-wider mb-2 ml-1">Email</label>
                      <input name="email" type="email" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 focus:bg-white text-blue-950" placeholder="john@example.com" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-blue-900/70 uppercase tracking-wider mb-2 ml-1">Secure Password</label>
                    <input name="password" type="password" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none bg-slate-50 focus:bg-white text-blue-950" placeholder="Create a strong password" />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-blue-950 font-black text-lg py-4 rounded-xl mt-4 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    {loading ? 'Processing Request...' : 'Start Free Trial'} <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <p className="text-center text-xs text-slate-400 font-medium mt-4">
                    By registering, you agree to our Terms of Service & Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
