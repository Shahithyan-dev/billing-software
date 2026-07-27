import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import RegistrationRequest from '../models/RegistrationRequest';

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
    const { name, businessType, tagline, phone, gstin, fssai, address, email, password, captains, tables, diningAreas, menuCategories, sidebarFeatures, preferences, initialMenu, whatsappNumber, whatsappToken, whatsappBusinessId } = req.body;

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
      name, businessType: businessType || 'restaurant', tagline, phone, gstin, fssai, address,
      captains: parsedCaptains || ['Captain', 'Self Service'],
      tables: parsedTables || ['T1', 'T2', 'T3'],
      diningAreas: parsedDiningAreas || ['AC', 'Non-AC'],
      menuCategories: parsedMenuCategories || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
      sidebarFeatures: parsedSidebarFeatures || ['POS', 'Kitchen', 'Settings'],
      preferences: parsedPreferences || { showGstin: true, showFssai: true, showPhone: true },
      whatsappNumber: whatsappNumber || '',
      whatsappToken: whatsappToken || '',
      whatsappBusinessId: whatsappBusinessId || '',
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

// ─── REGISTRATION REQUESTS (Landing Page Workflow) ──────────────────────────

// Submit a new registration request (Public)
router.post('/register-request', async (req: any, res: any) => {
  try {
    const { name, email, phone, businessName, businessType, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const newRequest = new RegistrationRequest({
      name, email, phone, businessName, businessType, password
    });
    await newRequest.save();
    res.status(201).json({ success: true, message: 'Registration request submitted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all pending requests (Super Admin Only)
router.get('/register-requests', async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const adminToken = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (decoded.role !== 'superadmin') return res.status(403).json({ success: false, error: 'Forbidden' });

    const requests = await RegistrationRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve a request (Super Admin Only)
router.post('/register-requests/:id/approve', async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const adminToken = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (decoded.role !== 'superadmin') return res.status(403).json({ success: false, error: 'Forbidden' });

    const request = await RegistrationRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, error: 'Request not found or not pending' });
    }

    // Provision the tenant
    const restaurant = new Restaurant({
      name: request.businessName,
      businessType: request.businessType,
      phone: request.phone,
      captains: request.businessType === 'dress' ? ['Salesperson 1'] : ['Captain', 'Self Service'],
      tables: request.businessType === 'dress' ? [] : ['T1', 'T2', 'T3'],
      diningAreas: request.businessType === 'dress' ? [] : ['AC', 'Non-AC'],
      menuCategories: request.businessType === 'dress' 
        ? ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', 'Churidar', 'Kids Wear']
        : ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
      sidebarFeatures: request.businessType === 'dress'
        ? ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings']
        : ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'],
      preferences: { showGstin: true, showFssai: true, showPhone: true },
      defaultMenu: []
    });
    await restaurant.save();

    const hashedPassword = await bcrypt.hash(request.password, 10);
    const user = new User({
      email: request.email,
      password: hashedPassword,
      role: 'admin',
      restaurantId: restaurant._id
    });
    await user.save();

    request.status = 'approved';
    await request.save();

    res.json({ success: true, message: 'Request approved and tenant provisioned' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject a request (Super Admin Only)
router.post('/register-requests/:id/reject', async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
    
    const adminToken = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(adminToken, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (decoded.role !== 'superadmin') return res.status(403).json({ success: false, error: 'Forbidden' });

    const request = await RegistrationRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ success: false, error: 'Request not found or not pending' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Request rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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

    const restaurant = await Restaurant.findById(user.restaurantId);

    // Generate JWT Token (10 years for persistent session)
    const token = jwt.sign(
      { userId: user._id, restaurantId: user.restaurantId, role: user.role },
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
        businessType: (restaurant as any)?.businessType || 'restaurant',
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
    
    res.status(200).json({ success: true, message: 'Valid session' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
