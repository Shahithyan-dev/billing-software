import { Router } from 'express';
import { getMenu } from '../controllers/MenuController';
import { createOrder } from '../controllers/OrderController';
import restaurantRouter from './restaurant';
import authRouter from './auth';
import Order from '../models/Order';
import Restaurant from '../models/Restaurant';
import Party from '../models/Party';
import Purchase from '../models/Purchase';
import fs from 'fs';
import path from 'path';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/restaurants', restaurantRouter);
apiRouter.get('/menu', getMenu as any);
apiRouter.post('/orders', createOrder as any);

// ─── ORDERS ──────────────────────────────────────────────────────────────────

// Get all orders for a restaurant (from MongoDB)
apiRouter.get('/orders', async (req: any, res: any) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'restaurantId required' });
    const orders = await Order.find({ restaurantId }).sort({ timestamp: -1 });
    res.json({ success: true, data: orders });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete an order by UUID
apiRouter.delete('/orders/:uuid', async (req: any, res: any) => {
  try {
    const result = await Order.findOneAndDelete({ uuid: req.params.uuid });
    if (!result) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Public Receipt View Endpoint (must come before /orders/:uuid to avoid conflict)
apiRouter.get('/orders/public/:uuid', async (req: any, res: any) => {
  try {
    const order = await Order.findOne({ uuid: req.params.uuid });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Order Sync / Create Endpoint (upsert)
apiRouter.post('/sync/order', async (req: any, res: any) => {
  try {
    const { id, syncStatus, ...rest } = req.body;
    const orderData = { ...rest, localId: id };

    const existing = await Order.findOne({ uuid: orderData.uuid });
    if (existing) {
      return res.json({ success: true, message: 'Already synced', data: existing });
    }

    const order = new Order(orderData);
    await order.save();
    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// ─── PARTIES ─────────────────────────────────────────────────────────────────

// Get all parties for a restaurant
apiRouter.get('/parties', async (req: any, res: any) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'restaurantId required' });
    const parties = await Party.find({ restaurantId });
    res.json({ success: true, data: parties });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create a new party
apiRouter.post('/parties', async (req: any, res: any) => {
  try {
    const { restaurantId, ...partyData } = req.body;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'restaurantId required' });
    const party = new Party({ restaurantId, ...partyData });
    await party.save();
    res.json({ success: true, data: party });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Delete a party
apiRouter.delete('/parties/:id', async (req: any, res: any) => {
  try {
    const result = await Party.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Party not found' });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── PURCHASES ───────────────────────────────────────────────────────────────

// Get all purchases for a restaurant
apiRouter.get('/purchases', async (req: any, res: any) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'restaurantId required' });
    const purchases = await Purchase.find({ restaurantId }).sort({ timestamp: -1 });
    res.json({ success: true, data: purchases });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create a new purchase
apiRouter.post('/purchases', async (req: any, res: any) => {
  try {
    const { restaurantId, ...purchaseData } = req.body;
    if (!restaurantId) return res.status(400).json({ success: false, error: 'restaurantId required' });
    const purchase = new Purchase({ restaurantId, ...purchaseData });
    await purchase.save();
    res.json({ success: true, data: purchase });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Delete a purchase
apiRouter.delete('/purchases/:id', async (req: any, res: any) => {
  try {
    const result = await Purchase.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, error: 'Purchase not found' });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── INVENTORY (stored as Restaurant.defaultMenu in MongoDB) ──────────────────

// Get inventory items for a restaurant
apiRouter.get('/inventory/:restaurantId', async (req: any, res: any) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    res.json({ success: true, data: restaurant.defaultMenu });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Replace full inventory list
apiRouter.put('/inventory/:restaurantId', async (req: any, res: any) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ success: false, error: 'items array required' });
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.restaurantId,
      { $set: { defaultMenu: items } },
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });
    res.json({ success: true, data: restaurant.defaultMenu });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Deduct stock for sold items
apiRouter.post('/inventory/:restaurantId/deduct', async (req: any, res: any) => {
  try {
    const { deductions } = req.body; // [{ itemId, name, qty }]
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, error: 'Restaurant not found' });

    const menu: any[] = (restaurant.defaultMenu as any[]) || [];
    for (const { itemId, name, qty } of deductions) {
      const item = menu.find((m: any) => m.id === itemId || m.name === name);
      if (item) {
        item.stock = Math.max(0, (Number(item.stock) || 0) - Number(qty));
      }
    }

    await Restaurant.findByIdAndUpdate(req.params.restaurantId, { $set: { defaultMenu: menu } });
    res.json({ success: true, data: menu });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

const publicInvoicesDir = path.join(__dirname, '../public/invoices');
if (!fs.existsSync(publicInvoicesDir)) {
  fs.mkdirSync(publicInvoicesDir, { recursive: true });
}

apiRouter.post('/orders/upload-image/:uuid', async (req: any, res: any) => {
  try {
    const { uuid } = req.params;
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image base64 provided' });
    }

    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '');
    const filePath = path.join(publicInvoicesDir, `${uuid}.png`);
    fs.writeFileSync(filePath, base64Data, 'base64');

    res.json({ success: true, imageUrl: `/public/invoices/${uuid}.png` });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default apiRouter;
