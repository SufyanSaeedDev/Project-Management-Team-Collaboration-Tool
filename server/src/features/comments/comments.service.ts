import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import { comments, tasks, workspaceMembers, activityLogs } from '../../db/schema';
import AppError from '../../utils/AppError';

export const createComment = async (
    taskId: string,
    userId: string,
    data: { content: string; parentId?: string }
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member (clients can comment too)
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You do not have permission to comment', 403);
    }

    // If replying to a comment, verify parent exists
    if (data.parentId) {
        const parentComment = await db.query.comments.findFirst({
            where: eq(comments.id, data.parentId),
        });

        if (!parentComment) {
            throw new AppError('Parent comment not found', 404);
        }
    }

    const [newComment] = await db
        .insert(comments)
        .values({
            taskId,
            userId,
            content: data.content,
            parentId: data.parentId,
        })
        .returning();

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.projectId,
        taskId,
        userId,
        action: 'commented',
        metadata: { commentId: newComment.id },
    });

    return newComment;
};

export const getComments = async (taskId: string, userId: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user has access
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You do not have access to this task', 403);
    }

    const commentsList = await db.query.comments.findMany({
        where: and(
            eq(comments.taskId, taskId),
            eq(comments.parentId, null)
        ),
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        with: {
            user: true,
            replies: {
                with: {
                    user: true,
                },
                orderBy: (comments, { asc }) => [asc(comments.createdAt)],
            },
        },
    });

    return commentsList;
};

export const updateComment = async (
    commentId: string,
    userId: string,
    content: string
) => {
    const comment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
    });

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    // Only comment owner can edit
    if (comment.userId !== userId) {
        throw new AppError('You can only edit your own comments', 403);
    }

    const [updatedComment] = await db
        .update(comments)
        .set({
            content,
            isEdited: true,
        })
        .where(eq(comments.id, commentId))
        .returning();

    return updatedComment;
};

export const deleteComment = async (commentId: string, userId: string) => {
    const comment = await db.query.comments.findFirst({
        where: eq(comments.id, commentId),
        with: {
            task: {
                with: {
                    project: {
                        with: {
                            workspace: {
                                with: {
                                    members: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    // Check if user is owner or admin
    const member = comment.task.project.workspace.members.find(
        (m) => m.userId === userId
    );

    const isOwner = comment.userId === userId;
    const isAdmin = member?.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new AppError('You do not have permission to delete this comment', 403);
    }

    await db.delete(comments).where(eq(comments.id, commentId));
};
