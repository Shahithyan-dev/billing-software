require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  
  // Set HEYBRO to restaurant and restore some basic restaurant items
  const result = await db.collection('restaurants').updateOne(
    { name: /heybro/i },
    {
      $set: {
        businessType: 'restaurant',
        sidebarFeatures: ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'],
        menuCategories: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
        defaultMenu: [
          { id: crypto.randomUUID(), name: 'Chicken Biryani', price: 250, category: 'Lunch', type: 'non-veg', stock: 50 },
          { id: crypto.randomUUID(), name: 'Paneer Butter Masala', price: 180, category: 'Dinner', type: 'veg', stock: 30 },
          { id: crypto.randomUUID(), name: 'Masala Dosa', price: 60, category: 'Breakfast', type: 'veg', stock: 100 },
          { id: crypto.randomUUID(), name: 'Fresh Lime Soda', price: 40, category: 'Beverages', type: 'veg', stock: 200 }
        ]
      }
    }
  );
  
  console.log('Fixed HEYBRO:', result.modifiedCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
