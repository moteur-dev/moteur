import { Socket } from 'socket.io';
import type { PresenceUpdate } from '@moteur/types/Presence';
import { presenceStore } from '../PresenceStore';

export function registerPresenceUpdate(socket: Socket): void {
    socket.on('presence:update', (update: PresenceUpdate) => {
        const user = socket.data.user;

        if (!user?.userId || !user.name) {
            console.warn(`[presence] Ignoring update from unauthenticated socket: ${socket.id}`);
            return;
        }

        const prev = presenceStore.get(socket.id);
        const projectId = prev?.projectId || update.screenId?.split(':')[0]; // fallback attempt

        if (!projectId) {
            console.warn(`[presence] Missing projectId for socket: ${socket.id}`);
            return;
        }

        const next = presenceStore.update(socket.id, user.userId, user.name, projectId, update);

        socket.to(projectId).emit('presence:change', {
            userId: next.userId,
            changes: update
        });
    });
}
