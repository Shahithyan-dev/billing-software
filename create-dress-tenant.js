const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

const restaurantSchema = new mongoose.Schema({
  name: String,
  businessType: String,
  tagline: String,
  phone: String,
  gstin: String,
  address: String,
  captains: [String],
  tables: [String],
  diningAreas: [String],
  menuCategories: [String],
  sidebarFeatures: [String],
  whatsappNumber: String,
  whatsappToken: String,
  whatsappBusinessId: String,
  defaultMenu: [mongoose.Schema.Types.Mixed],
  preferences: { showGstin: Boolean, showFssai: Boolean, showPhone: Boolean }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false },
  sessionToken: String,
  updatedAt: Date
});

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createDressTenant() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // --- CHANGE THESE VALUES FOR YOUR DEMO ---
    const shopName     = 'Sri Murugan Silks';
    const shopPhone    = '9876543210';
    const shopGstin    = '33ABCDE1234F1Z5';
    const shopAddress  = '123 Shopping Street, City';
    const loginEmail   = 'dress@servewell.com';
    const loginPassword = 'dress1234';
    // -----------------------------------------

    // Check if user already exists
    const existing = await User.findOne({ email: loginEmail });
    if (existing) {
      console.log(`User ${loginEmail} already exists! Updating restaurant data...`);
      const rest = await Restaurant.findById(existing.restaurantId);
      if (rest) {
        console.log(`Linked Restaurant: ${rest.name} (ID: ${rest._id})`);
      }
      await mongoose.disconnect();
      return;
    }

    // Create Restaurant
    const restaurant = new Restaurant({
      name: shopName,
      businessType: 'dress',
      tagline: 'Premium Clothing Store',
      phone: shopPhone,
      gstin: shopGstin,
      address: shopAddress,
      captains: ['Salesperson 1'],
      tables: [],
      diningAreas: [],
      menuCategories: ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans'],
      sidebarFeatures: ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
      whatsappNumber: '',
      whatsappToken: '',
      whatsappBusinessId: '',
      defaultMenu: [
        { id: 'd1', name: 'Kanchipuram Silk Saree', price: 15000, purchasePrice: 12000, category: 'Sarees', type: 'standard', stock: 10, img: '' },
        { id: 'd2', name: 'Cotton Kurti', price: 850, purchasePrice: 500, category: 'Kurtis', type: 'standard', stock: 50, img: '' },
        { id: 'd3', name: 'Designer Lehenga', price: 25000, purchasePrice: 18000, category: 'Lehengas', type: 'standard', stock: 5, img: '' },
        { id: 'd4', name: 'Mens Casual Shirt', price: 1200, purchasePrice: 800, category: 'Shirts', type: 'standard', stock: 30, img: '' },
        { id: 'd5', name: 'Denim Jeans', price: 1800, purchasePrice: 1000, category: 'Jeans', type: 'standard', stock: 25, img: '' }
      ],
      preferences: { showGstin: true, showFssai: false, showPhone: true }
    });

    await restaurant.save();
    console.log(`✅ Restaurant created: ${restaurant.name} (ID: ${restaurant._id})`);

    // Create User
    const hashedPassword = await bcrypt.hash(loginPassword, 10);
    const user = new User({
      email: loginEmail,
      password: hashedPassword,
      role: 'admin',
      restaurantId: restaurant._id
    });

    await user.save();
    console.log(`✅ User created successfully!`);
    console.log(`\n🎉 DONE! Use these credentials in the Dress App login:`);
    console.log(`   Email:    ${loginEmail}`);
    console.log(`   Password: ${loginPassword}`);
    console.log(`   Shop:     ${shopName}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createDressTenant();
