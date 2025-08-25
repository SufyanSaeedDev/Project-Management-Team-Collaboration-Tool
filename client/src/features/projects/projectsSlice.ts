import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../lib/axios';

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isArchived: boolean;
    clientToken?: string;
    createdBy: string;
}

export interface ProjectState {
    projects: Project[];
    currentProject: Project | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
};

export const getProjects = createAsyncThunk(
    'projects/getAll',
    async (workspaceId: string) => {
        const response = await axios.get(`/projects/workspaces/${workspaceId}`);
        return response.data.data;
    }
);

export const createProject = createAsyncThunk(
    'projects/create',
    async (data: { workspaceId: string; name: string; description?: string; color?: string }) => {
        const response = await axios.post(`/projects/workspaces/${data.workspaceId}`, {
            name: data.name,
            description: data.description,
            color: data.color,
        });
        return response.data.data;
    }
);

export const getProjectById = createAsyncThunk(
    'projects/getById',
    async (projectId: string) => {
        const response = await axios.get(`/projects/${projectId}`);
        return response.data.data;
    }
);

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all projects
            .addCase(getProjects.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects = action.payload;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch projects';
            })
            // Create project
            .addCase(createProject.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects.push(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to create project';
            })
            // Get project by ID
            .addCase(getProjectById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProjectById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
            })
            .addCase(getProjectById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch project';
            });
    },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
