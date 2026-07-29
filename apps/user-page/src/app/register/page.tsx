"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowRight, CheckCircle2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import Link from 'next/link';

function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [industry, setIndustry] = useState(searchParams.get('industry') || 'restaurant');
  const [plan, setPlan] = useState(searchParams.get('plan') || 'monthly_standard');
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : 'https://billing-software-03up.onrender.com');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const repeatPassword = formData.get('repeatPassword') as string;

    if (password !== repeatPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      businessName: formData.get('businessName') as string,
      password,
      address: formData.get('address') as string,
      gstNumber: formData.get('gstNumber') as string,
      businessType: industry,
      plan: plan
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

  if (success) {
    return (
      <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-100/50">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h3 className="text-3xl font-extrabold text-blue-950 mb-4 tracking-tight">Registration Complete!</h3>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium max-w-md mx-auto">
          Your registration request has been successfully submitted. Our team will review your details and provision your workspace shortly.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="w-full max-w-sm mx-auto bg-blue-950 hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 text-lg flex items-center justify-center gap-2"
        >
          Return to Home <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold border border-rose-100 flex items-center gap-2 shadow-sm animate-in fade-in">
          <Shield className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name *</label>
            <input name="name" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="John Doe" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Business Name *</label>
            <input name="businessName" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="The Golden Spoon Cafe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Phone *</label>
              <input name="phone" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="10-digit number" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email *</label>
              <input name="email" type="email" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="john@example.com" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Business Address *</label>
            <input name="address" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="123 Main Street, City" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">GSTIN</label>
            <input name="gstNumber" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="Enter your GST number" />
          </div>

          {/* Industry and Plan selection UI removed as it's passed via URL parameters */}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Secure Password *</label>
            <input name="password" type="password" required className="w-full px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" placeholder="Create a strong password" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Repeat Password *</label>
            <div className="relative">
              <input 
                name="repeatPassword" 
                type={showRepeatPassword ? 'text' : 'password'} 
                required 
                className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-sm" 
                placeholder="Confirm password" 
              />
              <button 
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors"
              >
                {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Paste Items Here *</label>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">Copy from Excel</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-3">
            Please arrange your items in Excel and copy-paste them directly below.
          </p>
          {industry === 'restaurant' ? (
            <p className="text-xs text-slate-400 font-medium mb-3 leading-relaxed">
              Format: <strong className="text-slate-600">Name | Price | Category | Type</strong><br/>
              Example: <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-mono text-[11px]">Idli Sambar&#9;60&#9;Breakfast&#9;veg</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-medium mb-3 leading-relaxed">
              Format: <strong className="text-slate-600">Name | Price | Category | Size | Quantity (Optional)</strong><br/>
              Example: <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 font-mono text-[11px]">Cotton Saree&#9;1200&#9;Sarees&#9;L&#9;10</span>
            </p>
          )}
          <textarea 
            name="rawMenuText" 
            required
            rows={5} 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white text-blue-950 shadow-inner resize-y font-mono whitespace-pre" 
            placeholder={industry === 'restaurant' ? "Idli Sambar\t60\tBreakfast\tveg\nMasala Dosa\t80\tBreakfast\tveg" : "Cotton Saree\t1200\tSarees\tL\t10\nSilk Saree\t1500\tSarees\tM\t5"}
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-blue-950 font-black text-lg py-4 rounded-xl mt-8 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1"
      >
        {loading ? 'Processing...' : 'Submit Registration Request'} <ArrowRight className="w-5 h-5" />
      </button>
      
      <p className="text-center text-xs text-slate-400 font-medium mt-6">
        By registering, you agree to our Terms of Service & Privacy Policy.
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-900/30">
      <nav className="bg-white border-b border-gray-200 shadow-sm p-4 px-4 sm:px-8 flex justify-between items-center relative z-50">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img src="/logo.png" alt="ZyncoBill Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-black text-blue-950 tracking-tight">
            Zynco<span className="text-amber-500">Bill</span>
          </h1>
        </Link>
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-blue-950 transition-colors">
          Back to Home
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-50 p-8 border-b border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 opacity-50 pointer-events-none"></div>
            
            <h2 className="text-3xl font-black text-blue-950 tracking-tight mb-2 relative z-10">Start Your Free Trial</h2>
            <p className="text-slate-500 font-medium relative z-10">Join thousands of businesses growing with ZyncoBill</p>
          </div>
          
          <div className="p-8 md:p-10">
            <Suspense fallback={<div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}>
              <RegistrationForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
