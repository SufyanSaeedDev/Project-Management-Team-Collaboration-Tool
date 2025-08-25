import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import {
    tasks,
    columns,
    projects,
    workspaceMembers,
    taskAssignees,
    taskLabels,
    activityLogs,
} from '../../db/schema';
import AppError from '../../utils/AppError';

export const createTask = async (
    columnId: string,
    userId: string,
    data: {
        title: string;
        description?: string;
        priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent';
        dueDate?: Date;
        assigneeIds?: string[];
        labelIds?: string[];
    }
) => {
    const column = await db.query.columns.findFirst({
        where: eq(columns.id, columnId),
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
    });

    if (!column) {
        throw new AppError('Column not found', 404);
    }

    // Check if user is a member
    const member = column.project.workspace.members.find(
        (m) => m.userId === userId
    );

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to create tasks', 403);
    }

    // Get max position in column
    const maxPosition = await db
        .select({ max: sql<number>`MAX(${tasks.position})` })
        .from(tasks)
        .where(eq(tasks.columnId, columnId));

    const newPosition = (maxPosition[0].max || 0) + 1;

    const [newTask] = await db
        .insert(tasks)
        .values({
            columnId,
            projectId: column.projectId,
            title: data.title,
            description: data.description,
            priority: data.priority || 'none',
            dueDate: data.dueDate,
            position: newPosition,
            createdBy: userId,
        })
        .returning();

    // Add assignees
    if (data.assigneeIds?.length) {
        await db.insert(taskAssignees).values(
            data.assigneeIds.map((assigneeId) => ({
                taskId: newTask.id,
                userId: assigneeId,
            }))
        );
    }

    // Add labels
    if (data.labelIds?.length) {
        await db.insert(taskLabels).values(
            data.labelIds.map((labelId) => ({
                taskId: newTask.id,
                labelId,
            }))
        );
    }

    // Log activity
    await db.insert(activityLogs).values({
        projectId: column.projectId,
        taskId: newTask.id,
        userId,
        action: 'created',
        metadata: { taskTitle: data.title },
    });

    return newTask;
};

export const getTasks = async (
    projectId: string,
    userId: string,
    filters?: {
        assigneeId?: string;
        labelId?: string;
        priority?: string;
        search?: string;
    }
) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user has access
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You do not have access to this project', 403);
    }

    // Build where conditions
    let whereConditions = [eq(tasks.projectId, projectId)];

    if (filters?.assigneeId) {
        whereConditions.push(eq(taskAssignees.userId, filters.assigneeId));
    }

    if (filters?.labelId) {
        whereConditions.push(eq(taskLabels.labelId, filters.labelId));
    }

    if (filters?.priority) {
        whereConditions.push(eq(tasks.priority, filters.priority));
    }

    if (filters?.search) {
        whereConditions.push(sql`${tasks.title} ILIKE ${`%${filters.search}%`}`);
    }

    const tasksList = await db.query.tasks.findMany({
        where: and(...whereConditions),
        orderBy: (tasks, { asc }) => [asc(tasks.position)],
        with: {
            assignees: {
                with: {
                    user: true,
                },
            },
            taskLabels: {
                with: {
                    label: true,
                },
            },
            creator: true,
        },
    });

    return tasksList;
};

export const getTaskById = async (taskId: string, userId: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
            column: {
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
            assignees: {
                with: {
                    user: true,
                },
            },
            taskLabels: {
                with: {
                    label: true,
                },
            },
            attachments: true,
            comments: {
                with: {
                    user: true,
                    replies: {
                        with: {
                            user: true,
                        },
                    },
                },
                orderBy: (comments, { asc }) => [asc(comments.createdAt)],
            },
            creator: true,
        },
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user has access
    const member = task.column.project.workspace.members.find(
        (m) => m.userId === userId
    );

    if (!member) {
        throw new AppError('You do not have access to this task', 403);
    }

    return task;
};

export const updateTask = async (
    taskId: string,
    userId: string,
    data: {
        title?: string;
        description?: string;
        priority?: string;
        dueDate?: Date | null;
        completedAt?: Date | null;
        coverImageUrl?: string | null;
    }
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
            column: {
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

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = task.column.project.workspace.members.find(
        (m) => m.userId === userId
    );

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to update tasks', 403);
    }

    const [updatedTask] = await db
        .update(tasks)
        .set(data)
        .where(eq(tasks.id, taskId))
        .returning();

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.column.projectId,
        taskId,
        userId,
        action: 'updated',
        metadata: { changes: data },
    });

    return updatedTask;
};

export const deleteTask = async (taskId: string, userId: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
        with: {
            column: {
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

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = task.column.project.workspace.members.find(
        (m) => m.userId === userId
    );

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to delete tasks', 403);
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.column.projectId,
        taskId,
        userId,
        action: 'deleted',
    });
};

export const moveTask = async (
    taskId: string,
    userId: string,
    data: { columnId: string; position: number }
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to move tasks', 403);
    }

    const [updatedTask] = await db
        .update(tasks)
        .set({
            columnId: data.columnId,
            position: data.position,
        })
        .where(eq(tasks.id, taskId))
        .returning();

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.projectId,
        taskId,
        userId,
        action: 'moved',
        metadata: { newColumnId: data.columnId },
    });

    return updatedTask;
};

export const reorderTasks = async (
    columnId: string,
    userId: string,
    taskUpdates: Array<{ id: string; position: number }>
) => {
    const column = await db.query.columns.findFirst({
        where: eq(columns.id, columnId),
    });

    if (!column) {
        throw new AppError('Column not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, column.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to reorder tasks', 403);
    }

    // Update all tasks
    for (const update of taskUpdates) {
        await db
            .update(tasks)
            .set({ position: update.position })
            .where(eq(tasks.id, update.id));
    }
};

export const addAssignees = async (
    taskId: string,
    userId: string,
    userIds: string[]
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to assign tasks', 403);
    }

    // Add assignees
    await db.insert(taskAssignees).values(
        userIds.map((assigneeId) => ({
            taskId,
            userId: assigneeId,
        }))
    );

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.projectId,
        taskId,
        userId,
        action: 'assigned',
        metadata: { assigneeIds: userIds },
    });
};

export const removeAssignee = async (
    taskId: string,
    userId: string,
    assigneeId: string
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to remove assignees', 403);
    }

    await db
        .delete(taskAssignees)
        .where(
            and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, assigneeId))
        );

    // Log activity
    await db.insert(activityLogs).values({
        projectId: task.projectId,
        taskId,
        userId,
        action: 'unassigned',
        metadata: { assigneeId },
    });
};

export const addLabels = async (
    taskId: string,
    userId: string,
    labelIds: string[]
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to add labels', 403);
    }

    await db.insert(taskLabels).values(
        labelIds.map((labelId) => ({
            taskId,
            labelId,
        }))
    );
};

export const removeLabel = async (
    taskId: string,
    userId: string,
    labelId: string
) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, taskId),
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, task.projectId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to remove labels', 403);
    }

    await db
        .delete(taskLabels)
        .where(and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)));
};
