import { db } from './db';
import { API_BASE_URL } from '@/config/api';

export class SyncEngine {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 10000; // 10 seconds

  start() {
    if (this.syncInterval) return;
    
    // Initial sync
    this.sync();

    // Periodic sync
    this.syncInterval = setInterval(() => {
      this.sync();
    }, this.SYNC_INTERVAL_MS);
    
    // Listen for online events to trigger immediate sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync());
    }
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync() {
    // Prevent overlapping syncs
    if (this.isSyncing) return;
    
    // Only attempt sync if we have network connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    try {
      await this.pushPendingOrders();
    } catch (error) {
      console.error('[SyncEngine] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async pushPendingOrders() {
    // 1. Find all orders that are marked 'pending'
    const pendingOrders = await db.orders
      .where('syncStatus')
      .equals('pending')
      .toArray();

    if (pendingOrders.length === 0) return;

    console.log(`[SyncEngine] Found ${pendingOrders.length} pending orders to sync.`);

    // 2. Push them to the backend API one by one (or batch)
    for (const order of pendingOrders) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/sync/order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });

        if (response.ok) {
          // 3. Mark as synced locally
          await db.orders.update(order.id!, { syncStatus: 'synced' });
        } else {
          console.error(`[SyncEngine] Failed to sync order ${order.uuid}`);
        }
      } catch (err) {
        console.error(`[SyncEngine] Network error syncing order ${order.uuid}`, err);
        // Will retry on next sync interval
      }
    }
  }
}

// Export a singleton instance
export const syncEngine = new SyncEngine();
