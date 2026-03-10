import type { Presence, PresenceUpdate } from '@moteur/types/Presence';

const FIELD_LOCK_TTL_MS = 10_000; // AI lock expiry (safety net)

interface FieldLockEntry {
    userId: string;
    acquiredAt: number;
}

export class PresenceStore {
    private presenceBySocket = new Map<string, Presence>();
    // OPEN: field-level locks added here — verify this does not break existing entry-level lock consumers
    private fieldLocks = new Map<string, FieldLockEntry>(); // `${projectId}:${fieldPath}` → { userId, acquiredAt }

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
        if (!current || current.userId === userId) {
            this.fieldLocks.set(key, { userId, acquiredAt: Date.now() });
        }
    }

    /**
     * Try to acquire a field lock. Optional TTL: if the current lock is held by another user
     * and has exceeded ttlMs, it is considered expired and cleared (logged), then we try again.
     * Returns true if lock was acquired, false if held by someone else.
     */
    tryLockField(
        projectId: string,
        fieldPath: string,
        userId: string,
        options?: { ttlMs?: number }
    ): boolean {
        const key = `${projectId}:${fieldPath}`;
        const now = Date.now();
        const ttlMs = options?.ttlMs ?? 0;

        let current = this.fieldLocks.get(key);
        if (current && ttlMs > 0 && current.userId !== userId) {
            if (now - current.acquiredAt >= ttlMs) {
                this.fieldLocks.delete(key);
                console.warn(`[presence] Lock TTL expired for ${key} (held by ${current.userId})`);
                current = undefined;
            }
        }
        if (current && current.userId !== userId) {
            return false;
        }
        this.fieldLocks.set(key, { userId, acquiredAt: now });
        return true;
    }

    unlockField(projectId: string, fieldPath: string, userId: string) {
        const key = `${projectId}:${fieldPath}`;
        const current = this.fieldLocks.get(key);
        if (current?.userId === userId) {
            this.fieldLocks.delete(key);
        }
    }

    unlockAllForUser(userId: string, projectId: string) {
        for (const [key, val] of this.fieldLocks.entries()) {
            if (val.userId === userId && key.startsWith(`${projectId}:`)) {
                this.fieldLocks.delete(key);
            }
        }
    }

    getLocks(projectId: string): Record<string, string> {
        const locks: Record<string, string> = {};
        const now = Date.now();
        for (const [key, val] of this.fieldLocks.entries()) {
            if (key.startsWith(`${projectId}:`)) {
                const [, fieldPath] = key.split(':', 2);
                // Optional: expire AI locks (e.g. 10s) when reading — keep simple, TTL checked in tryLockField
                locks[fieldPath] = val.userId;
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
