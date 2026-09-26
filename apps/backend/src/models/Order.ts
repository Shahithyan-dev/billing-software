import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  uuid: string;
  localId?: number;
  restaurantId: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  orderType: string;
  timestamp: number;
  kitchenStatus?: string;
}

const OrderSchema = new Schema({
  uuid: { type: String, required: true, unique: true },
  localId: { type: Number },
  restaurantId: { type: String, required: true },
  items: [{
    id: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  orderType: { type: String, default: 'Retail Invoice' },
  timestamp: { type: Number, required: true },
  kitchenStatus: { type: String, default: 'pending' }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
