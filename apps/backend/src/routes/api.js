"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MenuController_1 = require("../controllers/MenuController");
const OrderController_1 = require("../controllers/OrderController");
const apiRouter = (0, express_1.Router)();
apiRouter.get('/menu', MenuController_1.getMenu);
apiRouter.post('/orders', OrderController_1.createOrder);
exports.default = apiRouter;
//# sourceMappingURL=api.js.map