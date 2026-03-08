import type { StorageAdapter } from '@moteur/types/Storage.js';
import type { PageNode, StaticPage } from '@moteur/types/Page.js';
import type { Page } from '@moteur/types/Page.js';
import { pageKey, pageListPrefix } from '../utils/storageKeys.js';
import { getJson, putJson } from '../utils/storageAdapterUtils.js';

function parsePageIds(listResult: string[]): string[] {
    return listResult
        .map(name => (name.endsWith('.json') ? name.slice(0, -5) : name))
        .filter(Boolean);
}

/**
 * Transform a legacy Page (no type field) into a StaticPage node.
 * Sets type: 'static', navInclude: true, sitemapInclude: true, sitemapPriority: 0.5, order from index.
 */
function toStaticPage(legacy: Page & { type?: string }, order: number): StaticPage {
    const now = legacy.updatedAt || legacy.createdAt || new Date().toISOString();
    return {
        id: legacy.id,
        projectId: legacy.projectId,
        type: 'static',
        label: legacy.label,
        slug: legacy.slug ?? '',
        parentId: legacy.parentId ?? null,
        order,
        navInclude: true,
        sitemapInclude: true,
        sitemapPriority: 0.5,
        templateId: legacy.templateId,
        status: (legacy.status === 'published' || legacy.status === 'draft'
            ? legacy.status
            : 'draft') as 'published' | 'draft',
        fields: legacy.fields ?? {},
        createdAt: legacy.createdAt ?? now,
        updatedAt: legacy.updatedAt ?? now
    };
}

function isLegacyPage(record: Page | PageNode): record is Page {
    return !('type' in record) || (record as Page & { type?: string }).type === undefined;
}

/**
 * One-time migration: ensure every page record has a `type` field (PageNode).
 * Reads all pages from storage; for any record without `type`, converts to StaticPage and writes back.
 * Idempotent: safe to call multiple times.
 */
export async function migratePagesIfNeeded(
    storage: StorageAdapter,
    _projectId: string
): Promise<boolean> {
    const raw = await storage.list(pageListPrefix());
    const ids = parsePageIds(raw);
    if (ids.length === 0) return false;

    const records: (Page | PageNode)[] = [];
    for (const id of ids) {
        const page = await getJson<Page | PageNode>(storage, pageKey(id));
        if (page) records.push(page);
    }

    const needsMigration = records.some(isLegacyPage);
    if (!needsMigration) return false;

    // Sort by createdAt then id for stable order
    records.sort((a, b) => {
        const ta = (a as Page).createdAt ?? '';
        const tb = (b as Page).createdAt ?? '';
        if (ta !== tb) return ta.localeCompare(tb);
        return (a.id ?? '').localeCompare(b.id ?? '');
    });

    let migrated = 0;
    for (let i = 0; i < records.length; i++) {
        const r = records[i];
        if (!isLegacyPage(r)) continue;
        const staticPage = toStaticPage(r as Page, i);
        await putJson(storage, pageKey(staticPage.id), staticPage);
        migrated++;
    }
    return migrated > 0;
}
