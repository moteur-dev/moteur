import {
    StorageAdapter,
    StorageOptions,
    LocalStorageOptions,
    S3StorageOptions,
    isLocalStorageOptions,
    isS3StorageOptions
} from '@moteur/types/Storage.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- adapters take specific option types; we validate before create
type AdapterFactory = new (options: any) => StorageAdapter;

function validateLocalOptions(options: LocalStorageOptions): void {
    if (!options.baseDir || typeof options.baseDir !== 'string') {
        throw new Error('Storage adapter "local" requires a non-empty baseDir.');
    }
}

function validateS3Options(options: S3StorageOptions): void {
    if (!options.bucket || typeof options.bucket !== 'string') {
        throw new Error('Storage adapter "s3" requires a non-empty bucket.');
    }
    if (!options.region || typeof options.region !== 'string') {
        throw new Error('Storage adapter "s3" requires a non-empty region.');
    }
}

export class StorageRegistry {
    private adapters: Record<string, AdapterFactory> = {};

    register(id: string, adapterClass: AdapterFactory): void {
        this.adapters[id] = adapterClass;
    }

    get(id: string): AdapterFactory {
        const adapterClass = this.adapters[id] || this.adapters[`core/${id}`];
        if (!adapterClass) {
            throw new Error(`Storage adapter "${id}" not found in registry.`);
        }
        return adapterClass;
    }

    has(id: string): boolean {
        return !!this.adapters[id] || !!this.adapters[`core/${id}`];
    }

    list(): string[] {
        return Object.keys(this.adapters);
    }

    all(): Record<string, AdapterFactory> {
        return this.adapters;
    }

    create(id: string, options: StorageOptions): StorageAdapter {
        if (isLocalStorageOptions(options)) {
            validateLocalOptions(options);
        } else if (isS3StorageOptions(options)) {
            validateS3Options(options);
        }
        const AdapterClass = this.get(id);
        return new AdapterClass(options);
    }
}

// Singleton instance
export const storageRegistry = new StorageRegistry();
