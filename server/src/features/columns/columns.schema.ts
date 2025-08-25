import { z } from 'zod';

export const createColumnSchema = z.object({
    name: z.string().min(2, 'Column name must be at least 2 characters'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    wipLimit: z.number().int().positive().optional(),
});

export const updateColumnSchema = z.object({
    name: z.string().min(2, 'Column name must be at least 2 characters').optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    wipLimit: z.number().int().positive().optional().nullable(),
});

export const reorderColumnsSchema = z.object({
    columns: z.array(
        z.object({
            id: z.string().uuid(),
            position: z.number().int(),
        })
    ),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
