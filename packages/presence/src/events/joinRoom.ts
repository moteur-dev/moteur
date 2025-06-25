import { Socket } from 'socket.io';
import { presenceStore } from '../PresenceStore';
import type { PresenceUpdate } from '@moteur/types/Presence';
import { formStateStore } from '../FormStateStore';

export function registerJoinRoom(socket: Socket) {
    socket.on('join', ({ projectId, screenId }: { projectId: string; screenId?: string }) => {
        const user = socket.data.user;

        if (!user?.userId || !user.name || !projectId) {
            console.warn(`[presence] Invalid join attempt from ${socket.id}`);
            return;
        }

        socket.join(projectId);

        // Initial presence state
        const initial: PresenceUpdate = { screenId };
        const presence = presenceStore.update(
            socket.id,
            user.userId,
            user.name,
            projectId,
            initial
        );

        if (screenId) {
            const values = formStateStore.get(screenId);
            if (Object.keys(values).length > 0) {
                socket.emit('form:sync', {
                    screenId,
                    values
                });
            }
        }

        console.log(`[presence] ${user.name} joined project ${projectId}`);

        // Send full presence list to this user
        socket.emit('presence:sync', {
            users: presenceStore.getByProject(projectId)
        });

        // Notify others someone joined
        socket.to(projectId).emit('presence:change', {
            userId: presence.userId,
            changes: initial
        });
    });
}
