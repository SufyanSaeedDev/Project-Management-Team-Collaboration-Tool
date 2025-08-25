import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
    memberRole: 'admin' | 'member' | 'client';
}

export interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: WorkspaceState = {
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null,
};

export const getWorkspaces = createAsyncThunk('workspaces/getAll', async () => {
    const response = await axios.get('/workspaces');
    return response.data.data;
});

export const createWorkspace = createAsyncThunk(
    'workspaces/create',
    async (data: { name: string; description?: string }) => {
        const response = await axios.post('/workspaces', data);
        return response.data.data;
    }
);

export const getWorkspaceById = createAsyncThunk(
    'workspaces/getById',
    async (workspaceId: string) => {
        const response = await axios.get(`/workspaces/${workspaceId}`);
        return response.data.data;
    }
);

const workspacesSlice = createSlice({
    name: 'workspaces',
    initialState,
    reducers: {
        clearCurrentWorkspace: (state) => {
            state.currentWorkspace = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all workspaces
            .addCase(getWorkspaces.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getWorkspaces.fulfilled, (state, action) => {
                state.isLoading = false;
                state.workspaces = action.payload;
            })
            .addCase(getWorkspaces.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch workspaces';
            })
            // Create workspace
            .addCase(createWorkspace.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.isLoading = false;
                state.workspaces.push(action.payload);
            })
            .addCase(createWorkspace.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to create workspace';
            })
            // Get workspace by ID
            .addCase(getWorkspaceById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getWorkspaceById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentWorkspace = action.payload;
            })
            .addCase(getWorkspaceById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch workspace';
            });
    },
});

export const { clearCurrentWorkspace } = workspacesSlice.actions;
export default workspacesSlice.reducer;
