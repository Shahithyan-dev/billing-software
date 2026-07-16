import { Request, Response } from 'express';
import { prisma } from '../index';

export const getMenu = async (req: Request, res: Response) => {
  try {
    let categories = await prisma.menuCategory.findMany({
      include: { items: true }
    });

    // Seed if empty
    if (categories.length === 0) {
      console.log('Seeding initial menu...');
      const cat = await prisma.menuCategory.create({
        data: {
          name: 'Main Course',
          items: {
            create: [
              { name: 'Gourmet Burger', price: 18.99, gst: 5, isVeg: false },
              { name: 'Truffle Pasta', price: 24.50, gst: 5, isVeg: true },
            ]
          }
        }
      });
      categories = [await prisma.menuCategory.findUnique({ where: { id: cat.id }, include: { items: true } }) as any];
    }

    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};
