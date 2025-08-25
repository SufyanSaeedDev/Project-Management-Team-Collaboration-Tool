import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
    createColumnSchema,
    updateColumnSchema,
    reorderColumnsSchema,
} from './columns.schema';
import {
    createColumn,
    getProjectColumns,
    updateColumn,
    deleteColumn,
    reorderColumns,
} from './columns.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create column
router.post(
    '/projects/:projectId',
    param('projectId').isUUID(),
    body('name').trim().isLength({ min: 2 }),
    body('color').optional().isHexColor(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const column = await createColumn(req.params.projectId, req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Column created successfully',
            data: column,
        });
    })
);

// Get columns with tasks
router.get(
    '/projects/:projectId',
    param('projectId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const columns = await getProjectColumns(req.params.projectId, req.user!.id);
        res.status(200).json({
            success: true,
            data: columns,
        });
    })
);

// Column-specific routes
router.use('/:id', param('id').isUUID(), validate);

// Update column
router.patch(
    '/:id',
    body('name').optional().trim().isLength({ min: 2 }),
    body('color').optional().isHexColor(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const column = await updateColumn(req.params.id, req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Column updated successfully',
            data: column,
        });
    })
);

// Delete column
router.delete(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteColumn(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Column deleted successfully',
        });
    })
);

// Reorder columns
router.patch(
    '/reorder',
    body('columns').isArray(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await reorderColumns(req.params.projectId, req.user!.id, req.body.columns);
        res.status(200).json({
            success: true,
            message: 'Columns reordered successfully',
        });
    })
);

export default router;
