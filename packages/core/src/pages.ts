import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Page } from '@moteur/types/Page.js';
import type { EntryStatus } from '@moteur/types/Model.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { isValidId } from './utils/idUtils.js';
import { User } from '@moteur/types/User.js';
import { getProject } from './projects.js';
import { assertUserCanAccessProject } from './utils/access.js';
import { getTemplate } from './templates.js';
import { hasApprovedReviewForPage } from './reviews.js';
import { triggerEvent } from './utils/eventBus.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson, hasKey } from './utils/storageAdapterUtils.js';
import { pageKey, pageListPrefix } from './utils/storageKeys.js';
import { pageFilePath, trashPagesDir } from './utils/pathUtils.js';
import { validatePage as validatePageAgainstTemplate } from './validators/validatePage.js';

export interface ListPagesOptions {
    templateId?: string;
    parentId?: string | null;
    status?: EntryStatus;
}

function parsePageIds(listResult: string[]): string[] {
    return listResult
        .map(name => (name.endsWith('.json') ? name.slice(0, -5) : name))
        .filter(Boolean);
}

async function loadAllPages(projectId: string): Promise<Page[]> {
    const storage = getProjectStorage(projectId);
    const raw = await storage.list(pageListPrefix());
    const ids = parsePageIds(raw);
    const pages: Page[] = [];
    for (const id of ids) {
        const page = await getJson<Page>(storage, pageKey(id));
        if (page) pages.push(page);
    }
    return pages;
}

export async function listPages(projectId: string, options?: ListPagesOptions): Promise<Page[]> {
    if (!isValidId(projectId)) {
        throw new Error(`Invalid projectId: "${projectId}"`);
    }

    let pages = await loadAllPages(projectId);
    if (options?.templateId) {
        pages = pages.filter(p => p.templateId === options.templateId);
    }
    if (options?.parentId !== undefined) {
        if (options.parentId === null || options.parentId === '') {
            pages = pages.filter(p => p.parentId == null || p.parentId === '');
        } else {
            pages = pages.filter(p => p.parentId === options.parentId);
        }
    }
    if (options?.status) {
        pages = pages.filter(p => p.status === options.status);
    }
    return pages;
}

export async function getPage(projectId: string, id: string): Promise<Page> {
    if (!id || !isValidId(id)) {
        throw new Error(`Invalid page ID: ${id}`);
    }

    const storage = getProjectStorage(projectId);
    const page = await getJson<Page>(storage, pageKey(id));
    if (!page) {
        throw new Error(`Page "${id}" not found in project "${projectId}".`);
    }
    return page;
}

export async function getPageWithAuth(user: User, projectId: string, id: string): Promise<Page> {
    const project = await getProject(user, projectId);
    assertUserCanAccessProject(user, project);
    return getPage(projectId, id);
}

export async function getPageBySlug(projectId: string, slug: string): Promise<Page | null> {
    const pages = await loadAllPages(projectId);
    const found = pages.find(p => p.slug === slug);
    return found ?? null;
}

async function assertSlugUnique(
    projectId: string,
    slug: string,
    excludePageId?: string
): Promise<void> {
    if (!slug) return;
    const pages = await loadAllPages(projectId);
    const existing = pages.find(p => p.slug === slug && p.id !== excludePageId);
    if (existing) {
        throw new Error(`Another page already uses the slug "${slug}" in this project.`);
    }
}

async function assertNoParentCycle(
    projectId: string,
    pageId: string,
    parentId: string
): Promise<void> {
    if (parentId === pageId) {
        throw new Error('A page cannot be its own parent.');
    }
    let currentId: string | undefined = parentId;
    const seen = new Set<string>([pageId]);
    const storage = getProjectStorage(projectId);
    while (currentId) {
        if (seen.has(currentId)) {
            throw new Error('Parent would create a circular reference.');
        }
        seen.add(currentId);
        const parentPage: Page | null = await getJson<Page>(storage, pageKey(currentId));
        currentId = parentPage?.parentId;
    }
}

export async function createPage(
    projectId: string,
    user: User,
    data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Page> {
    const project = await getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    const id = randomUUID();

    const template = await getTemplate(projectId, data.templateId);
    const draftPage: Page = {
        ...data,
        id,
        projectId,
        status: data.status ?? 'draft',
        fields: data.fields ?? {},
        createdAt: '',
        updatedAt: ''
    };
    const validation = validatePageAgainstTemplate(draftPage, template);
    if (!validation.valid) {
        const msg = validation.issues.map(i => `${i.path}: ${i.message}`).join('; ');
        throw new Error(`Page validation failed: ${msg}`);
    }

    if (data.slug) {
        await assertSlugUnique(projectId, data.slug);
    }
    if (data.parentId) {
        await getPage(projectId, data.parentId);
        await assertNoParentCycle(projectId, id, data.parentId);
    }

    const storage = getProjectStorage(projectId);
    const exists = await hasKey(storage, pageKey(id));
    if (exists) {
        throw new Error(`Page "${id}" already exists in project "${projectId}".`);
    }

    const now = new Date().toISOString();
    const page: Page = {
        ...draftPage,
        createdAt: now,
        updatedAt: now
    };

    triggerEvent('page.beforeCreate', { page, user, projectId });
    await putJson(storage, pageKey(id), page);
    triggerEvent('page.afterCreate', { page, user, projectId });
    return page;
}

export async function updatePage(
    projectId: string,
    user: User,
    id: string,
    patch: Partial<Page>
): Promise<Page> {
    if (patch.status === 'published') {
        const project = await getProject(user, projectId);
        if (project.workflow?.enabled && project.workflow?.requireReview) {
            const isAdmin = Array.isArray(user.roles) && user.roles.includes('admin');
            if (!isAdmin) {
                const approved = await hasApprovedReviewForPage(projectId, id);
                if (!approved) {
                    throw new Error(
                        'Publishing requires an approved review when the project has review workflow enabled.'
                    );
                }
            }
        }
    }

    const current = await getPageWithAuth(user, projectId, id);
    const updated = { ...current, ...patch };

    if (updated.templateId) {
        const template = await getTemplate(projectId, updated.templateId);
        const validation = validatePageAgainstTemplate(updated, template);
        if (!validation.valid) {
            const msg = validation.issues.map(i => `${i.path}: ${i.message}`).join('; ');
            throw new Error(`Page validation failed: ${msg}`);
        }
    }

    if (patch.slug !== undefined && patch.slug !== current.slug) {
        await assertSlugUnique(projectId, patch.slug, id);
    }
    const newParentId = patch.parentId !== undefined ? patch.parentId : updated.parentId;
    if (newParentId && newParentId !== current.parentId) {
        await getPage(projectId, newParentId);
        await assertNoParentCycle(projectId, id, newParentId);
    }

    triggerEvent('page.beforeUpdate', { page: updated, user, projectId });
    const storage = getProjectStorage(projectId);
    await putJson(storage, pageKey(id), updated);
    triggerEvent('page.afterUpdate', { page: updated, user, projectId });
    return updated;
}

export async function deletePage(projectId: string, user: User, id: string): Promise<void> {
    const current = await getPageWithAuth(user, projectId, id);

    const allPages = await loadAllPages(projectId);
    const children = allPages.filter(p => p.parentId === id);
    const storage = getProjectStorage(projectId);
    for (const child of children) {
        const updated = { ...child, parentId: undefined };
        await putJson(storage, pageKey(child.id), updated);
    }

    triggerEvent('page.beforeDelete', { page: current, user, projectId });

    const source = pageFilePath(projectId, id);
    const destDir = trashPagesDir(projectId);
    const dest = path.join(destDir, `${id}.json`);

    try {
        fs.mkdirSync(destDir, { recursive: true });
        fs.renameSync(source, dest);
    } catch (err) {
        if ((err as { code?: string }).code !== 'ENOENT') throw err;
    }

    triggerEvent('page.afterDelete', { page: current, user, projectId });
}

export async function validatePageById(projectId: string, id: string): Promise<ValidationResult> {
    const page = await getPage(projectId, id);
    const template = await getTemplate(projectId, page.templateId);
    return validatePageAgainstTemplate(page, template);
}

export async function validateAllPages(projectId: string): Promise<ValidationResult[]> {
    const pages = await loadAllPages(projectId);
    const results: ValidationResult[] = [];
    for (const page of pages) {
        try {
            const template = await getTemplate(projectId, page.templateId);
            results.push(validatePageAgainstTemplate(page, template));
        } catch {
            results.push({
                valid: false,
                issues: [
                    {
                        type: 'error',
                        code: 'PAGE_INVALID_TEMPLATE',
                        message: `Template "${page.templateId}" not found.`,
                        path: 'templateId'
                    }
                ]
            });
        }
    }
    return results;
}
