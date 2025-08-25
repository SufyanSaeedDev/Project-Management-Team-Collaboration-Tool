import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import logger from './utils/logger';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    },
});

// Initialize Socket.io handlers
initializeSocket(io);

// Start server
const startServer = async () => {
    try {
        // Connect to Redis
        await connectRedis();

        server.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Closing HTTP server...');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

export { io };
