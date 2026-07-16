import React from 'react';
import { ChefHat, Mail, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router';

export const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard'); // Match mockup which goes to Dashboard
  };

  return (
    <div className="min-h-screen w-full flex items-center bg-[#f8f6f0] p-4 md:p-8 relative">
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#f8f6f0] via-[#f8f6f0]/80 to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 md:p-12 ml-0 md:ml-12 border border-[#e3e3df]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#4a7b47]/10 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-[#4a7b47]" />
          </div>
          <h1 className="text-3xl font-black text-[#2c332c] mb-2 tracking-tight">ServeWell</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
            Restaurant Management System
          </p>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[#2c332c]">Better Management.</h2>
          <h2 className="text-xl font-bold text-[#2c332c]">Better Business.</h2>
          <p className="text-sm text-muted-foreground mt-2">All in one solution for billing, orders, inventory and more.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Email or Username" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
              <input type="checkbox" className="rounded text-[#4a7b47] border-[#e3e3df] focus:ring-[#4a7b47]" />
              Remember Me
            </label>
            <a href="#" className="text-[#4a7b47] font-medium hover:underline">Forgot Password?</a>
          </div>

          <Button type="submit" className="w-full py-6 text-lg font-bold rounded-xl bg-[#4a7b47] hover:bg-[#3d663b] shadow-lg shadow-[#4a7b47]/20">
            Login
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account? <a href="#" className="text-[#4a7b47] font-bold hover:underline">Create New</a>
        </div>
      </div>
    </div>
  );
};
