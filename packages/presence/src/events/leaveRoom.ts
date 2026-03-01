import { Socket } from 'socket.io';
import { presenceStore } from '../PresenceStore.js';

export function registerLeaveRoom(socket: Socket): void {
    socket.on('leave', (payload: unknown) => {
        const projectId =
            payload &&
            typeof payload === 'object' &&
            'projectId' in payload &&
            typeof (payload as { projectId?: unknown }).projectId === 'string'
                ? (payload as { projectId: string }).projectId.trim()
                : '';
        if (!projectId) return;

        const prev = presenceStore.get(socket.id);
        if (prev?.projectId === projectId) {
            const { userId } = prev;

            // Release field locks and notify others
            const locks = presenceStore.getLocks(projectId);
            for (const [fieldPath, lockUserId] of Object.entries(locks)) {
                if (lockUserId === userId) {
                    socket.to(projectId).emit('locks:update', {
                        type: 'unlock',
                        fieldPath,
                        userId
                    });
                }
            }
            presenceStore.unlockAllForUser(userId, projectId);
            presenceStore.remove(socket.id);

            socket.to(projectId).emit('presence:change', {
                userId,
                changes: null
            });

            console.log(`[presence] ${prev.name ?? userId} left room ${projectId}`);
        }

        socket.leave(projectId);
    });
}
