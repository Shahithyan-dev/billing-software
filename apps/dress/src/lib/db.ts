import Dexie, { type Table } from 'dexie';
import { MenuItem } from '@/app/(dashboard)/pos/page';

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
}

export interface RestaurantConfig {
  id: string; // Single string ID (e.g. 'local')
  name: string;
  tagline: string;
  phone: string;
  gstin: string;
  fssai: string;
}

export interface Party {
  id?: number;
  type: 'customer' | 'supplier';
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  openingBalance?: number;
}

export interface PurchaseItem {
  name: string;
  qty: number;
  rate: number;
  total: number;
}

export interface Purchase {
  id?: number;
  supplierName: string;
  phone?: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: number;
}

export class ServeWellDB extends Dexie {
  orders!: Table<Order, number>;
  menuItems!: Table<MenuItem, string>;
  config!: Table<RestaurantConfig, string>;
  parties!: Table<Party, number>;
  purchases!: Table<Purchase, number>;

  constructor() {
    super('ServeWellDB');
    this.version(2).stores({
      orders: '++id, uuid, syncStatus, timestamp', // Primary key and indexed props
      menuItems: 'id, category', // Primary key and indexed props
      config: 'id',
      parties: '++id, type, name, phone',
      purchases: '++id, supplierName, timestamp'
    });
  }
}

export const db = new ServeWellDB();
