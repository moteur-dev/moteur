import type { Presence, PresenceUpdate } from '@moteur/types/Presence';

export class PresenceStore {
    private presenceBySocket = new Map<string, Presence>();
    private fieldLocks = new Map<string, string>(); // `${projectId}:${fieldPath}` → userId

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
    lockField(projectId: string, fieldPath: string, userId: string) {
        const key = `${projectId}:${fieldPath}`;
        const current = this.fieldLocks.get(key);
        if (!current || current === userId) {
            this.fieldLocks.set(key, userId);
        }
    }

    unlockField(projectId: string, fieldPath: string, userId: string) {
        const key = `${projectId}:${fieldPath}`;
        const current = this.fieldLocks.get(key);
        if (current === userId) {
            this.fieldLocks.delete(key);
        }
    }

    unlockAllForUser(userId: string, projectId: string) {
        for (const [key, val] of this.fieldLocks.entries()) {
            if (val === userId && key.startsWith(`${projectId}:`)) {
                this.fieldLocks.delete(key);
            }
        }
    }

    getLocks(projectId: string): Record<string, string> {
        const locks: Record<string, string> = {};
        for (const [key, val] of this.fieldLocks.entries()) {
            if (key.startsWith(`${projectId}:`)) {
                const [, fieldPath] = key.split(':', 2);
                locks[fieldPath] = val;
            }
        }
        return locks;
    }

    /** Get the screenId for a socket */
    getScreen(socketId: string): string | undefined {
        return this.presenceBySocket.get(socketId)?.screenId;
    }

    /** Get all presence for a given screenId (optional utility) */
    getByScreen(screenId: string): Presence[] {
        return Array.from(this.presenceBySocket.values()).filter(p => p.screenId === screenId);
    }
}

export const presenceStore = new PresenceStore();
