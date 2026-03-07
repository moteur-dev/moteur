import { describe, it, expect } from 'vitest';
import {
    recalculateFromContent,
    getWindowKey
} from '../../scripts/recalculate-usage.js';

describe('recalculate-usage', () => {
    describe('getWindowKey', () => {
        it('returns "all" for window all', () => {
            expect(getWindowKey('2025-03-07T12:00:00.000Z', 'all')).toBe('all');
        });
        it('returns YYYY-MM-DD for window day', () => {
            expect(getWindowKey('2025-03-07T12:00:00.000Z', 'day')).toBe('2025-03-07');
        });
        it('returns YYYY-MM for window month', () => {
            expect(getWindowKey('2025-03-07T12:00:00.000Z', 'month')).toBe('2025-03');
        });
    });

    describe('recalculateFromContent', () => {
        it('aggregates admin and public by project (window all)', () => {
            const content = [
                JSON.stringify({ timestamp: '2025-03-07T12:00:00.000Z', type: 'admin', method: 'GET', path: '/admin/projects', statusCode: 200 }),
                JSON.stringify({ timestamp: '2025-03-07T12:01:00.000Z', type: 'public', projectId: 'blog', method: 'GET', path: '/projects/blog/collections', statusCode: 200 }),
                JSON.stringify({ timestamp: '2025-03-07T12:02:00.000Z', type: 'public', projectId: 'blog', method: 'GET', path: '/projects/blog/pages', statusCode: 200 })
            ].join('\n');
            const result = recalculateFromContent(content, 'all');
            expect(result.source).toBe('inline');
            expect(result.window).toBe('all');
            expect(result.totals.all.admin).toBe(1);
            expect(result.totals.all.public['blog']).toBe(2);
        });

        it('buckets by day when window is day', () => {
            const content = [
                JSON.stringify({ timestamp: '2025-03-07T10:00:00.000Z', type: 'admin', method: 'GET', path: '/admin', statusCode: 200 }),
                JSON.stringify({ timestamp: '2025-03-08T10:00:00.000Z', type: 'admin', method: 'GET', path: '/admin', statusCode: 200 })
            ].join('\n');
            const result = recalculateFromContent(content, 'day');
            expect(result.totals['2025-03-07'].admin).toBe(1);
            expect(result.totals['2025-03-08'].admin).toBe(1);
        });

        it('skips invalid lines and non-admin/public types', () => {
            const content = [
                'not json',
                JSON.stringify({ timestamp: '2025-03-07T12:00:00.000Z', type: null, method: 'GET', path: '/auth', statusCode: 200 }),
                JSON.stringify({ timestamp: '2025-03-07T12:00:00.000Z', type: 'admin', method: 'GET', path: '/admin', statusCode: 200 })
            ].join('\n');
            const result = recalculateFromContent(content, 'all');
            expect(result.totals.all.admin).toBe(1);
        });

        it('uses _unknown for public entries without projectId', () => {
            const line = JSON.stringify({
                timestamp: '2025-03-07T12:00:00.000Z',
                type: 'public',
                method: 'GET',
                path: '/projects/xxx/pages',
                statusCode: 200
            });
            const result = recalculateFromContent(line, 'all');
            expect(result.totals.all.public['_unknown']).toBe(1);
        });
    });
});
