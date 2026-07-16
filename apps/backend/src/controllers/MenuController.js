"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenu = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const getMenu = async (req, res) => {
    try {
        let categories = await index_1.prisma.menuCategory.findMany({
            include: { items: true }
        });
        // Seed if empty
        if (categories.length === 0) {
            console.log('Seeding initial menu...');
            const cat = await index_1.prisma.menuCategory.create({
                data: {
                    name: 'Main Course',
                    items: {
                        create: [
                            { name: 'Gourmet Burger', price: 18.99, gst: 5, isVeg: false },
                            { name: 'Truffle Pasta', price: 24.50, gst: 5, isVeg: true },
                        ]
                    }
                }
            });
            categories = [await index_1.prisma.menuCategory.findUnique({ where: { id: cat.id }, include: { items: true } })];
        }
        res.json({ categories });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
};
exports.getMenu = getMenu;
//# sourceMappingURL=MenuController.js.map