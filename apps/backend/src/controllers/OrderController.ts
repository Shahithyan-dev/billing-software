import { Request, Response } from 'express';
import { io } from '../index';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, type, total } = req.body;

    const orderData = {
      id: Math.random().toString(36).substr(2, 9),
      type: type || 'Dine In',
      total,
      status: 'Pending',
      items: items || []
    };

    io.emit('new_order', orderData);

    res.json({ success: true, order: orderData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
