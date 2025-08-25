import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment content is required'),
    parentId: z.string().uuid().optional(),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1, 'Comment content is required'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
