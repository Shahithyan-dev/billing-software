import { Request, Response } from 'express';

export const getMenu = async (req: Request, res: Response) => {
  try {
    // Return empty for now until MongoDB models are built for Menu
    res.json({ categories: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};
