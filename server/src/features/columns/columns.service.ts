import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../config/db';
import { columns, projects, workspaceMembers, tasks } from '../../db/schema';
import AppError from '../../utils/AppError';

export const createColumn = async (
    projectId: string,
    userId: string,
    data: { name: string; color?: string; wipLimit?: number }
) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to create columns', 403);
    }

    // Get max position
    const maxPosition = await db
        .select({ max: sql<number>`MAX(${columns.position})` })
        .from(columns)
        .where(eq(columns.projectId, projectId));

    const newPosition = (maxPosition[0].max || 0) + 1;

    const [newColumn] = await db
        .insert(columns)
        .values({
            projectId,
            name: data.name,
            color: data.color,
            wipLimit: data.wipLimit,
            position: newPosition,
        })
        .returning();

    return newColumn;
};

export const getProjectColumns = async (projectId: string, userId: string) => {
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

    const columnsList = await db.query.columns.findMany({
        where: eq(columns.projectId, projectId),
        orderBy: (columns, { asc }) => [asc(columns.position)],
        with: {
            tasks: {
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
            },
        },
    });

    return columnsList;
};

export const updateColumn = async (
    columnId: string,
    userId: string,
    data: { name?: string; color?: string; wipLimit?: number | null }
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
        throw new AppError('You do not have permission to update columns', 403);
    }

    const [updatedColumn] = await db
        .update(columns)
        .set(data)
        .where(eq(columns.id, columnId))
        .returning();

    return updatedColumn;
};

export const deleteColumn = async (columnId: string, userId: string) => {
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

    // Check if user is admin
    const member = column.project.workspace.members.find(
        (m) => m.userId === userId
    );

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can delete columns', 403);
    }

    await db.delete(columns).where(eq(columns.id, columnId));
};

export const reorderColumns = async (
    projectId: string,
    userId: string,
    columnUpdates: Array<{ id: string; position: number }>
) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is a member
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role === 'client') {
        throw new AppError('You do not have permission to reorder columns', 403);
    }

    // Update all columns in a transaction
    for (const update of columnUpdates) {
        await db
            .update(columns)
            .set({ position: update.position })
            .where(eq(columns.id, update.id));
    }
};
