import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import RegistrationRequest from '../models/RegistrationRequest';
import { sendApprovalEmail } from '../utils/mailer';

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
      menuPdfUrl,
      subscriptionPlan: (req.body.plan || 'lifetime').split('_')[0],
      planTier: (req.body.plan || 'lifetime').includes('_') ? req.body.plan.split('_')[1] : 'standard'
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
    const { name, email, phone, businessName, businessType, password, address, gstNumber, fssai, dlNumber, pharmacistName, plan, rawMenuText, captains, tables, diningAreas, acCharge, acBillingType, acPerHeadAmount, rawMenuTextAC } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const newRequest = new RegistrationRequest({
      name, email, phone, businessName, businessType, password, address, gstNumber, fssai, dlNumber, pharmacistName, plan, rawMenuText, captains, tables, diningAreas, acCharge, acBillingType, acPerHeadAmount, rawMenuTextAC
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

    const { layout } = req.body;
    const finalLayout = layout || request.businessType;
    request.businessType = finalLayout; // override if admin selected a different layout

    let defaultMenu: any[] = [];
    if (request.rawMenuText) {
      const lines = request.rawMenuText.split('\n');
      lines.forEach((line: string) => {
        if (!line.trim()) return;
        // Split by tab (Excel paste) or comma
        const parts = line.split(/\t|,/);
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const price = parseFloat(parts[1].trim()) || 0;
          const category = parts.length >= 3 ? parts[2].trim() : 'General';
          const type = parts.length >= 4 ? parts[3].trim() : (finalLayout === 'dress' ? 'N/A' : 'veg');
          const stock = (finalLayout === 'dress' && parts.length >= 5) ? parseInt(parts[4].trim()) || 0 : undefined;
          
          let item: any = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            price,
            category,
            type,
            img: ''
          };
          if (stock !== undefined) {
            item.stock = stock;
          }
          defaultMenu.push(item);
        }
      });
    }

    let acMenu: any[] = [];
    if (request.acBillingType === 'separate_menu' && request.rawMenuTextAC) {
      const acLines = request.rawMenuTextAC.split('\n');
      acLines.forEach((line: string) => {
        if (!line.trim()) return;
        const parts = line.split(/\t|,/);
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const price = parseFloat(parts[1].trim()) || 0;
          const category = parts.length >= 3 ? parts[2].trim() : 'General';
          const type = parts.length >= 4 ? parts[3].trim() : (finalLayout === 'dress' ? 'N/A' : 'veg');
          const stock = (finalLayout === 'dress' && parts.length >= 5) ? parseInt(parts[4].trim()) || 0 : undefined;
          
          let item: any = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            price,
            category,
            type,
            img: ''
          };
          if (stock !== undefined) {
            item.stock = stock;
          }
          acMenu.push(item);
        }
      });
    }

    // Provision the tenant
    const isRestaurant = finalLayout === 'restaurant';
    const restaurant = new Restaurant({
      name: request.businessName,
      businessType: finalLayout,
      phone: request.phone,
      address: request.address || '',
      gstin: request.gstNumber || '',
      fssai: request.fssai || (isRestaurant ? 'Pending' : ''),
      dlNumber: request.dlNumber || '',
      pharmacistName: request.pharmacistName || '',
      captains: request.captains ? request.captains.split(',').map((s: string) => s.trim()) : (isRestaurant ? ['Captain', 'Self Service'] : ['Salesperson 1']),
      tables: request.tables ? request.tables.split(',').map((s: string) => s.trim()) : (isRestaurant ? ['T1', 'T2', 'T3'] : []),
      diningAreas: request.diningAreas ? request.diningAreas.split(',').map((s: string) => s.trim()) : (isRestaurant ? ['AC', 'Non-AC'] : []),
      menuCategories: finalLayout === 'pharmacy' 
        ? ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops', 'Surgicals', 'General']
        : finalLayout === 'dress' 
          ? ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', 'Churidar', 'Kids Wear']
          : (isRestaurant ? ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'] : ['Electronics', 'Clothing', 'Groceries', 'Home', 'Beauty', 'Others']),
      sidebarFeatures: finalLayout === 'pharmacy'
        ? ['POS', 'Medicines', 'Categories', 'Inventory', 'Purchase', 'Purchase Return', 'Sales', 'Sales Return', 'Customers', 'Prescriptions', 'Suppliers', 'Manufacturers', 'Batch Management', 'Expiry Alerts', 'Barcode Printing', 'Analytics', 'Reports', 'Staff', 'Settings']
        : isRestaurant
          ? ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings']
          : ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
      preferences: { 
        showGstin: !!request.gstNumber, 
        showFssai: isRestaurant, 
        showPhone: true, 
        acCharge: request.acCharge || '',
        acBillingType: request.acBillingType || 'per_head',
        acPerHeadAmount: request.acPerHeadAmount || 0
      },
      defaultMenu,
      acMenu,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscriptionPlan: (request.plan || 'lifetime').split('_')[0],
      planTier: (request.plan || 'lifetime').includes('_') ? request.plan.split('_')[1] : 'standard'
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

    // Send the welcome email with credentials
    await sendApprovalEmail(request.email, request.password);

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
        menuCategories: restaurant?.menuCategories || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
        subscriptionPlan: (restaurant as any)?.subscriptionPlan || 'lifetime',
        subscriptionStatus: restaurant?.subscriptionStatus || 'trial',
        trialEndsAt: restaurant?.trialEndsAt || null,
        subscriptionEndsAt: restaurant?.subscriptionEndsAt || null
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
