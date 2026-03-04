export interface StorageAdapter {
    get(key: string): Promise<Buffer | null>;

    put(key: string, data: Buffer, options?: Record<string, any>): Promise<void>;

    delete(key: string): Promise<void>;

    list(prefix?: string): Promise<string[]>;

    prepare(projectId: string): Promise<void>;
}

export interface LocalStorageOptions {
    baseDir: string;
    prefix?: string;
    listMode?: 'directory' | 'file';
}

export interface S3StorageOptions {
    bucket: string;
    region: string;
    prefix?: string;
    credentials?: Record<string, unknown>;
}

export type StorageOptions = LocalStorageOptions | S3StorageOptions;

export function isLocalStorageOptions(options: StorageOptions): options is LocalStorageOptions {
    return typeof (options as LocalStorageOptions).baseDir === 'string';
}

export function isS3StorageOptions(options: StorageOptions): options is S3StorageOptions {
    const o = options as S3StorageOptions;
    return typeof o.bucket === 'string' && typeof o.region === 'string';
}
