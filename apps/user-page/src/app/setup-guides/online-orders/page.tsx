"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, KeyRound, MonitorPlay, BellRing, CheckCircle } from 'lucide-react';

export default function OnlineOrdersSetupGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-orange-900/30 pb-20">
      
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
            onClick={() => router.push('/how-it-works')}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-950 transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:-bottom-1 after:left-0 after:bg-blue-950 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Guide
          </button>
        </div>
      </nav>

      {/* Header */}
      {/* Header */}
      <div className="text-white pt-28 pb-10 px-4 text-center border-b-[6px] border-orange-600 relative overflow-hidden flex flex-col items-center justify-center w-full min-h-[500px] md:min-h-0 md:aspect-video bg-black">
        
        {/* Background Video */}
        <video 
          src="/onlineorder.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80 scale-[1.30]" 
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/150 z-0"></div>

        <div className="flex justify-center mb-6 relative z-10">
          {/* <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
            <Globe className="w-12 h-12 text-white" />
          </div> */}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight relative z-10 drop-shadow-lg">How to Setup Online Orders</h1>
        <p className="text-gray-200 text-lg max-w-2xl mx-auto relative z-10 drop-shadow-md">
          A foolproof, step-by-step guide to connecting your ZyncoBill POS directly to Swiggy and Zomato without needing technical help.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-12">

        {/* Step 1 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10 flex gap-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">
              1
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-950 mb-4 flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-blue-500" /> Getting Your API Keys
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Swiggy and Zomato require you to use an <strong>API Key</strong> to prove that ZyncoBill is authorized to accept orders on your behalf. You cannot get this from the normal Swiggy Partner app.
              </p>
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl space-y-3">
                <p className="text-sm text-blue-900"><strong>Option A (Recommended): Use UrbanPiper</strong></p>
                <ul className="text-sm text-blue-800 list-disc pl-5 space-y-2">
                  <li>Log in to your <strong>UrbanPiper Developer Dashboard</strong>.</li>
                  <li>Navigate to <strong>Configuration {'>'} API Credentials</strong>.</li>
                  <li>You will see two things: A <strong>Store ID</strong> (e.g., <code className="bg-white px-2 py-0.5 rounded text-blue-950 border">store_1234</code>) and a <strong>Secret Key</strong> (a very long mix of letters and numbers).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0"></div>
          <div className="relative z-10 flex gap-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">
              2
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-950 mb-4 flex items-center gap-2">
                <MonitorPlay className="w-6 h-6 text-amber-500" /> Paste Keys into ZyncoBill
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Now that you have your keys, you simply need to paste them into your POS. You only have to do this once!
              </p>
              <ul className="text-gray-600 list-decimal pl-5 space-y-3 font-medium">
                <li>Open your ZyncoBill POS dashboard.</li>
                <li>Look at the dark sidebar on the left and click on <strong>Settings</strong> at the bottom.</li>
                <li>Scroll down until you see the section titled <strong>Online Orders Integrations (Swiggy, Zomato)</strong>.</li>
                <li>In the dropdown, select your provider (e.g., UrbanPiper).</li>
                <li>Paste your <strong>Store ID</strong> into the first box.</li>
                <li>Paste your <strong>Secret API Key</strong> into the second box.</li>
                <li>Click the <strong>Save Configuration</strong> button at the top right of the page.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden border-l-[6px] border-l-green-500">
          <div className="relative z-10 flex gap-6">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0 font-black text-xl">
              3
            </div>
            <div>
              <h2 className="text-2xl font-black text-blue-950 mb-4 flex items-center gap-2">
                <BellRing className="w-6 h-6 text-green-500 animate-pulse" /> How the Sound & Alerts Work
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                You are completely set up! You no longer need the Swiggy or Zomato tablets taking up space on your counter. Here is exactly what happens when a customer places an order on their phone:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Instant Ringing Sound
                  </div>
                  <p className="text-sm text-gray-600">
                    As long as ZyncoBill is open in a browser tab (even if you are looking at the POS or Inventory page), a <strong>loud ringing bell sound</strong> will automatically play through your speakers. You do NOT need to refresh the page!
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Visual Red Alert
                  </div>
                  <p className="text-sm text-gray-600">
                    A red dot will appear next to "Online Orders" in the sidebar. Click it, and you will see the Swiggy order sitting in the <strong>New Orders</strong> column, ready for you to click "Accept & Start Prep"!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
