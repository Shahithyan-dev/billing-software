import { Router } from 'express';
import { getMenu } from '../controllers/MenuController';
import { createOrder } from '../controllers/OrderController';

import restaurantRouter from './restaurant';

const apiRouter = Router();

apiRouter.use('/restaurants', restaurantRouter);
apiRouter.get('/menu', getMenu as any);
apiRouter.post('/orders', createOrder as any);

export default apiRouter;
