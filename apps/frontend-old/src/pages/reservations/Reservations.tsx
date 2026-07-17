import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '../../components/ui/button';

export const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());

  const tables = [
    { id: 'T1', status: 'Occupied', capacity: 2, currentParty: 'Smith' },
    { id: 'T2', status: 'Reserved', capacity: 4, currentParty: 'Johnson (7:00 PM)' },
    { id: 'T3', status: 'Available', capacity: 4, currentParty: null },
    { id: 'T4', status: 'Available', capacity: 6, currentParty: null },
    { id: 'T5', status: 'Occupied', capacity: 2, currentParty: 'Davis' },
    { id: 'T6', status: 'Reserved', capacity: 8, currentParty: 'Miller (8:30 PM)' },
    { id: 'T7', status: 'Available', capacity: 2, currentParty: null },
    { id: 'T8', status: 'Available', capacity: 4, currentParty: null },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500/10 border-green-500 text-green-500';
      case 'Occupied': return 'bg-red-500/10 border-red-500 text-red-500';
      case 'Reserved': return 'bg-orange-500/10 border-orange-500 text-orange-500';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-500" />
            Table Reservations & Floor Plan
          </h1>
          <p className="text-muted-foreground mt-1">Manage walk-ins and future bookings visually</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Select Date: {selectedDate}
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Reservation
          </Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="text-muted-foreground mb-1">Total Capacity</div>
          <p className="text-3xl font-bold">120 <span className="text-sm font-normal text-muted-foreground">seats</span></p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="text-muted-foreground mb-1">Current Occupancy</div>
          <p className="text-3xl font-bold text-red-500">45%</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="text-muted-foreground mb-1">Upcoming Bookings (Today)</div>
          <p className="text-3xl font-bold">14</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="text-muted-foreground mb-1">Waitlist</div>
          <p className="text-3xl font-bold text-orange-500">2 <span className="text-sm font-normal text-muted-foreground">parties</span></p>
        </div>
      </div>

      {/* Visual Floor Plan Area */}
      <div className="flex-1 bg-muted/20 border border-border rounded-xl p-8 overflow-hidden flex flex-col relative">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
          Main Dining Room - Floor Plan
        </h3>
        
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 content-start">
          {tables.map(table => (
            <div 
              key={table.id}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${getStatusColor(table.status)}`}
            >
              <h4 className="text-xl font-black mb-1">{table.id}</h4>
              <div className="flex items-center gap-2 text-sm font-medium mb-3 opacity-80">
                <Users className="w-4 h-4" /> {table.capacity} Seats
              </div>
              
              {table.currentParty ? (
                <div className="bg-background/50 px-3 py-1 rounded-md text-sm font-bold w-full text-center truncate">
                  {table.currentParty}
                </div>
              ) : (
                <div className="bg-background/50 px-3 py-1 rounded-md text-sm font-bold w-full text-center opacity-70">
                  Available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
