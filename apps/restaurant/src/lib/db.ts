import Dexie, { type Table } from 'dexie';
import { MenuItem } from '@/app/(dashboard)/pos/StandardPOS';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number; // Auto-incremented local ID
  uuid: string; // Unique ID for syncing
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  orderType: string;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  kitchenStatus?: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface RestaurantConfig {
  id: string; // Single string ID (e.g. 'local')
  name: string;
  tagline: string;
  phone: string;
  gstin: string;
  fssai: string;
}

export class ZyncoBillDB extends Dexie {
  orders!: Table<Order, number>;
  menuItems!: Table<MenuItem, string>;
  config!: Table<RestaurantConfig, string>;

  constructor() {
    super('ZyncoBillDB');
    this.version(2).stores({
      orders: '++id, uuid, syncStatus, timestamp, kitchenStatus', // Primary key and indexed props
      menuItems: 'id, category', // Primary key and indexed props
      config: 'id'
    });
  }
}

export const db = new ZyncoBillDB();
