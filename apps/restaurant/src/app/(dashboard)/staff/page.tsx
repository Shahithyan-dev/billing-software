"use client";

import React from 'react';
import { Users, Clock, UserPlus, Fingerprint, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Staff = () => {
  const staffList = [
    { id: '1', name: 'John Doe', role: 'Manager', status: 'Clocked In', shift: 'Morning', hours: 42.5 },
    { id: '2', name: 'Jane Smith', role: 'Head Chef', status: 'Clocked In', shift: 'Morning', hours: 45.0 },
    { id: '3', name: 'Mike Johnson', role: 'Cashier', status: 'Clocked Out', shift: 'Evening', hours: 28.5 },
    { id: '4', name: 'Emily Davis', role: 'Server', status: 'Clocked In', shift: 'Morning', hours: 32.0 },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Users className="w-8 h-8 text-pink-500" />
            Staff & Payroll
          </h1>
          <p className="text-muted-foreground mt-1">Manage employee shifts, timeclocks, and biometric access</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            Register Biometrics
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Users className="w-5 h-5" /> Active Staff
          </div>
          <p className="text-3xl font-bold">24</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-green-500">
            <Clock className="w-5 h-5" /> Currently Clocked In
          </div>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-orange-500">
            <CalendarClock className="w-5 h-5" /> Open Shifts
          </div>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <Fingerprint className="w-5 h-5" /> Biometrics Enrolled
          </div>
          <p className="text-3xl font-bold">100%</p>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-sm sticky top-0">
              <tr>
                <th className="p-4 font-medium">Employee Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Assigned Shift</th>
                <th className="p-4 font-medium">Hours (This Week)</th>
                <th className="p-4 font-medium">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map(staff => (
                <tr key={staff.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-bold">{staff.name}</td>
                  <td className="p-4 text-muted-foreground">{staff.role}</td>
                  <td className="p-4 text-muted-foreground">{staff.shift}</td>
                  <td className="p-4 font-mono">{staff.hours}h</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;
