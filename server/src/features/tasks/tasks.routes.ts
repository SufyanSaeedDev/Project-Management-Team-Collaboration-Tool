import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
    reorderTasksSchema,
    addAssigneesSchema,
    addLabelsSchema,
} from './tasks.schema';
import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    addAssignees,
    removeAssignee,
    addLabels,
    removeLabel,
} from './tasks.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create task
router.post(
    '/columns/:columnId',
    param('columnId').isUUID(),
    body('title').trim().isLength({ min: 1 }),
    body('priority').optional().isIn(['none', 'low', 'medium', 'high', 'urgent']),
    body('assigneeIds').optional().isArray(),
    body('labelIds').optional().isArray(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const task = await createTask(req.params.columnId, req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    })
);

// Get tasks with filters
router.get(
    '/projects/:projectId',
    param('projectId').isUUID(),
    asyncHandler(async (req: AuthRequest, res) => {
        const tasks = await getTasks(req.params.projectId, req.user!.id, {
            assigneeId: req.query.assigneeId as string,
            labelId: req.query.labelId as string,
            priority: req.query.priority as string,
            search: req.query.search as string,
        });
        res.status(200).json({
            success: true,
            data: tasks,
        });
    })
);

// Task-specific routes
router.use('/:id', param('id').isUUID(), validate);

// Get task detail
router.get(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        const task = await getTaskById(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            data: task,
        });
    })
);

// Update task
router.patch(
    '/:id',
    body('title').optional().trim().isLength({ min: 1 }),
    body('priority').optional().isIn(['none', 'low', 'medium', 'high', 'urgent']),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const task = await updateTask(req.params.id, req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    })
);

// Delete task
router.delete(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteTask(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    })
);

// Move task
router.patch(
    '/:id/move',
    body('columnId').isUUID(),
    body('position').isInt(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const task = await moveTask(req.params.id, req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Task moved successfully',
            data: task,
        });
    })
);

// Reorder tasks
router.patch(
    '/columns/:columnId/reorder',
    param('columnId').isUUID(),
    body('tasks').isArray(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await reorderTasks(req.params.columnId, req.user!.id, req.body.tasks);
        res.status(200).json({
            success: true,
            message: 'Tasks reordered successfully',
        });
    })
);

// Add assignees
router.post(
    '/:id/assignees',
    body('userIds').isArray(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await addAssignees(req.params.id, req.user!.id, req.body.userIds);
        res.status(200).json({
            success: true,
            message: 'Assignees added successfully',
        });
    })
);

// Remove assignee
router.delete(
    '/:id/assignees/:assigneeId',
    param('assigneeId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await removeAssignee(req.params.id, req.user!.id, req.params.assigneeId);
        res.status(200).json({
            success: true,
            message: 'Assignee removed successfully',
        });
    })
);

// Add labels
router.post(
    '/:id/labels',
    body('labelIds').isArray(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await addLabels(req.params.id, req.user!.id, req.body.labelIds);
        res.status(200).json({
            success: true,
            message: 'Labels added successfully',
        });
    })
);

// Remove label
router.delete(
    '/:id/labels/:labelId',
    param('labelId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await removeLabel(req.params.id, req.user!.id, req.params.labelId);
        res.status(200).json({
            success: true,
            message: 'Label removed successfully',
        });
    })
);

export default router;
