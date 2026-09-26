import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String },
  category: { type: String, default: 'General' },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  minThreshold: { type: Number, default: 10 },
  status: { type: String, default: 'Optimal' }, // Optimal or Low Stock
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook to determine status
InventoryItemSchema.pre('save', function(next) {
  if (this.quantity <= this.minThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Optimal';
  }
  // @ts-ignore
  next();
});

export default mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
