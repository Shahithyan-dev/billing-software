"use client";

import React from 'react';
import { ShieldCheck, UserCheck, Key, FileLock2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Security = () => {
  return (
    <div className="h-full flex flex-col gap-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-500" />
            Security & Access Control
          </h1>
          <p className="text-muted-foreground mt-1">Manage Roles, Permissions (RBAC), and Audit Logs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FileLock2 className="w-4 h-4" />
            View Audit Logs
          </Button>
          <Button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
            <Key className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Roles List */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Roles
          </h3>
          <div className="flex flex-col gap-2">
            {['System Administrator', 'Store Manager', 'Head Chef', 'Cashier', 'Server'].map((role, idx) => (
              <div 
                key={role} 
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${idx === 1 ? 'bg-teal-500/10 border-teal-500 text-teal-600' : 'bg-card border-border hover:bg-muted/50'}`}
              >
                <div className="font-bold">{role}</div>
                <div className="text-sm text-muted-foreground mt-1">{idx === 0 ? 'Full Access' : 'Limited Access'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold">Store Manager</h2>
              <p className="text-sm text-muted-foreground">Modify permissions for this role across the system</p>
            </div>
            <Button variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10">Delete Role</Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-bold text-muted-foreground uppercase text-xs tracking-wider">Point of Sale (POS)</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>Process Transactions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>Apply Discounts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>Void Orders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>Refund Payments</span>
                </label>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="font-bold text-muted-foreground uppercase text-xs tracking-wider">System Administration</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>Manage Inventory</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-teal-600" />
                  <span>View Staff Payroll</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer opacity-50">
                  <input type="checkbox" className="w-4 h-4 rounded text-teal-600" disabled />
                  <span>Edit System Settings</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer opacity-50">
                  <input type="checkbox" className="w-4 h-4 rounded text-teal-600" disabled />
                  <span>Manage Security Roles</span>
                </label>
              </div>
            </div>

            <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 text-amber-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">Changes to permissions will apply immediately to all active sessions for users assigned to this role.</p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline">Discard Changes</Button>
              <Button className="bg-teal-600 hover:bg-teal-700">Save Permissions</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Security;
