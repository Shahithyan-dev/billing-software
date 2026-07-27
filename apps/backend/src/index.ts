import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Restaurant from './models/Restaurant';

import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// mongoose handles connections internally

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading static receipt images on other sites
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

import apiRouter from './routes/api';

// Basic health route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy', database: 'connected' });
});

app.use('/api/v1', apiRouter);

io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket] Device disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log(`[Database] Connected to MongoDB via Mongoose`);

    // Auto-seed default superadmin for production databases
    try {
      const existingUser = await User.findOne({ email: 'admin@zyncobill.com' });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('zyncobilladmin', 10);
        await User.create({
          email: 'admin@zyncobill.com',
          password: hashedPassword,
          role: 'superadmin'
        });
        console.log('[System] Default superadmin created (admin@zyncobill.com)');
      }

      // Auto-seed demo tenant for Sri Murugan Silks
      const existingDemo = await User.findOne({ email: 'dress@zyncobill.com' });
      if (!existingDemo) {
        const restaurant = new Restaurant({
          name: 'Sri Murugan Silks',
          businessType: 'dress',
          tagline: 'Premium Clothing Store',
          phone: '9876543210',
          gstin: '33ABCDE1234F1Z5',
          address: '123 Shopping Street, City',
          captains: ['Salesperson 1'],
          tables: [],
          diningAreas: [],
          menuCategories: ['Sarees', 'Kurtis', 'Lehengas', 'Shirts', 'Jeans'],
          sidebarFeatures: ['Home', 'Parties', 'Items', 'Sale Invoices', 'Purchases', 'Settings'],
          defaultMenu: [
            { id: 'd1', name: 'Kanchipuram Silk Saree', price: 15000, purchasePrice: 12000, category: 'Sarees', type: 'standard', stock: 10, img: '' },
            { id: 'd2', name: 'Cotton Kurti', price: 850, purchasePrice: 500, category: 'Kurtis', type: 'standard', stock: 50, img: '' },
            { id: 'd3', name: 'Designer Lehenga', price: 25000, purchasePrice: 18000, category: 'Lehengas', type: 'standard', stock: 5, img: '' },
            { id: 'd4', name: 'Mens Casual Shirt', price: 1200, purchasePrice: 800, category: 'Shirts', type: 'standard', stock: 30, img: '' },
            { id: 'd5', name: 'Denim Jeans', price: 1800, purchasePrice: 1000, category: 'Jeans', type: 'standard', stock: 25, img: '' }
          ],
          preferences: { showGstin: true, showFssai: false, showPhone: true }
        });
        await restaurant.save();

        const hashedDemoPassword = await bcrypt.hash('dress1234', 10);
        await User.create({
          email: 'dress@zyncobill.com',
          password: hashedDemoPassword,
          role: 'admin',
          restaurantId: restaurant._id
        });
        console.log('[System] Demo tenant created (dress@zyncobill.com)');
      }

    } catch (seedErr) {
      console.error('[System] Failed to seed superadmin:', seedErr);
    }

    console.log(`[Server] Core POS Server running on port ${PORT}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed:`, error);
  }
});
