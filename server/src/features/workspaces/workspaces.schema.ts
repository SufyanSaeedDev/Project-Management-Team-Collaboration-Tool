import { z } from 'zod';

export const createWorkspaceSchema = z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters'),
    description: z.string().optional(),
    slug: z.string().min(2, 'Slug must be at least 2 characters').optional(),
});

export const updateWorkspaceSchema = z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters').optional(),
    description: z.string().optional(),
    logoUrl: z.string().url('Invalid URL').optional().nullable(),
});

export const inviteMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'member', 'client']),
});

export const updateMemberRoleSchema = z.object({
    role: z.enum(['admin', 'member', 'client']),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
