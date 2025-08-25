import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/auth/authSlice';
import workspacesReducer from '../features/workspaces/workspacesSlice';
import projectsReducer from '../features/projects/projectsSlice';
import boardReducer from '../features/board/boardSlice';
import taskReducer from '../features/tasks/taskSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workspaces: workspacesReducer,
        projects: projectsReducer,
        board: boardReducer,
        task: taskReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for Socket.io and other non-serializable data
                ignoredActions: ['socket/connected', 'socket/disconnected'],
                // Ignore these field paths in state
                ignoredPaths: ['socket.socket'],
            },
        }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
