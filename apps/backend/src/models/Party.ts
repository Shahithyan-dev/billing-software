import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  type: { type: String, enum: ['customer', 'supplier'], required: true },
  balance: { type: Number, default: 0 },
  lastTransaction: { type: Date }
}, { timestamps: true });

export default mongoose.models.Party || mongoose.model('Party', PartySchema);
