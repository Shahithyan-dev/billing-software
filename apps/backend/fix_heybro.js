require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  const result = await db.collection('restaurants').updateMany(
    { name: { $regex: /heybro/i } },
    { 
      $set: { 
        businessType: 'dress',
        sidebarFeatures: ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
        menuCategories: ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', 'Churidar', 'Kids Wear']
      }
    }
  );
  console.log('Fixed', result.modifiedCount, 'tenants named HEYBRO');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
