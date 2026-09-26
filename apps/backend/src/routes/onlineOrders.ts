import express from 'express';
import OnlineOrder from '../models/OnlineOrder';
import { io } from '../index';

const router = express.Router();

// GET all active online orders for a restaurant
router.get('/:restaurantId', async (req, res) => {
  try {
    const orders = await OnlineOrder.find({ restaurantId: req.params.restaurantId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch online orders' });
  }
});

// POST webhook - Aggregate sends order here
router.post('/webhook', async (req, res) => {
  try {
    const { orderId, restaurantId, platform, customerName, phone, items, total, time } = req.body;
    
    // Create new order
    const newOrder = await OnlineOrder.create({
      orderId,
      restaurantId,
      platform,
      customerName,
      phone,
      items,
      total,
      time,
      status: 'new'
    });

    // Push the order to the restaurant's POS frontend via Socket.io
    io.emit(`new_online_order_${restaurantId}`, newOrder);

    res.status(201).json({ success: true, message: 'Order received', data: newOrder });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Push the status update to the POS frontend
    io.emit(`online_order_updated_${order.restaurantId}`, order);

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

export default router;
