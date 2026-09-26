require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  
  // Set HEYBRO back to retail (dress) and restore retail items
  const result = await db.collection('restaurants').updateOne(
    { name: /heybro/i },
    {
      $set: {
        businessType: 'dress',
        sidebarFeatures: ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
        menuCategories: ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', 'Churidar', 'Kids Wear'],
        defaultMenu: [
          { id: crypto.randomUUID(), name: 'Formal Shirt', price: 1499, category: 'Shirts', type: 'standard', stock: 50 },
          { id: crypto.randomUUID(), name: 'Regular Fit Jeans', price: 1799, category: 'Jeans', type: 'standard', stock: 30 },
          { id: crypto.randomUUID(), name: 'Cargo Pants', price: 1899, category: 'Pants', type: 'standard', stock: 100 },
          { id: crypto.randomUUID(), name: 'Track Pants', price: 999, category: 'Sportswear', type: 'standard', stock: 200 }
        ]
      }
    }
  );
  
  console.log('Fixed HEYBRO back to Retail:', result.modifiedCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
