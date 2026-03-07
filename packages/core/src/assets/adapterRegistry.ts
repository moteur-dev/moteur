import type { ProjectSchema } from '@moteur/types/Project.js';
import type { StorageAdapter } from './StorageAdapter.js';

const adapters = new Map<string, StorageAdapter>();

export function registerAdapter(adapter: StorageAdapter): void {
    adapters.set(adapter.id, adapter);
}

export function getAdapter(id: string): StorageAdapter | null {
    return adapters.get(id) ?? null;
}

export function getProjectAdapter(project: ProjectSchema): StorageAdapter {
    const id = project.assetConfig?.adapter ?? 'local';
    const config = project.assetConfig?.adapterConfig;
    if (id === 's3' && config) {
        try {
            const { S3Adapter } = require('./adapters/S3Adapter.js');
            return new S3Adapter(config);
        } catch (e) {
            throw new Error(
                (e as Error)?.message ??
                    '[moteur] S3 adapter not available. Install @aws-sdk/client-s3.'
            );
        }
    }
    if (id === 'r2' && config) {
        try {
            const { R2Adapter } = require('./adapters/R2Adapter.js');
            return new R2Adapter(config);
        } catch (e) {
            throw new Error(
                (e as Error)?.message ??
                    '[moteur] R2 adapter not available. Install @aws-sdk/client-s3.'
            );
        }
    }
    const adapter = getAdapter(id);
    if (!adapter) {
        throw new Error(`[moteur] Asset storage adapter "${id}" not found.`);
    }
    return adapter;
}
