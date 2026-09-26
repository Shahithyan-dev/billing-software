import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  rxId: { type: String, required: true },
  customerName: { type: String, required: true },
  doctorName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  itemsCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
