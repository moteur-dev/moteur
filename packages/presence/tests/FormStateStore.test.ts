import { describe, it, expect, beforeEach } from 'vitest';
import { FormStateStore } from '../src/FormStateStore';

describe('FormStateStore', () => {
    let store: FormStateStore;

    beforeEach(() => {
        store = new FormStateStore();
    });

    it('adds and retrieves a field value', () => {
        store.update('screen-1', 'title', 'Hello');
        expect(store.getField('screen-1', 'title')).toBe('Hello');
    });

    it('returns a full state object for a screen', () => {
        store.update('screen-1', 'title', 'Hello');
        store.update('screen-1', 'subtitle', 'World');
        expect(store.get('screen-1')).toEqual({
            title: 'Hello',
            subtitle: 'World'
        });
    });

    it('clears a single field', () => {
        store.update('screen-1', 'title', 'Hello');
        store.update('screen-1', 'subtitle', 'World');
        store.clearField('screen-1', 'title');
        expect(store.get('screen-1')).toEqual({ subtitle: 'World' });
    });

    it('clears all fields in a screen', () => {
        store.update('screen-1', 'title', 'Hello');
        store.clear('screen-1');
        expect(store.get('screen-1')).toEqual({});
    });

    it('handles get on unknown screen gracefully', () => {
        expect(store.get('nope')).toEqual({});
        expect(store.getField('nope', 'title')).toBeUndefined();
    });

    it('correctly detects dirty state', () => {
        expect(store.isDirty('screen-1')).toBe(false);
        store.update('screen-1', 'title', 'Dirty!');
        expect(store.isDirty('screen-1')).toBe(true);
        store.clear('screen-1');
        expect(store.isDirty('screen-1')).toBe(false);
    });
});
