import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export interface Task {
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
    assignees?: Array<{ user: { id: string; fullName: string; avatarUrl?: string } }>;
    taskLabels?: Array<{ label: { id: string; name: string; color: string } }>;
}

export interface Column {
    id: string;
    projectId: string;
    name: string;
    color?: string;
    position: number;
    wipLimit?: number;
    tasks: Task[];
}

export interface BoardState {
    columns: Column[];
    isLoading: boolean;
    error: string | null;
}

const initialState: BoardState = {
    columns: [],
    isLoading: false,
    error: null,
};

export const getBoardColumns = createAsyncThunk(
    'board/getColumns',
    async (projectId: string) => {
        const response = await axios.get(`/columns/projects/${projectId}`);
        return response.data.data;
    }
);

export const createColumn = createAsyncThunk(
    'board/createColumn',
    async (data: { projectId: string; name: string; color?: string }) => {
        const response = await axios.post(`/columns/projects/${data.projectId}`, {
            name: data.name,
            color: data.color,
        });
        return response.data.data;
    }
);

export const updateColumn = createAsyncThunk(
    'board/updateColumn',
    async (data: { columnId: string; name?: string; color?: string }) => {
        const response = await axios.patch(`/columns/${data.columnId}`, data);
        return response.data.data;
    }
);

export const deleteColumn = createAsyncThunk(
    'board/deleteColumn',
    async (columnId: string) => {
        await axios.delete(`/columns/${columnId}`);
        return columnId;
    }
);

export const moveTask = createAsyncThunk(
    'board/moveTask',
    async (data: { taskId: string; destColumnId: string; position: number }) => {
        const response = await axios.patch(`/tasks/${data.taskId}/move`, {
            columnId: data.destColumnId,
            position: data.position,
        });
        return response.data.data;
    }
);

export const reorderTasks = createAsyncThunk(
    'board/reorderTasks',
    async (data: { columnId: string; tasks: Array<{ id: string; position: number }> }) => {
        const response = await axios.patch(`/columns/${data.columnId}/reorder`, {
            tasks: data.tasks,
        });
        return response.data.data;
    }
);

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        reorderColumns: (state, action: { payload: Column[] }) => {
            state.columns = action.payload;
        },
        updateTaskOptimistic: (state, action: { payload: { taskId: string; sourceColumnId: string; destColumnId: string; newIndex: number } }) => {
            // Find and remove task from source column
            const sourceColumn = state.columns.find(c => c.id === action.payload.sourceColumnId);
            const taskIndex = sourceColumn?.tasks.findIndex(t => t.id === action.payload.taskId);
            if (sourceColumn && taskIndex !== undefined && taskIndex > -1) {
                const [task] = sourceColumn.tasks.splice(taskIndex, 1);

                // Add to destination column
                const destColumn = state.columns.find(c => c.id === action.payload.destColumnId);
                if (destColumn) {
                    destColumn.tasks.splice(action.payload.newIndex, 0, task);
                    task.columnId = destColumn.id;
                    task.position = action.payload.newIndex;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBoardColumns.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBoardColumns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.columns = action.payload;
            })
            .addCase(getBoardColumns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to load board';
            })
            .addCase(createColumn.fulfilled, (state, action) => {
                state.columns.push(action.payload);
            })
            .addCase(updateColumn.fulfilled, (state, action) => {
                const index = state.columns.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.columns[index] = action.payload;
                }
            })
            .addCase(deleteColumn.fulfilled, (state, action) => {
                state.columns = state.columns.filter(c => c.id !== action.payload);
            })
            .addCase(moveTask.fulfilled, (state, action) => {
                // Refresh the entire board after moving task
                // The server will handle position updates
            });
    },
});

export const { reorderColumns, updateTaskOptimistic } = boardSlice.actions;
export default boardSlice.reducer;
