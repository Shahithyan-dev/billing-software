"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("@restaurant-os/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.prisma = new database_1.PrismaClient();
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const api_1 = __importDefault(require("./routes/api"));
// Basic health route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'healthy', database: 'connected' });
});
app.use('/api/v1', api_1.default);
exports.io.on('connection', (socket) => {
    console.log(`[Socket] Device connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket] Device disconnected: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, async () => {
    try {
        await exports.prisma.$connect();
        console.log(`[Database] Connected to MongoDB via Prisma`);
        console.log(`[Server] Core POS Server running on port ${PORT}`);
    }
    catch (error) {
        console.error(`[Database Error] Connection failed:`, error);
    }
});
//# sourceMappingURL=index.js.map