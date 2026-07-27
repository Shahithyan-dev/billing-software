import mongoose from 'mongoose';

const RegistrationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['restaurant', 'dress'], required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('RegistrationRequest', RegistrationRequestSchema);
