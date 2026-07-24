import { Router } from 'express';
import { getMenu } from '../controllers/MenuController';
import { createOrder } from '../controllers/OrderController';
import restaurantRouter from './restaurant';
import authRouter from './auth';
import Order from '../models/Order';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/restaurants', restaurantRouter);
apiRouter.get('/menu', getMenu as any);
apiRouter.post('/orders', createOrder as any);

// Order Sync Endpoint (Dexie synchronization fallback)
apiRouter.post('/sync/order', async (req: any, res: any) => {
  try {
    const { id, ...rest } = req.body;
    const orderData = {
      ...rest,
      localId: id
    };
    
    const existing = await Order.findOne({ uuid: orderData.uuid });
    if (existing) {
      return res.json({ success: true, message: 'Already synced' });
    }

    const order = new Order(orderData);
    await order.save();
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

import fs from 'fs';
import path from 'path';

// Create public/invoices folder if it doesn't exist
const publicInvoicesDir = path.join(__dirname, '../public/invoices');
if (!fs.existsSync(publicInvoicesDir)) {
  fs.mkdirSync(publicInvoicesDir, { recursive: true });
}

// Public Receipt View Endpoint
apiRouter.get('/orders/public/:uuid', async (req: any, res: any) => {
  try {
    const order = await Order.findOne({ uuid: req.params.uuid });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({ success: true, data: order });
  } catch (e: any) {
    res.status(450).json({ success: false, error: e.message });
  }
});

// Image Upload Endpoint (stores images on server statically)
apiRouter.post('/orders/upload-image/:uuid', async (req: any, res: any) => {
  try {
    const { uuid } = req.params;
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image base64 provided' });
    }

    const base64Data = imageBase64.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(publicInvoicesDir, `${uuid}.png`);
    
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    res.json({ 
      success: true, 
      imageUrl: `/public/invoices/${uuid}.png` 
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default apiRouter;
