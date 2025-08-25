import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import { createCommentSchema, updateCommentSchema } from './comments.schema';
import {
    createComment,
    getComments,
    updateComment,
    deleteComment,
} from './comments.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create comment
router.post(
    '/tasks/:taskId',
    param('taskId').isUUID(),
    body('content').trim().isLength({ min: 1 }),
    body('parentId').optional().isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const comment = await createComment(req.params.taskId, req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment,
        });
    })
);

// Get comments
router.get(
    '/tasks/:taskId',
    param('taskId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const comments = await getComments(req.params.taskId, req.user!.id);
        res.status(200).json({
            success: true,
            data: comments,
        });
    })
);

// Comment-specific routes
router.use('/:id', param('id').isUUID(), validate);

// Update comment
router.patch(
    '/:id',
    body('content').trim().isLength({ min: 1 }),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const comment = await updateComment(req.params.id, req.user!.id, req.body.content);
        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: comment,
        });
    })
);

// Delete comment
router.delete(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteComment(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    })
);

export default router;
