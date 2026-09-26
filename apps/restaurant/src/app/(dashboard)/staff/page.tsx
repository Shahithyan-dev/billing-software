"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, UserPlus, Fingerprint, CalendarClock, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/api';

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  status: string;
  shift: string;
  hours: number;
  phone?: string;
  email?: string;
}

const Staff = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessType, setBusinessType] = useState('restaurant');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cashier',
    shift: 'Morning',
    phone: '',
  });

  const fetchStaff = useCallback(async () => {
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/staff/${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch staff', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const details = localStorage.getItem('zyncobill_restaurant_details');
    if (details) {
      try {
        const parsed = JSON.parse(details);
        setBusinessType(parsed.businessType || 'restaurant');
      } catch (e) {}
    }
    fetchStaff();
  }, [fetchStaff]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const restaurantId = localStorage.getItem('restaurantId');
    if (!restaurantId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          ...formData
        })
      });
      const data = await res.json();
      if (data.success) {
        setStaffList([data.data, ...staffList]);
        setIsModalOpen(false);
        setFormData({ name: '', role: 'Cashier', shift: 'Morning', phone: '' });
      }
    } catch (e) {
      console.error('Failed to add staff', e);
      alert('Error adding staff');
    }
  };

  const activeStaff = staffList.filter(s => s.status === 'Clocked In').length;

  return (
    <div className="h-full flex flex-col gap-6 relative">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Users className="w-8 h-8 text-pink-500" />
            Staff & Payroll
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee shifts, timeclocks, and suppliers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            Register Biometrics
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Users className="w-5 h-5" /> Total Staff
          </div>
          <p className="text-3xl font-bold">{staffList.length}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-500">
            <Clock className="w-5 h-5" /> Currently Clocked In
          </div>
          <p className="text-3xl font-bold">{activeStaff}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-orange-500">
            <CalendarClock className="w-5 h-5" /> Open Shifts
          </div>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-sm sticky top-0 z-10">
              <tr>
                <th className="p-4 font-medium">Employee Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Assigned Shift</th>
                <th className="p-4 font-medium">Hours</th>
                <th className="p-4 font-medium">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr key={staff._id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-bold">
                    {staff.name}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {staff.shift}
                  </td>
                  <td className="p-4 font-mono">{`${staff.hours}h`}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      staff.status === 'Clocked In' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No staff added yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl w-full max-w-md p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Add New Employee</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-700 text-sm"
                >
                  {businessType === 'restaurant' ? (
                    <>
                      <option value="Manager">Manager</option>
                      <option value="Head Chef">Head Chef</option>
                      <option value="Chef">Chef</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Captain">Captain</option>
                    </>
                  ) : (
                    <>
                      <option value="Store Manager">Store Manager</option>
                      <option value="Salesperson">Salesperson</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Inventory Clerk">Inventory Clerk</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-700 text-sm"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="Split">Split</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">
                  Save Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
