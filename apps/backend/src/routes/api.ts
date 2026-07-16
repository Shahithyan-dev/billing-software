import { Router } from 'express';
import { getMenu } from '../controllers/MenuController';
import { createOrder } from '../controllers/OrderController';

const apiRouter = Router();

apiRouter.get('/menu', getMenu as any);
apiRouter.post('/orders', createOrder as any);

export default apiRouter;
