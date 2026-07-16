import { Request, Response } from 'express';
import { prisma, io } from '../index';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, type, total } = req.body;

    const order = await prisma.order.create({
      data: {
        type: type || 'Dine In',
        total: total,
        status: 'Pending',
        items: {
          create: items.map((i: any) => ({
            menuItemId: i.id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
          }))
        },
        kitchenOrders: {
          create: {
            station: 'Main Kitchen',
            status: 'Pending'
          }
        }
      },
      include: {
        items: true,
        kitchenOrders: true
      }
    });

    // Alert Kitchen Display System in realtime
    io.emit('new-kitchen-order', order);

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
