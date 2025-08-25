import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import { notifications, users } from '../../db/schema';
import AppError from '../../utils/AppError';

export const getUserNotifications = async (userId: string, filters?: { isRead?: boolean }) => {
    const whereConditions = [eq(notifications.userId, userId)];

    if (filters?.isRead !== undefined) {
        whereConditions.push(eq(notifications.isRead, filters.isRead));
    }

    const notificationsList = await db.query.notifications.findMany({
        where: and(...whereConditions),
        orderBy: [desc(notifications.createdAt)],
        limit: 50,
    });

    return notificationsList;
};

export const getUnreadCount = async (userId: string) => {
    const result = await db
        .select({ count: db.$count() })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return result[0]?.count || 0;
};

export const markAsRead = async (notificationId: string, userId: string) => {
    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
    });

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
        throw new AppError('You can only mark your own notifications as read', 403);
    }

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
};

export const markAllAsRead = async (userId: string) => {
    await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
};

export const createNotification = async (data: {
    userId: string;
    type: 'assigned' | 'mentioned' | 'comment' | 'due_soon' | 'overdue' | 'workspace_invite' | 'task_moved';
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, any>;
}) => {
    const [notification] = await db
        .insert(notifications)
        .values(data)
        .returning();

    return notification;
};

export const deleteNotification = async (notificationId: string, userId: string) => {
    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
    });

    if (!notification) {
        throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
        throw new AppError('You can only delete your own notifications', 403);
    }

    await db.delete(notifications).where(eq(notifications.id, notificationId));
};

export const deleteAllRead = async (userId: string) => {
    await db
        .delete(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, true)));
};
