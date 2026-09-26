import mongoose from 'mongoose';

const SalesReturnItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  batchNo: { type: String },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
});

const SalesReturnSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  returnId: { type: String, required: true },
  originalInvoiceId: { type: String },
  customerName: { type: String, required: true },
  reason: { type: String, required: true },
  items: [SalesReturnItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Pending Approval'], default: 'Completed' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.SalesReturn || mongoose.model('SalesReturn', SalesReturnSchema);
