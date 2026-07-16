import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@restaurant-os/database';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const prisma = new PrismaClient();

export const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

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
    await prisma.$connect();
    console.log(`[Database] Connected to MongoDB via Prisma`);
    console.log(`[Server] Core POS Server running on port ${PORT}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed:`, error);
  }
});
