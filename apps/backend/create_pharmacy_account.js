require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;

  // Create Restaurant
  const restaurantRes = await db.collection('restaurants').insertOne({
    name: 'Zynco Pharmacy',
    businessType: 'pharmacy',
    tagline: 'Your Health Partner',
    phone: '9876543210',
    gstin: '29ABCDE1234F2Z5',
    fssai: '',
    address: '123 Health Ave, Medical District',
    captains: ['Pharmacist 1', 'Pharmacist 2'],
    tables: ['Counter 1', 'Counter 2'],
    diningAreas: ['Main'],
    menuCategories: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops', 'Surgicals', 'General'],
    sidebarFeatures: ['POS', 'Medicines', 'Categories', 'Inventory', 'Purchase', 'Purchase Return', 'Sales', 'Sales Return', 'Customers', 'Prescriptions', 'Suppliers', 'Manufacturers', 'Batch Management', 'Expiry Alerts', 'Barcode Printing', 'Analytics', 'Reports', 'Staff', 'Settings'],
    preferences: { showGstin: true, showFssai: false, showPhone: true },
    defaultMenu: [
      { id: '17848990370301', name: 'Paracetamol 500mg', price: 45, purchasePrice: 20, category: 'Tablets', type: 'standard', genericName: 'Paracetamol', mrp: 45, stock: 100, variants: [{size: 'Batch A', stock: 100, expiry: '2027-12-31'}] },
      { id: '17848990370302', name: 'Amoxicillin 250mg', price: 120, purchasePrice: 80, category: 'Capsules', type: 'standard', genericName: 'Amoxicillin', mrp: 120, stock: 50, variants: [{size: 'Batch B', stock: 50, expiry: '2026-10-15'}] },
      { id: '17848990370303', name: 'Cough Syrup 100ml', price: 85, purchasePrice: 50, category: 'Syrups', type: 'standard', genericName: 'Dextromethorphan', mrp: 85, stock: 30, variants: [{size: 'Batch C', stock: 30, expiry: '2025-06-30'}] }
    ],
    subscriptionPlan: 'lifetime',
    planTier: 'standard',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const restaurantId = restaurantRes.insertedId;

  // Create Admin User
  const hashedPassword = await bcrypt.hash('123456', 10);
  await db.collection('users').insertOne({
    email: 'pharmacy@zyncobill.com',
    password: hashedPassword,
    role: 'admin',
    restaurantId: restaurantId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('Successfully created new Pharmacy tenant!');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
