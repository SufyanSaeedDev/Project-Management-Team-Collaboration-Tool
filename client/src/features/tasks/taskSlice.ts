import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export interface TaskDetail {
    id: string;
    columnId: string;
    projectId: string;
    title: string;
    description?: string;
    priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
    position: number;
    dueDate?: string;
    completedAt?: string;
    coverImageUrl?: string;
    createdBy: {
        id: string;
        fullName: string;
        avatarUrl?: string;
        email: string;
    };
    updatedAt: string;
    assignees?: Array<{ user: { id: string; fullName: string; avatarUrl?: string; email: string } }>;
    taskLabels?: Array<{ label: { id: string; name: string; color: string } }>;
    comments?: Comment[];
    attachments?: Attachment[];
    activityLog?: ActivityLog[];
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    parentId?: string;
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        fullName: string;
        avatarUrl?: string;
        email: string;
    };
    replies?: Comment[];
}

export interface Attachment {
    id: string;
    taskId: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    cloudinaryId: string;
    uploadedBy: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    projectId: string;
    taskId: string;
    userId: string;
    action: string;
    metadata: Record<string, any>;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        avatarUrl?: string;
    };
}

export interface TaskState {
    currentTask: TaskDetail | null;
    isLoading: boolean;
    isSavingComment: boolean;
    isUpdating: boolean;
    error: string | null;
}

const initialState: TaskState = {
    currentTask: null,
    isLoading: false,
    isSavingComment: false,
    isUpdating: false,
    error: null,
};

// Async thunks for API calls
export const getTaskById = createAsyncThunk(
    'task/getTaskById',
    async (taskId: string) => {
        const response = await axios.get(`/tasks/${taskId}`);
        return response.data.data;
    }
);

export const updateTask = createAsyncThunk(
    'task/updateTask',
    async (data: { taskId: string; title?: string; description?: string; priority?: string; dueDate?: string }) => {
        const response = await axios.patch(`/tasks/${data.taskId}`, data);
        return response.data.data;
    }
);

export const deleteTask = createAsyncThunk(
    'task/deleteTask',
    async (taskId: string) => {
        await axios.delete(`/tasks/${taskId}`);
        return taskId;
    }
);

export const addComment = createAsyncThunk(
    'task/addComment',
    async (data: { taskId: string; content: string; parentId?: string }) => {
        const response = await axios.post(`/tasks/${data.taskId}/comments`, {
            content: data.content,
            parentId: data.parentId,
        });
        return response.data.data;
    }
);

export const updateComment = createAsyncThunk(
    'task/updateComment',
    async (data: { taskId: string; commentId: string; content: string }) => {
        const response = await axios.patch(`/tasks/${data.taskId}/comments/${data.commentId}`, {
            content: data.content,
        });
        return response.data.data;
    }
);

export const deleteComment = createAsyncThunk(
    'task/deleteComment',
    async (data: { taskId: string; commentId: string }) => {
        await axios.delete(`/tasks/${data.taskId}/comments/${data.commentId}`);
        return data.commentId;
    }
);

export const uploadAttachment = createAsyncThunk(
    'task/uploadAttachment',
    async (data: { taskId: string; file: File }) => {
        const formData = new FormData();
        formData.append('file', data.file);

        const response = await axios.post(`/tasks/${data.taskId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    }
);

export const deleteAttachment = createAsyncThunk(
    'task/deleteAttachment',
    async (data: { taskId: string; attachmentId: string }) => {
        await axios.delete(`/tasks/${data.taskId}/attachments/${data.attachmentId}`);
        return data.attachmentId;
    }
);

export const addAssignee = createAsyncThunk(
    'task/addAssignee',
    async (data: { taskId: string; userId: string }) => {
        const response = await axios.post(`/tasks/${data.taskId}/assignees`, {
            userId: data.userId,
        });
        return response.data.data;
    }
);

export const removeAssignee = createAsyncThunk(
    'task/removeAssignee',
    async (data: { taskId: string; userId: string }) => {
        await axios.delete(`/tasks/${data.taskId}/assignees/${data.userId}`);
        return data.userId;
    }
);

export const addLabel = createAsyncThunk(
    'task/addLabel',
    async (data: { taskId: string; labelId: string }) => {
        const response = await axios.post(`/tasks/${data.taskId}/labels`, {
            labelId: data.labelId,
        });
        return response.data.data;
    }
);

export const removeLabel = createAsyncThunk(
    'task/removeLabel',
    async (data: { taskId: string; labelId: string }) => {
        await axios.delete(`/tasks/${data.taskId}/labels/${data.labelId}`);
        return data.labelId;
    }
);

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        // Optimistic update from Socket.io
        commentAddedOptimistic: (state, action: { payload: Comment }) => {
            if (state.currentTask && state.currentTask.comments) {
                state.currentTask.comments.push(action.payload);
            }
        },
        attachmentAddedOptimistic: (state, action: { payload: Attachment }) => {
            if (state.currentTask && state.currentTask.attachments) {
                state.currentTask.attachments.push(action.payload);
            }
        },
        taskUpdatedOptimistic: (state, action: { payload: Partial<TaskDetail> }) => {
            if (state.currentTask) {
                state.currentTask = { ...state.currentTask, ...action.payload };
            }
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Task
            .addCase(getTaskById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTaskById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTask = action.payload;
            })
            .addCase(getTaskById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to load task';
            })
            // Update Task
            .addCase(updateTask.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.currentTask = action.payload;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.error.message || 'Failed to update task';
            })
            // Delete Task
            .addCase(deleteTask.fulfilled, (state) => {
                state.currentTask = null;
            })
            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.isSavingComment = true;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.isSavingComment = false;
                if (state.currentTask && state.currentTask.comments) {
                    state.currentTask.comments.push(action.payload);
                }
            })
            .addCase(addComment.rejected, (state, action) => {
                state.isSavingComment = false;
                state.error = action.error.message || 'Failed to add comment';
            })
            // Update Comment
            .addCase(updateComment.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.comments) {
                    const index = state.currentTask.comments.findIndex(c => c.id === action.payload.id);
                    if (index !== -1) {
                        state.currentTask.comments[index] = action.payload;
                    }
                }
            })
            // Delete Comment
            .addCase(deleteComment.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.comments) {
                    state.currentTask.comments = state.currentTask.comments.filter(c => c.id !== action.payload);
                }
            })
            // Upload Attachment
            .addCase(uploadAttachment.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.attachments) {
                    state.currentTask.attachments.push(action.payload);
                }
            })
            // Delete Attachment
            .addCase(deleteAttachment.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.attachments) {
                    state.currentTask.attachments = state.currentTask.attachments.filter(a => a.id !== action.payload);
                }
            })
            // Add Assignee
            .addCase(addAssignee.fulfilled, (state, action) => {
                if (state.currentTask) {
                    state.currentTask = action.payload;
                }
            })
            // Remove Assignee
            .addCase(removeAssignee.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.assignees) {
                    state.currentTask.assignees = state.currentTask.assignees.filter(a => a.user.id !== action.payload);
                }
            })
            // Add Label
            .addCase(addLabel.fulfilled, (state, action) => {
                if (state.currentTask) {
                    state.currentTask = action.payload;
                }
            })
            // Remove Label
            .addCase(removeLabel.fulfilled, (state, action) => {
                if (state.currentTask && state.currentTask.taskLabels) {
                    state.currentTask.taskLabels = state.currentTask.taskLabels.filter(l => l.label.id !== action.payload);
                }
            });
    },
});

export const { commentAddedOptimistic, attachmentAddedOptimistic, taskUpdatedOptimistic, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
