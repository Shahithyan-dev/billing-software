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
            sidebarFeatures: ['POS', 'Medicines', 'Categories', 'Inventory', 'Purchase', 'Purchase Return', 'Sales', 'Sales Return', 'Customers', 'Prescriptions', 'Suppliers', 'Manufacturers', 'Batch Management', 'Expiry Alerts', 'Barcode Printing', 'Analytics', 'Reports', 'Staff', 'Settings'],
            menuCategories: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops', 'Surgicals', 'General']
          }
        }
      );
      console.log('Successfully updated sidebarFeatures and menuCategories for tenant:', target.name);
    }
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
