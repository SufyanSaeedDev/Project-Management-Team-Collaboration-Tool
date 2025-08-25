import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { attachments, tasks, workspaceMembers } from '../../db/schema';
import AppError from '../../utils/AppError';

export const uploadAttachment = async (
    taskId: string,
    userId: string,
    file: Express.Multer.File
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.workspaceId, task.projectId),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to upload attachments', 403);
    }

    const [attachment] = await db
        .insert(attachments)
        .values({
            taskId,
            fileName: file.originalname,
            fileUrl: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            cloudinaryId: (file as any).cloudinaryId,
            uploadedBy: userId,
        })
        .returning();

    return attachment;
};

export const getAttachments = async (taskId: string, userId: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user has access
    const member = await db.query.workspaceMembers.findFirst({
        where: eq(workspaceMembers.workspaceId, task.projectId),
    });

    if (!member) {
        throw new AppError('You do not have access to this task', 403);
    }

    const attachmentsList = await db.query.attachments.findMany({
        where: eq(attachments.taskId, taskId),
    });

    return attachmentsList;
};

export const deleteAttachment = async (attachmentId: string, userId: string) => {
    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
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

    if (!attachment) {
        throw new AppError('Attachment not found', 404);
    }

    // Check if user is admin or uploader
    const member = attachment.task.project.workspace.members.find(
        (m) => m.userId === userId
    );

    const isUploader = attachment.uploadedBy === userId;
    const isAdmin = member?.role === 'admin';

    if (!isUploader && !isAdmin) {
        throw new AppError('You do not have permission to delete this attachment', 403);
    }

    // TODO: Delete from Cloudinary

    await db.delete(attachments).where(eq(attachments.id, attachmentId));
};
