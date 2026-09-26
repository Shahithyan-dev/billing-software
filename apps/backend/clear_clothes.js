require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  const rests = await db.collection('restaurants').find({}).toArray();
  if (rests.length > 0) {
    for (const target of rests) {
      await db.collection('restaurants').updateOne(
        { _id: target._id },
        { 
          $set: { 
            businessType: 'pharmacy',
            defaultMenu: [
              { id: '17848990370301', name: 'Paracetamol 500mg', price: 45, purchasePrice: 20, category: 'Tablets', type: 'standard', genericName: 'Paracetamol', mrp: 45, stock: 100, variants: [{size: 'Batch A', stock: 100, expiry: '2027-12-31'}] },
              { id: '17848990370302', name: 'Amoxicillin 250mg', price: 120, purchasePrice: 80, category: 'Capsules', type: 'standard', genericName: 'Amoxicillin', mrp: 120, stock: 50, variants: [{size: 'Batch B', stock: 50, expiry: '2026-10-15'}] },
              { id: '17848990370303', name: 'Cough Syrup 100ml', price: 85, purchasePrice: 50, category: 'Syrups', type: 'standard', genericName: 'Dextromethorphan', mrp: 85, stock: 30, variants: [{size: 'Batch C', stock: 30, expiry: '2025-06-30'}] }
            ]
          }
        }
      );
      console.log('Successfully wiped clothes and injected Pharmacy mock data for tenant:', target.name);
    }
  } else {
    console.log('No tenants found.');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
