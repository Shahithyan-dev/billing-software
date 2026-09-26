import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, default: 'Server' },
  status: { type: String, enum: ['Clocked In', 'Clocked Out', 'Off Duty'], default: 'Clocked Out' },
  shift: { type: String, default: 'Morning' },
  hours: { type: Number, default: 0 },
  phone: { type: String },
  email: { type: String },
  // Supplier specific fields
  companyName: { type: String },
  gstin: { type: String },
}, { timestamps: true });

export default mongoose.model('Staff', StaffSchema);
