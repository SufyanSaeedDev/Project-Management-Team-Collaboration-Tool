import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export interface AuthSocket extends Socket {
    userId?: string;
}

export const initializeSocket = (io: Server) => {
    // Authentication middleware
    io.use((socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
                id: string;
                email: string;
            };
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: AuthSocket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

        // Join user's personal room
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }

        // Join project room
        socket.on('join:project', (projectId: string) => {
            socket.join(`project:${projectId}`);
            logger.info(`Socket ${socket.id} joined project:${projectId}`);
        });

        // Leave project room
        socket.on('leave:project', (projectId: string) => {
            socket.leave(`project:${projectId}`);
            logger.info(`Socket ${socket.id} left project:${projectId}`);
        });

        // Join task room
        socket.on('join:task', (taskId: string) => {
            socket.join(`task:${taskId}`);
            logger.info(`Socket ${socket.id} joined task:${taskId}`);
        });

        // Leave task room
        socket.on('leave:task', (taskId: string) => {
            socket.leave(`task:${taskId}`);
            logger.info(`Socket ${socket.id} left task:${taskId}`);
        });

        // Presence events
        socket.on('presence:online', () => {
            if (socket.userId) {
                socket.to(`user:${socket.userId}`).emit('presence:user-online', {
                    userId: socket.userId,
                });
            }
        });

        socket.on('presence:offline', () => {
            if (socket.userId) {
                socket.to(`user:${socket.userId}`).emit('presence:user-offline', {
                    userId: socket.userId,
                });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });

        // Error handling
        socket.on('error', (error) => {
            logger.error(`Socket error: ${error}`);
        });
    });
};

// Helper function to emit events to rooms
export const emitToRoom = (io: Server, room: string, event: string, data: any, excludeSocketId?: string) => {
    if (excludeSocketId) {
        io.to(room).except(excludeSocketId).emit(event, data);
    } else {
        io.to(room).emit(event, data);
    }
};

export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
};
