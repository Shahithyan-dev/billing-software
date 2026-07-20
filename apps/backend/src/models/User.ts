import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'captain', 'kitchen', 'staff'], default: 'admin' },
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant',
    required: function() {
      // @ts-ignore
      return this.role !== 'superadmin';
    }
  },
  sessionToken: { type: String },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
