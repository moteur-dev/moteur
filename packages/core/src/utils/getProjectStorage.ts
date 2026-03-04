import type { LocalStorageOptions, StorageOptions } from '@moteur/types/Storage.js';
import { storageRegistry } from '../registry/StorageRegistry.js';
import { readFileSync } from 'fs';
import { projectFilePath, projectDir } from './pathUtils.js';

// Ensure local storage adapter is registered (API and CLI use core subpaths and may never load core index)
import '../plugins/LocalJsonStorageAdapter.js';

const defaultLocalOptions = (projectId: string): LocalStorageOptions => ({
    baseDir: projectDir(projectId),
    listMode: 'directory'
});

export function getProjectStorage(projectId: string) {
    const projectPath = projectFilePath(projectId);

    let projectConfig: { storage?: string; storageOptions?: StorageOptions };
    try {
        const data = readFileSync(projectPath, 'utf-8');
        projectConfig = JSON.parse(data) as { storage?: string; storageOptions?: StorageOptions };
    } catch (_err) {
        return storageRegistry.create('local', defaultLocalOptions(projectId));
    }

    const storageId = projectConfig.storage || 'local';
    const storageOptions: StorageOptions = projectConfig.storageOptions ?? defaultLocalOptions(projectId);

    return storageRegistry.create(storageId, storageOptions);
}
