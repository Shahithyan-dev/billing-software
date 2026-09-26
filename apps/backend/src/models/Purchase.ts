import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  batchNo: { type: String },
  expiryDate: { type: String },
  purchasePrice: { type: Number, required: true },
  gstPercent: { type: Number, default: 0 },
  qty: { type: Number, required: true },
  total: { type: Number, required: true }
});

const PurchaseSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  supplier: { type: String, required: true },
  supplierId: { type: String }, // References Party
  items: [PurchaseItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
