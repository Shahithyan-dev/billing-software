import React, { useState } from 'react';
import { Store, Phone, FileText, MapPin, Tag, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate, Link } from 'react-router';

import { API_BASE_URL } from '../../config/api';

export const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Registration successful, redirect to login page
        navigate('/login');
      } else {
        setError(result.error || 'Failed to register');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center bg-[#f8f6f0] p-4 md:p-8 relative">
      {/* Background Image Setup */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#f8f6f0] via-[#f8f6f0]/80 to-transparent" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-xl p-8 md:p-12 ml-0 md:ml-12 border border-[#e3e3df]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="ServeWell" className="w-full h-full object-contain mix-blend-multiply p-2 drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black text-[#2c332c] mb-2 tracking-tight">Register Restaurant</h1>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-center">
            Join ServeWell OS
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="name"
              type="text" 
              required
              placeholder="Restaurant Name *" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
            />
          </div>
          
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="tagline"
              type="text" 
              placeholder="Tagline or Est. Year" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="phone"
              type="tel" 
              required
              placeholder="Phone Number *" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                name="gstin"
                type="text" 
                placeholder="GSTIN" 
                className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all uppercase"
              />
            </div>
            
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                name="fssai"
                type="text" 
                placeholder="FSSAI" 
                className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
            <textarea 
              name="address"
              placeholder="Full Address" 
              className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all min-h-[80px]"
            />
          </div>
          
          <div className="border-t border-[#e3e3df] pt-4 mt-2">
            <h3 className="text-sm font-bold text-[#2c332c] mb-3">Admin Account Details</h3>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  name="email"
                  type="email" 
                  required
                  placeholder="Admin Email Address *" 
                  className="w-full pl-12 pr-4 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="Password *" 
                  className="w-full pl-12 pr-12 py-3 bg-[#f9f7f1] border border-[#e3e3df] rounded-xl focus:outline-none focus:border-[#4a7b47] focus:ring-1 focus:ring-[#4a7b47] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#4a7b47] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold rounded-xl bg-[#4a7b47] hover:bg-[#3d663b] shadow-lg shadow-[#4a7b47]/20 mt-6">
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-[#4a7b47] font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};
