import { describe, it, expect, beforeEach } from 'vitest';
import { migratePagesIfNeeded } from '../../src/migrations/migratePages.js';
import type { StorageAdapter } from '@moteur/types/Storage.js';
import { pageKey, pageListPrefix } from '../../src/utils/storageKeys.js';
import { getJson } from '../../src/utils/storageAdapterUtils.js';

function createMemoryStorage(): StorageAdapter & { store: Map<string, Buffer> } {
    const store = new Map<string, Buffer>();
    return {
        store,
        async get(key: string) {
            return store.get(key) ?? null;
        },
        async put(key: string, data: Buffer) {
            store.set(key, data);
        },
        async delete(_key: string) {},
        async list(prefix?: string) {
            const p = prefix ?? '';
            return [...store.keys()]
                .filter(k => p === '' || k.startsWith(p))
                .map(k => {
                    if (!p) return k;
                    const suffix = k.slice(p.length).replace(/^\//, '');
                    return suffix.split('/').pop() ?? suffix;
                });
        }
    };
}

describe('migratePagesIfNeeded', () => {
    it('returns false when no pages exist', async () => {
        const storage = createMemoryStorage();
        const result = await migratePagesIfNeeded(storage, 'p1');
        expect(result).toBe(false);
    });

    it('returns false when all pages already have type', async () => {
        const storage = createMemoryStorage();
        const alreadyMigrated = {
            id: 'page1',
            projectId: 'p1',
            type: 'static',
            label: 'Home',
            slug: 'home',
            parentId: null,
            order: 0,
            navInclude: true,
            sitemapInclude: true,
            templateId: 't1',
            status: 'published',
            fields: {},
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        };
        storage.store.set(
            pageKey('page1'),
            Buffer.from(JSON.stringify(alreadyMigrated), 'utf-8')
        );
        (storage.list as any) = async (prefix?: string) => {
            if (prefix === pageListPrefix()) return ['page1.json'];
            return [];
        };
        const result = await migratePagesIfNeeded(storage, 'p1');
        expect(result).toBe(false);
    });

    it('migrates legacy page to StaticPage and returns true', async () => {
        const storage = createMemoryStorage();
        const legacyPage = {
            id: 'legacy1',
            projectId: 'p1',
            templateId: 't1',
            label: 'About',
            slug: 'about',
            status: 'published',
            fields: { title: 'About' },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z'
        };
        storage.store.set(pageKey('legacy1'), Buffer.from(JSON.stringify(legacyPage), 'utf-8'));
        (storage.list as any) = async (prefix?: string) => {
            if (prefix === pageListPrefix()) return ['legacy1.json'];
            return [];
        };

        const result = await migratePagesIfNeeded(storage, 'p1');
        expect(result).toBe(true);

        const after = await getJson(storage, pageKey('legacy1'));
        expect(after).not.toBeNull();
        expect((after as any).type).toBe('static');
        expect((after as any).label).toBe('About');
        expect((after as any).slug).toBe('about');
        expect((after as any).navInclude).toBe(true);
        expect((after as any).sitemapInclude).toBe(true);
        expect((after as any).sitemapPriority).toBe(0.5);
        expect((after as any).order).toBe(0);
        expect((after as any).parentId).toBeNull();
    });
});
