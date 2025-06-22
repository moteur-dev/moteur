import fs from 'fs';
import path from 'path';
import { Entry } from '@moteur/types/Model';
import { readJson, writeJson } from './utils/fileUtils';
import { isValidId } from './utils/idUtils';
import { isExistingEntryId } from './utils/fileUtils';
import { baseEntriesDir, entryDir, entryFilePath, trashEntryDir } from './utils/pathUtils';
import { User } from '@moteur/types/User';
import { getModelSchema } from './models';
import { triggerEvent } from './utils/eventBus';

export function listEntries(user: User, projectId: string, modelId: string): Entry[] {
    // This validates project access and model schema existence
    const schema = getModelSchema(user, projectId, modelId);

    const dir = baseEntriesDir(projectId, modelId);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(file => file.endsWith('.json'))
        .map(file => readJson(path.join(dir, file)) as Entry);
}

export function getEntry(user: User, projectId: string, modelId: string, entryId: string): Entry {
    if (!entryId || !isValidId(entryId)) {
        throw new Error(`Invalid entry ID: ${entryId}`);
    }
    if (!isExistingEntryId(projectId, modelId, entryId)) {
        throw new Error(
            `Entry "${entryId}" not found in model "${modelId}" of project "${projectId}".`
        );
    }

    // This validates project access and model schema existence
    const schema = getModelSchema(user, projectId, modelId);

    const file = entryFilePath(projectId, modelId, entryId);
    return readJson(file) as Entry;
}

export function createEntry(user: User, projectId: string, modelId: string, entry: Entry): Entry {
    if (!entry || !entry.id || !isValidId(entry.id)) {
        throw new Error('Entry ID is required to create an entry.');
    }

    // This validates project access and model schema existence
    const schema = getModelSchema(user, projectId, modelId);

    const dir = entryDir(projectId, modelId, entry.id);
    const file = entryFilePath(projectId, modelId, entry.id);

    if (isExistingEntryId(projectId, modelId, entry.id)) {
        throw new Error(`Entry "${entry.id}" already exists in model "${modelId}".`);
    }

    triggerEvent('entry.beforeCreate', { entry, user });
    fs.mkdirSync(dir, { recursive: true });
    writeJson(file, entry);
    triggerEvent('entry.afterCreate', { entry, user });

    return entry;
}

export function updateEntry(
    user: User,
    projectId: string,
    modelId: string,
    entryId: string,
    patch: Partial<Entry>
): Entry {
    if (!entryId || !isValidId(entryId)) {
        throw new Error(`Invalid entry ID: ${entryId}`);
    }
    if (!isExistingEntryId(projectId, modelId, entryId)) {
        throw new Error(
            `Entry "${entryId}" not found in model "${modelId}" of project "${projectId}".`
        );
    }

    const current = getEntry(user, projectId, modelId, entryId);
    const updated = { ...current, ...patch };

    triggerEvent('entry.beforeUpdate', { entry: updated, user });
    writeJson(entryFilePath(projectId, modelId, entryId), updated);
    triggerEvent('entry.afterUpdate', { entry: updated, user });
    return updated;
}

export function deleteEntry(user: User, projectId: string, modelId: string, entryId: string): void {
    const entry = getEntry(user, projectId, modelId, entryId);

    triggerEvent('entry.beforeDelete', { entry, user });

    const trashDir = trashEntryDir(projectId, modelId, entryId);
    fs.mkdirSync(trashDir, { recursive: true });

    const dest = path.join(trashDir, `${entryId}-${Date.now()}.json`);
    fs.renameSync(entryFilePath(projectId, modelId, entryId), dest);

    triggerEvent('entry.afterDelete', { entry, user });
}
