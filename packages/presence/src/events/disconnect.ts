import { Socket } from 'socket.io';
import { presenceStore } from '../PresenceStore.js';

export function registerDisconnect(socket: Socket) {
    socket.on('disconnect', () => {
        const prev = presenceStore.get(socket.id);
        if (!prev) return;

        const { projectId, userId } = prev;

        // Release field locks and notify others so UIs clear lock state
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

        console.log(`[presence] ${userId} disconnected from project ${projectId}`);

        // Notify others
        socket.to(projectId).emit('presence:change', {
            userId,
            changes: null // 🧠 interpreted as "user left"
        });
    });
}
