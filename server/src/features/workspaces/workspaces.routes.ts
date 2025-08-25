import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    inviteMemberSchema,
    updateMemberRoleSchema,
} from './workspaces.schema';
import {
    createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    getWorkspaceMembers,
    inviteMember,
    acceptInvite,
    updateMemberRole,
    removeMember,
} from './workspaces.service';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create workspace
router.post(
    '/',
    body('name').trim().isLength({ min: 2 }),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const workspace = await createWorkspace(req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Workspace created successfully',
            data: workspace,
        });
    })
);

// Get user's workspaces
router.get(
    '/',
    asyncHandler(async (req: AuthRequest, res) => {
        const workspaces = await getUserWorkspaces(req.user!.id);
        res.status(200).json({
            success: true,
            data: workspaces,
        });
    })
);

// Accept invite
router.post(
    '/accept-invite/:token',
    asyncHandler(async (req: AuthRequest, res) => {
        const result = await acceptInvite(req.params.token, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Invite accepted successfully',
            data: result,
        });
    })
);

// Workspace-specific routes
router.use('/:id', param('id').isUUID(), validate);

// Get workspace details
router.get(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        const workspace = await getWorkspaceById(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            data: workspace,
        });
    })
);

// Update workspace
router.patch(
    '/:id',
    body('name').optional().trim().isLength({ min: 2 }),
    body('logoUrl').optional().isURL().or().isNull(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const workspace = await updateWorkspace(req.params.id, req.user!.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Workspace updated successfully',
            data: workspace,
        });
    })
);

// Delete workspace
router.delete(
    '/:id',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteWorkspace(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Workspace deleted successfully',
        });
    })
);

// Get members
router.get(
    '/:id/members',
    asyncHandler(async (req: AuthRequest, res) => {
        const members = await getWorkspaceMembers(req.params.id, req.user!.id);
        res.status(200).json({
            success: true,
            data: members,
        });
    })
);

// Invite member
router.post(
    '/:id/invite',
    body('email').isEmail().normalizeEmail(),
    body('role').isIn(['admin', 'member', 'client']),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const invite = await inviteMember(req.params.id, req.user!.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Invite sent successfully',
            data: invite,
        });
    })
);

// Update member role
router.patch(
    '/:id/members/:userId',
    param('userId').isUUID(),
    body('role').isIn(['admin', 'member', 'client']),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await updateMemberRole(req.params.id, req.user!.id, req.params.userId, req.body);
        res.status(200).json({
            success: true,
            message: 'Member role updated successfully',
        });
    })
);

// Remove member
router.delete(
    '/:id/members/:userId',
    param('userId').isUUID(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        await removeMember(req.params.id, req.user!.id, req.params.userId);
        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
        });
    })
);

export default router;
