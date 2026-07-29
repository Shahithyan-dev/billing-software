import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  businessType: { type: String, enum: ['restaurant', 'dress'], default: 'restaurant' },
  tagline: { type: String },
  phone: { type: String, required: true },
  gstin: { type: String },
  fssai: { type: String },
  logo: { type: String },
  address: { type: String },
  captains: { type: [String], default: ['Captain', 'Rahul', 'Priya', 'Self Service'] },
  tables: { type: [String], default: ['T1', 'T2', 'T3', 'T4', 'T5'] },
  diningAreas: { type: [String], default: ['AC', 'Non-AC'] },
  menuCategories: { type: [String], default: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'] },
  sidebarFeatures: { type: [String], default: ['POS', 'Kitchen', 'Inventory', 'Reservations', 'Analytics', 'Staff', 'Loyalty', 'Hardware', 'Security', 'Settings'] },
  preferences: {
    showGstin: { type: Boolean, default: true },
    showFssai: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
  },
  whatsappNumber: { type: String, default: '' },
  whatsappToken: { type: String, default: '' },
  whatsappBusinessId: { type: String, default: '' },
  defaultMenu: { type: Array, default: [] },
  menuPdfUrl: { type: String },
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'expired', 'cancelled'], default: 'trial' },
  trialEndsAt: { type: Date },
  subscriptionEndsAt: { type: Date },
  planTier: { type: String, enum: ['standard', 'unlimited'], default: 'standard' },
}, { timestamps: true });

export default mongoose.model('Restaurant', RestaurantSchema);
