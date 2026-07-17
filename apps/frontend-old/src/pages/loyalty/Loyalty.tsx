import React, { useState } from 'react';
import { Search, Crown, Gift, Wallet, Award, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

const mockCustomers = [
  { id: '1', name: 'Eleanor Shellstrop', phone: '+1 555-0192', tier: 'Diamond', points: 12450, wallet: 150.00 },
  { id: '2', name: 'Chidi Anagonye', phone: '+1 555-0193', tier: 'Platinum', points: 8200, wallet: 45.50 },
  { id: '3', name: 'Tahani Al-Jamil', phone: '+1 555-0194', tier: 'Gold', points: 4100, wallet: 0.00 },
  { id: '4', name: 'Jason Mendoza', phone: '+1 555-0195', tier: 'Silver', points: 1200, wallet: 10.00 },
  { id: '5', name: 'Michael', phone: '+1 555-0196', tier: 'Bronze', points: 400, wallet: 0.00 },
];

export const Loyalty = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30';
      case 'Platinum': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'Gold': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Silver': return 'bg-slate-400/20 text-slate-400 border-slate-400/30';
      default: return 'bg-orange-700/20 text-orange-600 border-orange-700/30';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            Loyalty & CRM
          </h1>
          <p className="text-muted-foreground mt-1">Manage memberships, rewards, and customer wallets</p>
        </div>
        <Button className="flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Create Promo Campaign
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Issued Points</p>
            <p className="text-2xl font-bold mt-1">142,500</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-green-500/10 p-4 rounded-full text-green-500">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Wallet Balance</p>
            <p className="text-2xl font-bold mt-1">$4,250.00</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500/10 p-4 rounded-full text-blue-500">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active VIPs</p>
            <p className="text-2xl font-bold mt-1">128</p>
          </div>
        </div>
      </div>

      {/* Customer Directory */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
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
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Phone Number</th>
                <th className="p-4 font-medium">Membership Tier</th>
                <th className="p-4 font-medium">Available Points</th>
                <th className="p-4 font-medium">Wallet Balance</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="border-b border-border hover:bg-muted/20 transition-colors group">
                  <td className="p-4 font-medium">{customer.name}</td>
                  <td className="p-4 text-muted-foreground">{customer.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierColor(customer.tier)}`}>
                      {customer.tier}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{customer.points.toLocaleString()}</td>
                  <td className="p-4 font-bold text-green-500">${customer.wallet.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
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
