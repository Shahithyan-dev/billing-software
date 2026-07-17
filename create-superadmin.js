const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Create a minimal User schema directly for this script
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'staff'], default: 'admin' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL is missing in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(dbUrl);
    console.log('Connected to DB');

    const email = 'admin@servewell.com';
    const password = 'servewelladmin';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Superadmin already exists!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'superadmin'
      // No restaurantId required for superadmin
    });

    await user.save();
    console.log(`Superadmin created successfully!\nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
}

createSuperAdmin();
