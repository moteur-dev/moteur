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

export async function createEntry(
    user: User,
    projectId: string,
    modelId: string,
    entry: Entry
): Promise<Entry> {
    if (!entry || !entry.id || !isValidId(entry.id)) {
        throw new Error('Entry ID is required to create an entry.');
    }

    await getModelSchema(user, projectId, modelId);

    const storage = getProjectStorage(projectId);
    const exists = await hasKey(storage, entryKey(modelId, entry.id));
    if (exists) {
        throw new Error(`Entry "${entry.id}" already exists in model "${modelId}".`);
    }

    triggerEvent('entry.beforeCreate', { entry, user, modelId, projectId });
    await putJson(storage, entryKey(modelId, entry.id), entry);
    triggerEvent('entry.afterCreate', { entry, user, modelId, projectId });

    return entry;
}

export async function updateEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string,
    patch: Partial<Entry>
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
    const updated = { ...current, ...patch };

    triggerEvent('entry.beforeUpdate', { entry: updated, user, modelId, projectId });
    const storage = getProjectStorage(projectId);
    await putJson(storage, entryKey(modelId, entryId), updated);
    triggerEvent('entry.afterUpdate', { entry: updated, user, modelId, projectId });
    return updated;
}

export async function deleteEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string
): Promise<void> {
    const entry = await getEntry(user, projectId, modelId, entryId);

    triggerEvent('entry.beforeDelete', { entry, user, modelId, projectId });

    const trashDir = trashEntryDir(projectId, modelId, entryId);
    fs.mkdirSync(trashDir, { recursive: true });

    const dest = path.join(trashDir, `${entryId}-${Date.now()}.json`);
    fs.renameSync(entryFilePath(projectId, modelId, entryId), dest);

    triggerEvent('entry.afterDelete', { entry, user, modelId, projectId });
}
