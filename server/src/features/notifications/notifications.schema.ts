import { z } from 'zod';

export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    type: z.enum(['assigned', 'mentioned', 'comment', 'due_soon', 'overdue', 'workspace_invite', 'task_moved']),
    title: z.string(),
    message: z.string(),
    link: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
