import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String },
  phone: { type: String, required: true },
  gstin: { type: String },
  fssai: { type: String },
  logo: { type: String },
  address: { type: String },
  captains: { type: [String], default: ['Captain', 'Rahul', 'Priya', 'Self Service'] },
  tables: { type: [String], default: ['T1', 'T2', 'T3', 'T4', 'T5'] },
  sidebarFeatures: { type: [String], default: ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'] },
  preferences: {
    showGstin: { type: Boolean, default: true },
    showFssai: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
  },
  defaultMenu: { type: Array, default: [] },
  menuPdfUrl: { type: String },
}, { timestamps: true });

export default mongoose.model('Restaurant', RestaurantSchema);
