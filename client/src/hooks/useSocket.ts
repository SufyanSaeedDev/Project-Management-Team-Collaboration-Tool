import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { initializeSocket, getSocket } from '../lib/socket';
import { getBoardColumns, updateTaskOptimistic, reorderColumns } from '../features/board/boardSlice';

export const useSocketBoard = (projectId?: string) => {
    const dispatch = useAppDispatch();
    const { accessToken } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!accessToken || !projectId) return;

        const socket = initializeSocket(accessToken);

        // Join project room for real-time updates
        socket.emit('join-room', { type: 'project', id: projectId });

        // Listen for board updates
        socket.on('board:task-created', (data) => {
            // Task was created, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        socket.on('board:task-updated', (data) => {
            // Task was updated, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        socket.on('board:task-moved', (data: { taskId: string; sourceColumnId: string; destColumnId: string; newIndex: number }) => {
            // Optimistic update from another user
            dispatch(updateTaskOptimistic(data));
        });

        socket.on('board:task-deleted', (data) => {
            // Task was deleted, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        socket.on('board:column-created', (data) => {
            // Column was created, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        socket.on('board:column-updated', (data) => {
            // Column was updated, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        socket.on('board:column-reordered', (data: { columns: any[] }) => {
            // Columns were reordered
            dispatch(reorderColumns(data.columns));
        });

        socket.on('board:column-deleted', (data) => {
            // Column was deleted, refresh the board
            dispatch(getBoardColumns(projectId));
        });

        return () => {
            socket.off('board:task-created');
            socket.off('board:task-updated');
            socket.off('board:task-moved');
            socket.off('board:task-deleted');
            socket.off('board:column-created');
            socket.off('board:column-updated');
            socket.off('board:column-reordered');
            socket.off('board:column-deleted');
            socket.emit('leave-room', { type: 'project', id: projectId });
        };
    }, [projectId, accessToken, dispatch]);
};

export const useSocketTask = (taskId?: string) => {
    const dispatch = useAppDispatch();
    const { accessToken } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!accessToken || !taskId) return;

        const socket = initializeSocket(accessToken);

        // Join task room for real-time updates
        socket.emit('join-room', { type: 'task', id: taskId });

        // Listen for task updates
        socket.on('task:comment-added', (data) => {
            // New comment was added
            console.log('New comment:', data);
        });

        socket.on('task:attachment-added', (data) => {
            // New attachment was added
            console.log('New attachment:', data);
        });

        socket.on('task:assignee-added', (data) => {
            // Assignee was added
            console.log('New assignee:', data);
        });

        socket.on('task:updated', (data) => {
            // Task was updated
            console.log('Task updated:', data);
        });

        return () => {
            socket.off('task:comment-added');
            socket.off('task:attachment-added');
            socket.off('task:assignee-added');
            socket.off('task:updated');
            socket.emit('leave-room', { type: 'task', id: taskId });
        };
    }, [taskId, accessToken, dispatch]);
};

export const useSocketNotifications = () => {
    const dispatch = useAppDispatch();
    const { accessToken, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!accessToken || !user?.id) return;

        const socket = initializeSocket(accessToken);

        // Join user notification room
        socket.emit('join-room', { type: 'user', id: user.id });

        // Listen for new notifications
        socket.on('notification:new', (data) => {
            // New notification received
            console.log('New notification:', data);
            // You can dispatch an action to add this to the notifications state
        });

        socket.on('notification:count-update', (data) => {
            // Unread count updated
            console.log('Notification count:', data.unreadCount);
        });

        return () => {
            socket.off('notification:new');
            socket.off('notification:count-update');
            socket.emit('leave-room', { type: 'user', id: user.id });
        };
    }, [accessToken, user?.id, dispatch]);
};

export const useSocketPresence = (projectId?: string) => {
    const { accessToken } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!accessToken || !projectId) return;

        const socket = initializeSocket(accessToken);

        // Join project room to get presence updates
        socket.emit('join-room', { type: 'project', id: projectId });

        // Listen for presence updates
        socket.on('presence:user-online', (data) => {
            console.log('User online:', data.userId);
        });

        socket.on('presence:user-offline', (data) => {
            console.log('User offline:', data.userId);
        });

        socket.on('presence:users-list', (data) => {
            console.log('Users online:', data.users);
        });

        return () => {
            socket.off('presence:user-online');
            socket.off('presence:user-offline');
            socket.off('presence:users-list');
        };
    }, [projectId, accessToken]);
};
