import mongoose from 'mongoose';

const RegistrationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['restaurant', 'dress'], required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  gstNumber: { type: String },
  rawMenuText: { type: String },
  plan: { type: String, enum: ['monthly_standard', 'monthly_unlimited', 'yearly_standard', 'yearly_unlimited', 'lifetime_standard', 'lifetime_unlimited'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('RegistrationRequest', RegistrationRequestSchema);
