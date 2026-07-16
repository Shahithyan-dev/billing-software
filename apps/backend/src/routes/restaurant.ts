import { Router } from 'express';
import Restaurant from '../models/Restaurant';

const router = Router();

// Create a new restaurant
router.post('/', async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    await restaurant.save();
    res.status(201).json({ success: true, data: restaurant });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get a specific restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all restaurants (for demo purposes)
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json({ success: true, data: restaurants });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
