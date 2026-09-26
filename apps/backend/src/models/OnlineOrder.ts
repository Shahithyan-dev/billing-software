import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

const onlineOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  platform: { type: String, enum: ['swiggy', 'zomato', 'dineout'], required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['new', 'preparing', 'ready', 'delivered'], default: 'new' },
  time: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.models.OnlineOrder || mongoose.model('OnlineOrder', onlineOrderSchema);
