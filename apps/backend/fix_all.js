require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  const rests = await db.collection('restaurants').find({}).toArray();
  
  let fixedCount = 0;
  for (const target of rests) {
    const nameStr = (target.name || '').toLowerCase();
    
    // HEYBRO is Retail
    if (nameStr.includes('heybro')) {
      await db.collection('restaurants').updateOne(
        { _id: target._id },
        { 
          $set: { 
            businessType: 'dress',
            sidebarFeatures: ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
            menuCategories: ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans', 'Churidar', 'Kids Wear']
          }
        }
      );
      fixedCount++;
    } 
    // Actual Pharmacies (if any)
    else if (nameStr.includes('pharmacy') || nameStr.includes('medical') || nameStr.includes('apollo')) {
      // Leave as pharmacy
    }
    // Everything else defaults to Restaurant
    else {
      await db.collection('restaurants').updateOne(
        { _id: target._id },
        { 
          $set: { 
            businessType: 'restaurant',
            sidebarFeatures: ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'],
            menuCategories: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages']
          }
        }
      );
      
      // If their menu has Paracetamol, let's just clear it out or put a default restaurant item
      // because we accidentally overwrote it.
      if (target.defaultMenu && target.defaultMenu.length > 0 && target.defaultMenu[0].name.includes('Paracetamol')) {
         await db.collection('restaurants').updateOne(
           { _id: target._id },
           {
             $set: {
               defaultMenu: [
                  { id: 'item1', name: 'Masala Dosa', price: 60, category: 'Breakfast', type: 'veg', stock: 50 },
                  { id: 'item2', name: 'Idli (2 pcs)', price: 30, category: 'Breakfast', type: 'veg', stock: 100 },
                  { id: 'item3', name: 'Meals', price: 120, category: 'Lunch', type: 'veg', stock: 40 }
               ]
             }
           }
         )
      }
      
      fixedCount++;
    }
  }
  
  console.log('Fixed', fixedCount, 'tenants in the database');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
