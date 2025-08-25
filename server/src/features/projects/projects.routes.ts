import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import { createProjectSchema, updateProjectSchema } from './projects.schema';
import {
    createProject,
    getWorkspaceProjects,
    getProjectById,
    updateProject,
    deleteProject,
    archiveProject,
    generateClientLink,
    deleteClientLink,
    getProjectByClientToken,
} from './projects.service';

const router = Router();

// All routes require authentication (except client portal)
router.use(authenticate);

// Get projects in workspace
router.get(
    '/workspaces/:workspaceId',
    param('workspaceId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const projects = await getWorkspaceProjects(req.params.workspaceId, req.user!.id);
        res.status(200).json({
            success: true,
            data: projects,
        });
    })
);

// Create project
router.post(
    '/workspaces/:workspaceId',
    param('workspaceId').isUUID(),
    body('name').trim().isLength({ min: 2 }),
    body('color').optional().isHexColor(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const project = await createProject(req.params.workspaceId, req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: project,
        });
    })
);

// Get project by ID
router.get(
    '/:id',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const project = await getProjectById(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            data: project,
        });
    })
);

// Update project
router.patch(
    '/:id',
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 2 }),
    body('color').optional().isHexColor(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const project = await updateProject(req.params.id, req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            data: project,
        });
    })
);

// Delete project
router.delete(
    '/:id',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteProject(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
        });
    })
);

// Archive project
router.post(
    '/:id/archive',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const project = await archiveProject(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Project archived successfully',
            data: project,
        });
    })
);

// Generate client link
router.post(
    '/:id/generate-client-link',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const result = await generateClientLink(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Client link generated successfully',
            data: result,
        });
    })
);

// Delete client link
router.delete(
    '/:id/client-link',
    param('id').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteClientLink(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Client link deleted successfully',
        });
    })
);

// Client portal routes (no authentication required)
router.get(
    '/portal/:clientToken',
    param('clientToken').isLength({ min: 32, max: 32 }),
    validate,
    asyncHandler(async (req, res) => {
        const project = await getProjectByClientToken(req.params.clientToken);
        res.status(200).json({
            success: true,
            data: project,
        });
    })
);

export default router;
