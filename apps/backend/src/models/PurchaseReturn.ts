import mongoose from 'mongoose';

const ReturnItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  batchNo: { type: String },
  expiryDate: { type: String },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
});

const PurchaseReturnSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  returnId: { type: String, required: true },
  supplier: { type: String, required: true },
  supplierId: { type: String },
  reason: { type: String, required: true },
  items: [ReturnItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending'], default: 'Completed' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.PurchaseReturn || mongoose.model('PurchaseReturn', PurchaseReturnSchema);
