import { describe, it, expect, beforeEach } from 'vitest';
import { PresenceStore } from '../src/PresenceStore';

describe('PresenceStore integration', () => {
    let store: PresenceStore;

    beforeEach(() => {
        store = new PresenceStore();
    });

    it('tracks a full presence lifecycle for a user', () => {
        const socketId = 'sock-123';
        const userId = 'user-abc';
        const projectId = 'proj-x';
        const fieldPath = 'hero.title';

        // Step 1: connect and send initial presence
        store.update(socketId, userId, 'Alice', projectId, {
            screenId: 'screen-1',
            entryId: 'entry-1',
            fieldPath,
            typing: true,
            cursor: { x: 10, y: 20 }
        });

        // Step 2: lock the field
        store.lockField(projectId, fieldPath, userId);

        // Verify presence is stored
        const presence = store.get(socketId);
        expect(presence?.userId).toBe(userId);
        expect(presence?.fieldPath).toBe(fieldPath);
        expect(store.getLocks(projectId)).toEqual({ [fieldPath]: userId });

        // Step 3: disconnect
        const removed = store.remove(socketId);
        store.unlockAllForUser(userId, projectId);

        // Verify removal
        expect(removed?.userId).toBe(userId);
        expect(store.get(socketId)).toBeUndefined();
        expect(store.getLocks(projectId)).toEqual({});
    });
});
