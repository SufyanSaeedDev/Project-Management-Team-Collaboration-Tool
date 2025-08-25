import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/db';
import {
    projects,
    columns,
    tasks,
    workspaceMembers,
    workspaces,
} from '../../db/schema';
import AppError from '../../utils/AppError';
import { generateClientToken } from '../../utils/crypto';

export const createProject = async (
    workspaceId: string,
    userId: string,
    data: { name: string; description?: string; color?: string; icon?: string }
) => {
    // Check if user is a member of the workspace
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member) {
        throw new AppError('You are not a member of this workspace', 403);
    }

    // Create project
    const [newProject] = await db
        .insert(projects)
        .values({
            workspaceId,
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            createdBy: userId,
        })
        .returning();

    // Create default columns
    const defaultColumns = [
        { name: 'To Do', color: '#6B7280', position: 0 },
        { name: 'In Progress', color: '#3B82F6', position: 1 },
        { name: 'Review', color: '#F59E0B', position: 2 },
        { name: 'Done', color: '#10B981', position: 3 },
    ];

    for (const col of defaultColumns) {
        await db.insert(columns).values({
            projectId: newProject.id,
            name: col.name,
            color: col.color,
            position: col.position,
        });
    }

    return newProject;
};

export const getWorkspaceProjects = async (workspaceId: string, userId: string) => {
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

    const projectsList = await db.query.projects.findMany({
        where: and(
            eq(projects.workspaceId, workspaceId),
            eq(projects.isArchived, false)
        ),
        orderBy: desc(projects.createdAt),
        with: {
            creator: true,
        },
    });

    return projectsList;
};

export const getProjectById = async (projectId: string, userId: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            workspace: {
                with: {
                    members: {
                        with: {
                            user: true,
                        },
                    },
                },
            },
            columns: {
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
            },
        },
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user has access
    const isMember = project.workspace.members.some(
        (m) => m.userId === userId
    );

    if (!isMember) {
        throw new AppError('You do not have access to this project', 403);
    }

    return project;
};

export const getProjectByClientToken = async (clientToken: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.clientToken, clientToken),
        with: {
            columns: {
                orderBy: (columns, { asc }) => [asc(columns.position)],
                with: {
                    tasks: {
                        where: (tasks, { isNull }) => isNull(tasks.completedAt),
                        orderBy: (tasks, { asc }) => [asc(tasks.position)],
                    },
                },
            },
        },
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    return project;
};

export const updateProject = async (
    projectId: string,
    userId: string,
    data: { name?: string; description?: string; color?: string; icon?: string; isArchived?: boolean }
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
        throw new AppError('You do not have permission to update this project', 403);
    }

    const [updatedProject] = await db
        .update(projects)
        .set(data)
        .where(eq(projects.id, projectId))
        .returning();

    return updatedProject;
};

export const deleteProject = async (projectId: string, userId: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can delete projects', 403);
    }

    await db.delete(projects).where(eq(projects.id, projectId));
};

export const archiveProject = async (projectId: string, userId: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can archive projects', 403);
    }

    const [updatedProject] = await db
        .update(projects)
        .set({ isArchived: true })
        .where(eq(projects.id, projectId))
        .returning();

    return updatedProject;
};

export const generateClientLink = async (projectId: string, userId: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can generate client links', 403);
    }

    const clientToken = generateClientToken();

    const [updatedProject] = await db
        .update(projects)
        .set({ clientToken })
        .where(eq(projects.id, projectId))
        .returning();

    return { clientToken, projectId };
};

export const deleteClientLink = async (projectId: string, userId: string) => {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Check if user is admin
    const member = await db.query.workspaceMembers.findFirst({
        where: and(
            eq(workspaceMembers.workspaceId, project.workspaceId),
            eq(workspaceMembers.userId, userId)
        ),
    });

    if (!member || member.role !== 'admin') {
        throw new AppError('Only admins can delete client links', 403);
    }

    const [updatedProject] = await db
        .update(projects)
        .set({ clientToken: null })
        .where(eq(projects.id, projectId))
        .returning();

    return updatedProject;
};
