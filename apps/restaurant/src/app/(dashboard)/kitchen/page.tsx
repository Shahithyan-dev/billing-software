"use client";

import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import { Clock, CheckCircle, ChefHat } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { API_BASE_URL } from '@/config/api';

const socket = io(API_BASE_URL);

const Kitchen = () => {
  // Read orders from Dexie local database instantly (supports offline)
  const activeOrders = useLiveQuery(
    () => db.orders
      .where('kitchenStatus')
      .noneOf(['ready', 'served']) // Treat undefined (new orders) or 'pending'/'preparing' as active
      .toArray()
  );

  useEffect(() => {
    // Listen for incoming orders from the cloud
    socket.on('new-kitchen-order', async (data: any) => {
      const cloudOrder = data.kitchenOrders[0];
      if (!cloudOrder) return;
      
      const existing = await db.orders.where('uuid').equals(cloudOrder.uuid).first();
      if (!existing) {
        // Save the new cloud order into local Dexie so it persists offline
        try {
          await db.orders.add({
            uuid: cloudOrder.uuid,
            restaurantId: cloudOrder.restaurantId,
            items: cloudOrder.items,
            subtotal: cloudOrder.subtotal,
            discount: cloudOrder.discount,
            tax: cloudOrder.tax,
            total: cloudOrder.total,
            paymentMethod: cloudOrder.paymentMethod,
            orderType: cloudOrder.orderType,
            timestamp: cloudOrder.timestamp,
            syncStatus: 'synced',
            kitchenStatus: 'pending'
          });
        } catch (e) {
          console.error("Failed to add cloud order to local Dexie", e);
        }
      }
    });

    return () => {
      socket.off('new-kitchen-order');
    };
  }, []);

  const markReady = async (id: number | undefined) => {
    if (!id) return;
    
    // Update local Dexie DB. Setting syncStatus to 'pending' tells the syncEngine to push to the cloud.
    try {
      await db.orders.update(id, { 
        kitchenStatus: 'ready',
        syncStatus: 'pending' 
      });
    } catch (e) {
      console.error("Failed to update order status", e);
    }
  };

  const ordersToDisplay = activeOrders || [];

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
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
          <span className="text-sm font-medium">Synced & Connected</span>
        </div>
      </header>

      {ordersToDisplay.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <ChefHat className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">No active orders</p>
          <p className="text-sm">Waiting for incoming tickets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto">
          {ordersToDisplay.map(order => (
            <div key={order.id} className="bg-card border-t-4 border-t-primary border-x border-b border-border rounded-xl flex flex-col overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.uuid.slice(-4)}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-md mt-1 inline-block">
                    {order.orderType || 'Retail Invoice'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-orange-400 font-medium text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Just now</span>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-3">
                  {order.items.map(item => (
                    <li key={item.id} className="flex gap-3 items-start">
                      <span className="font-bold text-primary w-6">{item.quantity}x</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-muted/50 border-t border-border">
                <button 
                  onClick={() => markReady(order.id)}
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

export default Kitchen;
