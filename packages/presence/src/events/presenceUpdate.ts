import { Socket } from 'socket.io';
import type { PresenceUpdate } from '@moteur/types/Presence';
import { presenceStore } from '../PresenceStore.js';
import { formStateStore } from '../FormStateStore.js';
import { validatePresenceUpdate } from '../validate.js';

/** Derive stored value from textPreview (e.g. "Entered: hello" -> "hello") */
function parseTextPreview(textPreview: string): string {
    return textPreview.replace(/^Entered: |^Selected: /, '').trim();
}

export function registerPresenceUpdate(socket: Socket) {
    socket.on('presence:update', (payload: unknown) => {
        const user = socket.data.user;
        if (!user?.userId || !user.name) {
            console.warn(`[presence] Invalid presence update from socket ${socket.id}`);
            return;
        }

        const update = validatePresenceUpdate(payload);
        if (update === null) {
            console.warn(`[presence] Invalid presence update payload from socket ${socket.id}`);
            return;
        }

        const prev = presenceStore.get(socket.id);
        const projectId = prev?.projectId;

        if (!projectId) {
            console.warn(`[presence] Missing projectId for socket ${socket.id}`);
            return;
        }

        // Store parsed textPreview into formStateStore for form:sync on join
        const screenId = prev?.screenId ?? update.screenId;
        if (update.textPreview != null && update.fieldPath && screenId) {
            const value = parseTextPreview(update.textPreview);
            formStateStore.update(screenId, update.fieldPath, value);
        }

        // Track previous and next fieldPath for locking
        const prevField = prev?.fieldPath;
        const nextField = update.fieldPath;

        const next = presenceStore.update(socket.id, user.userId, user.name, projectId, update);

        // Handle field locking
        if (prevField && prevField !== nextField) {
            presenceStore.unlockField(projectId, prevField, user.userId);
            socket.to(projectId).emit('locks:update', {
                type: 'unlock',
                fieldPath: prevField,
                userId: user.userId
            });
        }

        if (nextField && nextField !== prevField) {
            presenceStore.lockField(projectId, nextField, user.userId);
            socket.to(projectId).emit('locks:update', {
                type: 'lock',
                fieldPath: nextField,
                userId: user.userId
            });
        }

        // Broadcast updated presence
        socket.to(projectId).emit('presence:change', {
            userId: user.userId,
            changes: update
        });
    });
}
