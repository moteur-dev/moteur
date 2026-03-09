import fs from 'fs';
import path from 'path';
import { Entry } from '@moteur/types/Model.js';
import { isValidId } from './utils/idUtils.js';
import { entryFilePath, trashEntryDir } from './utils/pathUtils.js';
import { User } from '@moteur/types/User.js';
import { getModelSchema } from './models.js';
import { getProject } from './projects.js';
import { hasApprovedReview } from './reviews.js';
import { triggerEvent } from './utils/eventBus.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson, hasKey } from './utils/storageAdapterUtils.js';
import { entryKey, entryListPrefix } from './utils/storageKeys.js';
import type { EntryStatus } from '@moteur/types/Model.js';
import { dispatch as webhookDispatch } from './webhooks/webhookService.js';
import {
    getCoreIdFieldIds,
    stripCoreIdFromData,
    ensureCoreIdValues
} from './utils/coreIdFields.js';

/** Options for listing entries without user (e.g. API key / collection pipeline). */
export interface ListEntriesForProjectOptions {
    status?: EntryStatus | EntryStatus[];
    locale?: string;
}

/**
 * List entries for a project/model without user check. For internal use (e.g. collection API).
 */
export async function listEntriesForProject(
    projectId: string,
    modelId: string,
    options?: ListEntriesForProjectOptions
): Promise<Entry[]> {
    const storage = getProjectStorage(projectId);
    const ids = await storage.list(entryListPrefix(modelId));
    const entries: Entry[] = [];
    for (const id of ids) {
        const key = entryKey(modelId, id);
        const entry = await getJson<Entry>(storage, key);
        if (entry) entries.push(entry);
    }
    const statusFilter = options?.status ?? ['published'];
    const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
    return entries.filter(e => statuses.includes((e.status ?? 'draft') as EntryStatus));
}

/**
 * Get one entry by id without user check. For internal use (e.g. collection API). Returns null if not found.
 */
export async function getEntryForProject(
    projectId: string,
    modelId: string,
    entryId: string
): Promise<Entry | null> {
    if (!entryId || !isValidId(entryId)) return null;
    const storage = getProjectStorage(projectId);
    const entry = await getJson<Entry>(storage, entryKey(modelId, entryId));
    return entry ?? null;
}

export async function listEntries(
    user: User,
    projectId: string,
    modelId: string
): Promise<Entry[]> {
    const _schema = await getModelSchema(user, projectId, modelId);

    const storage = getProjectStorage(projectId);
    const ids = await storage.list(entryListPrefix(modelId));
    const entries: Entry[] = [];

    for (const id of ids) {
        const key = entryKey(modelId, id);
        const entry = await getJson<Entry>(storage, key);
        if (entry) entries.push(entry);
    }
    return entries;
}

export async function getEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string
): Promise<Entry> {
    if (!entryId || !isValidId(entryId)) {
        throw new Error(`Invalid entry ID: ${entryId}`);
    }

    await getModelSchema(user, projectId, modelId);

    const storage = getProjectStorage(projectId);
    const entry = await getJson<Entry>(storage, entryKey(modelId, entryId));
    if (!entry) {
        throw new Error(
            `Entry "${entryId}" not found in model "${modelId}" of project "${projectId}".`
        );
    }
    return entry;
}

export interface EntryServiceOptions {
    source?: 'studio' | 'api' | 'scheduler';
}

export async function createEntry(
    user: User,
    projectId: string,
    modelId: string,
    entry: Entry,
    options?: EntryServiceOptions
): Promise<Entry> {
    if (!entry || !entry.id || !isValidId(entry.id)) {
        throw new Error('Entry ID is required to create an entry.');
    }

    const schema = await getModelSchema(user, projectId, modelId);
    const coreIdFields = getCoreIdFieldIds(schema);
    if (coreIdFields.length > 0 && entry.data) {
        entry = {
            ...entry,
            data: ensureCoreIdValues(entry.data, coreIdFields)
        };
    }

    const storage = getProjectStorage(projectId);
    const exists = await hasKey(storage, entryKey(modelId, entry.id));
    if (exists) {
        throw new Error(`Entry "${entry.id}" already exists in model "${modelId}".`);
    }

    triggerEvent('entry.beforeCreate', { entry, user, modelId, projectId });
    await putJson(storage, entryKey(modelId, entry.id), entry);
    triggerEvent('entry.afterCreate', { entry, user, modelId, projectId });

    try {
        webhookDispatch(
            'entry.created',
            {
                entryId: entry.id,
                modelId,
                status: (entry.status ?? 'draft') as string,
                locale: entry.data?.locale,
                slug: entry.data?.slug,
                updatedBy: user.id
            },
            { projectId, source: options?.source ?? 'api' }
        );
    } catch {
        // never fail the operation
    }
    return entry;
}

export async function updateEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string,
    patch: Partial<Entry>,
    options?: EntryServiceOptions
): Promise<Entry> {
    if (!entryId || !isValidId(entryId)) {
        throw new Error(`Invalid entry ID: ${entryId}`);
    }

    if (patch.status === 'published') {
        const project = await getProject(user, projectId);
        if (project.workflow?.enabled && project.workflow?.requireReview) {
            const isAdmin = Array.isArray(user.roles) && user.roles.includes('admin');
            if (!isAdmin) {
                const approved = await hasApprovedReview(projectId, modelId, entryId);
                if (!approved) {
                    throw new Error(
                        'Publishing requires an approved review when the project has review workflow enabled.'
                    );
                }
            }
        }
    }

    const current = await getEntry(user, projectId, modelId, entryId);
    const schema = await getModelSchema(user, projectId, modelId);
    const coreIdFields = getCoreIdFieldIds(schema);
    let sanitizedPatch: Partial<Entry> = { ...patch };
    if (patch.data && coreIdFields.length > 0) {
        sanitizedPatch = {
            ...patch,
            data: { ...current.data, ...stripCoreIdFromData(patch.data, coreIdFields) }
        };
    }
    const updated = { ...current, ...sanitizedPatch };

    triggerEvent('entry.beforeUpdate', { entry: updated, user, modelId, projectId });
    const storage = getProjectStorage(projectId);
    await putJson(storage, entryKey(modelId, entryId), updated);
    triggerEvent('entry.afterUpdate', { entry: updated, user, modelId, projectId });

    const source = options?.source ?? 'api';
    const payloadEntry = {
        entryId,
        modelId,
        status: (updated.status ?? 'draft') as string,
        locale: updated.data?.locale,
        slug: updated.data?.slug,
        updatedBy: user.id
    };
    try {
        webhookDispatch('entry.updated', payloadEntry, { projectId, source });
        const prevStatus = (current.status ?? 'draft') as string;
        const newStatus = (updated.status ?? 'draft') as string;
        if (prevStatus !== 'published' && newStatus === 'published') {
            webhookDispatch('entry.published', payloadEntry, { projectId, source });
        } else if (prevStatus === 'published' && newStatus === 'unpublished') {
            webhookDispatch('entry.unpublished', payloadEntry, { projectId, source });
        }
    } catch {
        // never fail the operation
    }
    return updated;
}

export async function deleteEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string,
    options?: EntryServiceOptions
): Promise<void> {
    const entry = await getEntry(user, projectId, modelId, entryId);

    triggerEvent('entry.beforeDelete', { entry, user, modelId, projectId });

    const trashDir = trashEntryDir(projectId, modelId, entryId);
    fs.mkdirSync(trashDir, { recursive: true });

    const dest = path.join(trashDir, `${entryId}-${Date.now()}.json`);
    fs.renameSync(entryFilePath(projectId, modelId, entryId), dest);

    triggerEvent('entry.afterDelete', { entry, user, modelId, projectId });

    try {
        webhookDispatch(
            'entry.deleted',
            {
                entryId,
                modelId,
                status: (entry.status ?? 'draft') as string,
                locale: entry.data?.locale,
                slug: entry.data?.slug,
                updatedBy: user.id
            },
            { projectId, source: options?.source ?? 'api' }
        );
    } catch {
        // never fail the operation
    }
}
