import type { Presence, PresenceUpdate } from '@moteur/types/Presence';

export class PresenceStore {
    private presenceBySocket = new Map<string, Presence>();

    /** Add or update a user's presence */
    update(
        socketId: string,
        userId: string,
        name: string,
        projectId: string,
        update: PresenceUpdate
    ): Presence {
        const prev = this.presenceBySocket.get(socketId);
        const now: Presence = {
            userId,
            name,
            projectId,
            avatarUrl: prev?.avatarUrl,
            screenId: update.screenId ?? prev?.screenId,
            entryId: update.entryId ?? prev?.entryId,
            fieldPath: update.fieldPath ?? prev?.fieldPath,
            typing: update.typing ?? prev?.typing,
            cursor: update.cursor ?? prev?.cursor,
            updatedAt: Date.now()
        };

        this.presenceBySocket.set(socketId, now);
        return now;
    }

    /** Remove user on disconnect */
    remove(socketId: string): Presence | undefined {
        const removed = this.presenceBySocket.get(socketId);
        this.presenceBySocket.delete(socketId);
        return removed;
    }

    /** Get all presence for a given project */
    getByProject(projectId: string): Presence[] {
        return Array.from(this.presenceBySocket.values()).filter(p => p.projectId === projectId);
    }

    /** Get a specific presence */
    get(socketId: string): Presence | undefined {
        return this.presenceBySocket.get(socketId);
    }
}

export const presenceStore = new PresenceStore();
