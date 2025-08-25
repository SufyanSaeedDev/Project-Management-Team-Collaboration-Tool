import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    icon: z.string().optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    icon: z.string().optional(),
    isArchived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
