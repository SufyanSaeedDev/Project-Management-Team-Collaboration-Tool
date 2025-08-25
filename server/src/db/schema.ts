import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'member', 'client']);
export const taskPriorityEnum = pgEnum('task_priority', ['none', 'low', 'medium', 'high', 'urgent']);
export const activityActionEnum = pgEnum('activity_action', [
    'created',
    'updated',
    'deleted',
    'moved',
    'assigned',
    'unassigned',
    'commented',
    'attached',
    'completed',
    'reopened'
]);
export const notificationTypeEnum = pgEnum('notification_type', [
    'assigned',
    'mentioned',
    'comment',
    'due_soon',
    'overdue',
    'workspace_invite',
    'task_moved'
]);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'trialing', 'past_due', 'canceled', 'unpaid']);
export const billingPlanEnum = pgEnum('billing_plan', ['free', 'pro', 'enterprise']);

// Users table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    avatarUrl: text('avatar_url'),
    googleId: varchar('google_id', { length: 255 }).unique(),
    isVerified: boolean('is_verified').default(false).notNull(),
    verificationToken: varchar('verification_token', { length: 255 }),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpires: timestamp('reset_token_expires'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Refresh tokens
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
    familyId: varchar('family_id', { length: 255 }).notNull(),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Workspaces
export const workspaces = pgTable('workspaces', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
    logoUrl: text('logo_url'),
    ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspace members
export const workspaceMembers = pgTable('workspace_members', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull(),
    invitedBy: uuid('invited_by').references(() => users.id),
    joinedAt: timestamp('joined_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspace invites
export const workspaceInvites = pgTable('workspace_invites', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    invitedBy: uuid('invited_by').notNull().references(() => users.id),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Projects
export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    color: varchar('color', { length: 7 }),
    icon: varchar('icon', { length: 50 }),
    isArchived: boolean('is_archived').default(false).notNull(),
    clientToken: varchar('client_token', { length: 255 }).unique(),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Columns
export const columns = pgTable('columns', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 7 }),
    position: integer('position').notNull(),
    wipLimit: integer('wip_limit'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Labels
export const labels = pgTable('labels', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks
export const tasks = pgTable('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    columnId: uuid('column_id').notNull().references(() => columns.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    priority: taskPriorityEnum('priority').default('none').notNull(),
    position: integer('position').notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    coverImageUrl: text('cover_image_url'),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Task assignees (composite key)
export const taskAssignees = pgTable('task_assignees', {
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => ({
    pk: { columns: [table.taskId, table.userId] },
}));

// Task labels (composite key)
export const taskLabels = pgTable('task_labels', {
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id').notNull().references(() => labels.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: { columns: [table.taskId, table.labelId] },
}));

// Attachments
export const attachments = pgTable('attachments', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileUrl: text('file_url').notNull(),
    fileType: varchar('file_type', { length: 100 }),
    fileSize: integer('file_size'),
    cloudinaryId: varchar('cloudinary_id', { length: 255 }),
    uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Comments
export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    parentId: uuid('parent_id').references(() => comments.id, { onDelete: 'cascade' }),
    isEdited: boolean('is_edited').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity logs
export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    userId: uuid('user_id').notNull().references(() => users.id),
    action: activityActionEnum('action').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    link: text('link'),
    isRead: boolean('is_read').default(false).notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Time logs (bonus)
export const timeLogs = pgTable('time_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    description: text('description'),
    startedAt: timestamp('started_at').notNull(),
    endedAt: timestamp('ended_at'),
    durationSec: integer('duration_sec'),
    isManual: boolean('is_manual').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Subscriptions (bonus)
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').notNull().unique().references(() => workspaces.id, { onDelete: 'cascade' }),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    plan: billingPlanEnum('plan').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    currentPeriodEnd: timestamp('current_period_end'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    refreshTokens: many(refreshTokens),
    ownedWorkspaces: many(workspaces),
    workspaceMembers: many(workspaceMembers),
    invitedWorkspaceMembers: many(workspaceMembers, { relationName: 'invitedBy' }),
    workspaceInvites: many(workspaceInvites),
    invitedWorkspaceInvites: many(workspaceInvites, { relationName: 'invitedByInvites' }),
    projects: many(projects),
    taskAssignees: many(taskAssignees),
    comments: many(comments),
    activityLogs: many(activityLogs),
    notifications: many(notifications),
    timeLogs: many(timeLogs),
    uploadedAttachments: many(attachments),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
    owner: one(users, {
        fields: [workspaces.ownerId],
        references: [users.id],
    }),
    members: many(workspaceMembers),
    invites: many(workspaceInvites),
    projects: many(projects),
    labels: many(labels),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [projects.workspaceId],
        references: [workspaces.id],
    }),
    creator: one(users, {
        fields: [projects.createdBy],
        references: [users.id],
    }),
    columns: many(columns),
    tasks: many(tasks),
    activityLogs: many(activityLogs),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
    project: one(projects, {
        fields: [columns.projectId],
        references: [projects.id],
    }),
    tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
    column: one(columns, {
        fields: [tasks.columnId],
        references: [columns.id],
    }),
    project: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id],
    }),
    creator: one(users, {
        fields: [tasks.createdBy],
        references: [users.id],
    }),
    assignees: many(taskAssignees),
    taskLabels: many(taskLabels),
    attachments: many(attachments),
    comments: many(comments),
    activityLogs: many(activityLogs),
    timeLogs: many(timeLogs),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
    task: one(tasks, {
        fields: [comments.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
    }),
    replies: many(comments, { relationName: 'parent' }),
}));
