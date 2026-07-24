"use client";

import React, { useState } from 'react';
import { PackageOpen, TrendingDown, AlertTriangle, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const inventory = [
    { id: '1', name: 'Mozzarella Cheese', sku: 'ING-001', category: 'Dairy', quantity: 15, unit: 'kg', minThreshold: 20, status: 'Low Stock' },
    { id: '2', name: 'Pizza Flour (00)', sku: 'ING-002', category: 'Dry Goods', quantity: 250, unit: 'kg', minThreshold: 50, status: 'Optimal' },
    { id: '3', name: 'San Marzano Tomatoes', sku: 'ING-003', category: 'Produce', quantity: 45, unit: 'tins', minThreshold: 30, status: 'Optimal' },
    { id: '4', name: 'Fresh Basil', sku: 'ING-004', category: 'Produce', quantity: 2, unit: 'kg', minThreshold: 5, status: 'Low Stock' },
    { id: '5', name: 'Olive Oil (Extra Virgin)', sku: 'ING-005', category: 'Liquids', quantity: 12, unit: 'Liters', minThreshold: 15, status: 'Low Stock' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <PackageOpen className="w-8 h-8 text-indigo-500" />
            Inventory & Supply Chain
          </h1>
          <p className="text-muted-foreground mt-1">Real-time stock tracking and low-inventory alerts</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Receive Purchase Order
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <PackageOpen className="w-6 h-6 text-indigo-500" />
            <h3 className="text-muted-foreground font-medium">Total SKUs Active</h3>
          </div>
          <p className="text-3xl font-bold">142</p>
        </div>
        
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -z-10" />
          <div className="flex items-center gap-4 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-muted-foreground font-medium">Low Stock Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-red-500">12</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-2">
            <TrendingDown className="w-6 h-6 text-orange-500" />
            <h3 className="text-muted-foreground font-medium">Est. Depletion (24h)</h3>
          </div>
          <p className="text-3xl font-bold">$1,450</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search SKUs or Ingredient Names..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-sm sticky top-0">
              <tr>
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">SKU</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">In Stock</th>
                <th className="p-4 font-medium text-right">Min. Threshold</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-muted-foreground font-mono text-xs">{item.sku}</td>
                  <td className="p-4 text-muted-foreground">{item.category}</td>
                  <td className="p-4 text-right font-bold">
                    {item.quantity} <span className="text-muted-foreground font-normal text-xs">{item.unit}</span>
                  </td>
                  <td className="p-4 text-right text-muted-foreground">
                    {item.minThreshold} {item.unit}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      item.status === 'Low Stock' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {item.status}
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

export default Inventory;
