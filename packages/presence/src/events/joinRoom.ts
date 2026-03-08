import { Socket } from 'socket.io';
import { presenceStore } from '../PresenceStore.js';
import type { PresenceUpdate } from '@moteur/types/Presence';
import { formStateStore } from '../FormStateStore.js';
import { validateJoinPayload } from '../validate.js';

export function registerJoinRoom(socket: Socket) {
    socket.on('join', (payload: unknown) => {
        const user = socket.data.user;

        if (!user?.userId || !user.name) {
            console.warn(`[presence] Invalid join attempt from ${socket.id}`);
            return;
        }

        const parsed = validateJoinPayload(payload);
        if (!parsed) {
            console.warn(`[presence] Invalid join payload from ${socket.id}`);
            return;
        }

        const { projectId, screenId } = parsed;

        const allowedProjects: string[] = user.projects ?? [];
        if (!allowedProjects.includes(projectId)) {
            socket.emit('error', {
                message: 'Access denied: you do not have access to this project'
            });
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
