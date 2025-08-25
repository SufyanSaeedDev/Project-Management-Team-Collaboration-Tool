import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../config/db';
import {
    workspaces,
    workspaceMembers,
    workspaceInvites,
    projects,
    users,
} from '../../db/schema';
import AppError from '../../utils/AppError';
import { generateSlug, generateRandomToken } from '../../utils/crypto';

const INVITE_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const createWorkspace = async (ownerId: string, data: { name: string; description?: string; slug?: string }) => {
    const slug = data.slug || generateSlug(data.name) + '-' + Math.random().toString(36).substring(2, 6);

    // Check if slug already exists
    const existingWorkspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slug, slug),
    });

    if (existingWorkspace) {
        throw new AppError('Workspace slug already exists', 400);
    }

    // Create workspace
    const [newWorkspace] = await db
        .insert(workspaces)
        .values({
            name: data.name,
            slug,
            description: data.description,
            ownerId,
        })
        .returning();

    // Add owner as admin member
    await db.insert(workspaceMembers).values({
        workspaceId: newWorkspace.id,
        userId: ownerId,
        role: 'admin',
        invitedBy: ownerId,
    });

    return newWorkspace;
};

export const getUserWorkspaces = async (userId: string) => {
    const memberWorkspaces = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.userId, userId),
        with: {
            workspace: {
                with: {
                    owner: true,
                },
            },
        },
    });

    return memberWorkspaces.map((m) => ({
        ...m.workspace,
        memberRole: m.role,
    }));
};

export const getWorkspaceById = async (workspaceId: string, userId: string) => {
    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You are not a member of this workspace', 403);
    }

    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        with: {
            owner: true,
            members: {
                with: {
                    user: true,
                },
            },
        },
    });

    if (!workspace) {
        throw new AppError('Workspace not found', 404);
    }

    return { ...workspace, memberRole: member.role };
};

export const updateWorkspace = async (
    workspaceId: string,
    userId: string,
    data: { name?: string; description?: string; logoUrl?: string | null }
) => {
    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can update workspace', 403);
    }

    const [updatedWorkspace] = await db
        .update(workspaces)
        .set(data)
        .where(eq(workspaces.id, workspaceId))
        .returning();

    return updatedWorkspace;
};

export const deleteWorkspace = async (workspaceId: string, userId: string) => {
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
    });

    if (!workspace) {
        throw new AppError('Workspace not found', 404);
    }

    // Only owner can delete workspace
    if (workspace.ownerId !== userId) {
        throw new AppError('Only the owner can delete this workspace', 403);
    }

    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const getWorkspaceMembers = async (workspaceId: string, userId: string) => {
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You are not a member of this workspace', 403);
    }

    const members = await db.query.workspaceMembers.findMany({
        where: eq(workspaceMembers.workspaceId, workspaceId),
        with: {
            user: true,
        },
    });

    return members;
};

export const inviteMember = async (
    workspaceId: string,
    invitedBy: string,
    data: { email: string; role: 'admin' | 'member' | 'client' }
) => {
    // Check if inviter is admin
    const inviter = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, invitedBy)
        ),
    });

    if (!inviter || inviter.role !== 'admin') {
        throw new AppError('Only admins can invite members', 403);
    }

    // Check if user is already a member
    const existingMember = await db.query.users.findFirst({
        where: eq(users.email, data.email),
    });

    if (existingMember) {
        const alreadyMember = await db.query.workspaceMembers.findFirst({
            where: and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, existingMember.id)
            ),
        });

        if (alreadyMember) {
            throw new AppError('User is already a member of this workspace', 400);
        }
    }

    // Check if there's already an invite for this email
    const existingInvite = await db.query.workspaceInvites.findFirst({
        where: and(
            eq(workspaceInvites.workspaceId, workspaceId),
            eq(workspaceInvites.email, data.email),
            eq(workspaceInvites.acceptedAt, null)
        ),
    });

    if (existingInvite) {
        throw new AppError('An invite has already been sent to this email', 400);
    }

    // Create invite
    const token = generateRandomToken();
    const [invite] = await db
        .insert(workspaceInvites)
        .values({
            workspaceId,
            email: data.email,
            role: data.role,
            token,
            invitedBy,
            expiresAt: new Date(Date.now() + INVITE_TOKEN_EXPIRY),
        })
        .returning();

    // TODO: Send invite email
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite/${token}`;

    return invite;
};

export const acceptInvite = async (token: string, userId: string) => {
    const invite = await db.query.workspaceInvites.findFirst({
        where: eq(workspaceInvites.token, token),
    });

    if (!invite) {
        throw new AppError('Invalid invite token', 400);
    }

    if (invite.expiresAt < new Date()) {
        throw new AppError('Invite has expired', 400);
    }

    if (invite.acceptedAt) {
        throw new AppError('Invite has already been accepted', 400);
    }

    // Check if user email matches invite email
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user || user.email !== invite.email) {
        throw new AppError('Invite email does not match your account', 400);
    }

    // Add user to workspace
    await db.insert(workspaceMembers).values({
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
        invitedBy: invite.invitedBy,
    });

    // Mark invite as accepted
    await db
        .update(workspaceInvites)
        .set({ acceptedAt: new Date() })
        .where(eq(workspaceInvites.id, invite.id));

    return { workspaceId: invite.workspaceId };
};

export const updateMemberRole = async (
    workspaceId: string,
    userId: string,
    targetUserId: string,
    data: { role: 'admin' | 'member' | 'client' }
) => {
    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can update member roles', 403);
    }

    // Can't change owner's role
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
    });

    if (workspace?.ownerId === targetUserId) {
        throw new AppError('Cannot change the owner\'s role', 400);
    }

    await db
        .update(workspaceMembers)
        .set({ role: data.role })
        .where(
            and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, targetUserId)
            )
        );
};

export const removeMember = async (
    workspaceId: string,
    userId: string,
    targetUserId: string
) => {
    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can remove members', 403);
    }

    // Can't remove owner
    const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
    });

    if (workspace?.ownerId === targetUserId) {
        throw new AppError('Cannot remove the owner', 400);
    }

    await db
        .delete(workspaceMembers)
        .where(
            and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, targetUserId)
            )
        );
};
