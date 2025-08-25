import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
} from './notifications.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get(
    '/',
    asyncHandler(async (req: AuthRequest, res) => {
        const notifications = await getUserNotifications(req.user!.id, {
            isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
        });
        res.status(200).json({
            success: true,
            data: notifications,
        });
    })
);

// Get unread count
router.get(
    '/unread-count',
    asyncHandler(async (req: AuthRequest, res) => {
        const count = await getUnreadCount(req.user!.id);
        res.status(200).json({
            success: true,
            data: { count },
        });
    })
);

// Mark as read
router.patch(
    '/:id/read',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await markAsRead(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    })
);

// Mark all as read
router.patch(
    '/read-all',
    asyncHandler(async (req: AuthRequest, res) => {
        await markAllAsRead(req.user!.id);
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    })
);

// Delete notification
router.delete(
    '/:id',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteNotification(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Notification deleted',
        });
    })
);

// Delete all read
router.delete(
    '/read-all',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteAllRead(req.user!.id);
        res.status(200).json({
            success: true,
            message: 'All read notifications deleted',
        });
    })
);

export default router;
