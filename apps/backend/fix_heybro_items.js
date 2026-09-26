require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  
  await db.collection('restaurants').updateOne(
    { name: { $regex: /heybro/i } },
    {
      $set: {
        defaultMenu: [
          { id: 'item1', name: 'Cotton T-Shirt', price: 499, category: 'Shirts', type: 'apparel', stock: 50 },
          { id: 'item2', name: 'Blue Denim Jeans', price: 999, category: 'Jeans', type: 'apparel', stock: 100 },
          { id: 'item3', name: 'Silk Saree', price: 2999, category: 'Sarees', type: 'apparel', stock: 40 }
        ]
      }
    }
  );
  
  console.log('Fixed HEYBRO menu items');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
