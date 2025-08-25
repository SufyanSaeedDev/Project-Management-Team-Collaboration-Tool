import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import { upload } from '../../middleware/upload';
import {
    uploadAttachment,
    getAttachments,
    deleteAttachment,
} from './attachments.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload attachment
router.post(
    '/tasks/:taskId',
    param('taskId').isUUID(),
    validate,
    upload.single('file'),
    asyncHandler(async (req: AuthRequest, res) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const attachment = await uploadAttachment(req.params.taskId, req.user!.id, req.file);
        res.status(201).json({
            success: true,
            message: 'Attachment uploaded successfully',
            data: attachment,
        });
    })
);

// Get attachments
router.get(
    '/tasks/:taskId',
    param('taskId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const attachments = await getAttachments(req.params.taskId, req.user!.id);
        res.status(200).json({
            success: true,
            data: attachments,
        });
    })
);

// Delete attachment
router.delete(
    '/:id',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteAttachment(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Attachment deleted successfully',
        });
    })
);

export default router;
