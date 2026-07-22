import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Restaurant from '../models/Restaurant';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

router.post('/register', async (req: any, res: any) => {
  try {
    // Check for superadmin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized. Super Admin access required.' });
    }
    const adminToken = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'Forbidden. Only Super Admins can register new restaurants.' });
    }
    const { name, tagline, phone, gstin, fssai, address, email, password, captains, tables, diningAreas, menuCategories, sidebarFeatures, preferences, initialMenu } = req.body;

    // Parse JSON fields
    const parsedCaptains = typeof captains === 'string' ? JSON.parse(captains) : captains;
    const parsedTables = typeof tables === 'string' ? JSON.parse(tables) : tables;
    const parsedDiningAreas = typeof diningAreas === 'string' ? JSON.parse(diningAreas) : diningAreas;
    const parsedMenuCategories = typeof menuCategories === 'string' ? JSON.parse(menuCategories) : menuCategories;
    const parsedSidebarFeatures = typeof sidebarFeatures === 'string' ? JSON.parse(sidebarFeatures) : sidebarFeatures;
    const parsedPreferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    const parsedInitialMenu = typeof initialMenu === 'string' ? JSON.parse(initialMenu) : initialMenu;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    let menuPdfUrl = null;

    // 1. Create the Restaurant
    const restaurant = new Restaurant({
      name, tagline, phone, gstin, fssai, address,
      captains: parsedCaptains || ['Captain', 'Self Service'],
      tables: parsedTables || ['T1', 'T2', 'T3'],
      diningAreas: parsedDiningAreas || ['AC', 'Non-AC'],
      menuCategories: parsedMenuCategories || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
      sidebarFeatures: parsedSidebarFeatures || ['POS', 'Kitchen', 'Settings'],
      preferences: parsedPreferences || { showGstin: true, showFssai: true, showPhone: true },
      defaultMenu: parsedInitialMenu || [],
      menuPdfUrl
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

    // Generate JWT Token (10 years for persistent session)
    const token = jwt.sign(
      { userId: user._id, restaurantId: user.restaurantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '3650d' }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      token,
      restaurantId: restaurant._id
    });
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

    // Generate a new session token to invalidate other sessions
    const sessionToken = require('crypto').randomUUID();
    user.sessionToken = sessionToken;
    await user.save();

    const restaurant = await Restaurant.findById(user.restaurantId);

    // Generate JWT Token (10 years for persistent session)
    const token = jwt.sign(
      { userId: user._id, restaurantId: user.restaurantId, role: user.role, sessionToken },
      JWT_SECRET,
      { expiresIn: '3650d' }
    );

    res.status(200).json({ 
      success: true, 
      token, 
      restaurantId: user.restaurantId,
      role: user.role,
      captains: restaurant?.captains || [],
      tables: restaurant?.tables || [],
      sidebarFeatures: restaurant?.sidebarFeatures || [],
      defaultMenu: restaurant?.defaultMenu || [],
      restaurant: {
        name: restaurant?.name || '',
        tagline: restaurant?.tagline || '',
        phone: restaurant?.phone || '',
        gstin: restaurant?.gstin || '',
        fssai: restaurant?.fssai || '',
        logo: restaurant?.logo || '',
        diningAreas: restaurant?.diningAreas || ['AC', 'Non-AC'],
        menuCategories: restaurant?.menuCategories || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify current session
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    // Check if the sessionToken matches the database
    // Exempt superadmins from this check so they can be logged into the Admin Portal and POS simultaneously
    if (user.role !== 'superadmin' && user.sessionToken && decoded.sessionToken !== user.sessionToken) {
      return res.status(401).json({ success: false, error: 'Session expired due to login from another device' });
    }
    
    res.status(200).json({ success: true, message: 'Valid session' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
