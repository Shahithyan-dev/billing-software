import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Restaurant from '../models/Restaurant';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

router.post('/register', async (req, res) => {
  try {
    const { name, tagline, phone, gstin, fssai, address, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // 1. Create the Restaurant
    const restaurant = new Restaurant({
      name, tagline, phone, gstin, fssai, address
    });
    await restaurant.save();

    // 2. Create the Admin User for this Restaurant
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'admin',
      restaurantId: restaurant._id
    });
    await user.save();

    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, restaurantId: user.restaurantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      restaurantId: user.restaurantId 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
