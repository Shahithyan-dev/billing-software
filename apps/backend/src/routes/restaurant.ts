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

// Update an existing restaurant
router.put('/:id', async (req, res) => {
  try {
    const { name, tagline, phone, gstin, fssai, address, captains, tables, diningAreas, menuCategories, sidebarFeatures, initialMenu } = req.body;
    
    const updateData: any = {
      name, tagline, phone, gstin, fssai, address, captains, tables, diningAreas, menuCategories, sidebarFeatures
    };
    
    if (initialMenu) {
      updateData.defaultMenu = initialMenu;
    }
    
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    
    res.status(200).json({ success: true, data: restaurant });
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
// Delete a specific restaurant by ID
router.delete('/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }
    
    // Import User model inline to avoid circular dependency issues if any, or just import it at top.
    const User = require('../models/User').default;
    await User.deleteMany({ restaurantId });

    res.status(200).json({ success: true, message: 'Restaurant and associated users deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
