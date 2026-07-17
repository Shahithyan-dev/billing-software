import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Clock, CheckCircle, ChefHat } from 'lucide-react';

interface KitchenOrder {
  id: string;
  orderId: string;
  station: string;
  status: string;
  createdAt: string;
  order: {
    id: string;
    type: string;
    notes?: string;
    items: {
      id: string;
      name: string;
      quantity: number;
    }[];
  };
}

import { API_BASE_URL } from '../../config/api';

const socket = io(API_BASE_URL);

export const Kitchen = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    // Listen for new orders broadcasted by the Express backend
    socket.on('new-kitchen-order', (newOrder: any) => {
      // Format the incoming order to match our KDS view
      const kdsOrder = newOrder.kitchenOrders[0];
      kdsOrder.order = newOrder;
      
      setOrders(prev => [...prev, kdsOrder]);
    });

    return () => {
      socket.off('new-kitchen-order');
    };
  }, []);

  const markReady = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    // In a full implementation, this would send an API request to update the DB status
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-3">
            <ChefHat className="w-8 h-8" />
            Kitchen Display System (KDS)
          </h1>
          <p className="text-muted-foreground mt-1">Real-time order fulfillment center</p>
        </div>
        <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-sm font-medium">Socket Connected</span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <ChefHat className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">No active orders</p>
          <p className="text-sm">Waiting for incoming tickets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto">
          {orders.map(kds => (
            <div key={kds.id} className="bg-card border-t-4 border-t-primary border-x border-b border-border rounded-xl flex flex-col overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Order #{kds.order.id.slice(-4)}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md mt-1 inline-block">
                    {kds.order.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-orange-400 font-medium text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Just now</span>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-3">
                  {kds.order.items.map(item => (
                    <li key={item.id} className="flex gap-3 items-start">
                      <span className="font-bold text-primary w-6">{item.quantity}x</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-muted/50 border-t border-border">
                <button 
                  onClick={() => markReady(kds.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Ready
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
