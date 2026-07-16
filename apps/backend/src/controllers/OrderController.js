"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const createOrder = async (req, res) => {
    try {
        const { items, type, total } = req.body;
        const order = await index_1.prisma.order.create({
            data: {
                type: type || 'Dine In',
                total: total,
                status: 'Pending',
                items: {
                    create: items.map((i) => ({
                        menuItemId: i.id,
                        name: i.name,
                        quantity: i.quantity,
                        price: i.price
                    }))
                },
                kitchenOrders: {
                    create: {
                        station: 'Main Kitchen',
                        status: 'Pending'
                    }
                }
            },
            include: {
                items: true,
                kitchenOrders: true
            }
        });
        // Alert Kitchen Display System in realtime
        index_1.io.emit('new-kitchen-order', order);
        res.status(201).json({ success: true, order });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
//# sourceMappingURL=OrderController.js.map