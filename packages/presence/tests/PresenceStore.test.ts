import { describe, it, expect, beforeEach } from 'vitest';
import { PresenceStore } from '../src/PresenceStore';

describe('PresenceStore', () => {
    let store: PresenceStore;

    beforeEach(() => {
        store = new PresenceStore();
    });

    it('adds and updates presence by socket', () => {
        const result = store.update('sock1', 'user1', 'Alice', 'projA', { screenId: 'screenA' });
        expect(result.userId).toBe('user1');
        expect(store.get('sock1')?.screenId).toBe('screenA');
    });

    it('removes a socket and returns previous presence', () => {
        store.update('sock1', 'user1', 'Alice', 'projA', {});
        const removed = store.remove('sock1');
        expect(removed?.userId).toBe('user1');
        expect(store.get('sock1')).toBeUndefined();
    });

    it('filters presence by project', () => {
        store.update('s1', 'u1', 'A', 'p1', {});
        store.update('s2', 'u2', 'B', 'p2', {});
        const p1 = store.getByProject('p1');
        expect(p1.length).toBe(1);
        expect(p1[0].userId).toBe('u1');
    });

    it('filters presence by screenId', () => {
        store.update('s1', 'u1', 'A', 'p1', { screenId: 'screen1' });
        store.update('s2', 'u2', 'B', 'p1', { screenId: 'screen2' });
        const screen1 = store.getByScreen('screen1');
        expect(screen1.length).toBe(1);
        expect(screen1[0].userId).toBe('u1');
    });

    it('locks and unlocks fields correctly', () => {
        store.lockField('p1', 'fieldA', 'u1');
        store.lockField('p1', 'fieldA', 'u2'); // should not override
        expect(store.getLocks('p1')).toEqual({ fieldA: 'u1' });

        store.unlockField('p1', 'fieldA', 'u2'); // should not unlock
        expect(store.getLocks('p1')).toEqual({ fieldA: 'u1' });

        store.unlockField('p1', 'fieldA', 'u1'); // should unlock
        expect(store.getLocks('p1')).toEqual({});
    });

    it('unlocks all fields for a user in a project', () => {
        store.lockField('p1', 'fieldA', 'u1');
        store.lockField('p1', 'fieldB', 'u1');
        store.lockField('p2', 'fieldA', 'u1');
        store.unlockAllForUser('u1', 'p1');
        expect(store.getLocks('p1')).toEqual({});
        expect(store.getLocks('p2')).toEqual({ fieldA: 'u1' });
    });

    it('returns screenId for socket', () => {
        store.update('s1', 'u1', 'A', 'p1', { screenId: 'xyz' });
        expect(store.getScreen('s1')).toBe('xyz');
    });
});
