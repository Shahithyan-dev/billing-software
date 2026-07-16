import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String },
  phone: { type: String, required: true },
  gstin: { type: String },
  fssai: { type: String },
  logo: { type: String },
  address: { type: String },
}, { timestamps: true });

export default mongoose.model('Restaurant', RestaurantSchema);
