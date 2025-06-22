import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import { StorageAdapter } from '@moteur/types/Storage.js';
import { storageRegistry } from '../registry/StorageRegistry.js';

export interface LocalJsonStorageOptions {
    baseDir: string;
    prefix?: string;
    listMode?: 'directory' | 'file';
}

export class LocalJsonStorageAdapter implements StorageAdapter {
    private baseDir: string;
    private prefix: string;
    private listMode: 'directory' | 'file';

    constructor(options: LocalJsonStorageOptions) {
        this.baseDir = options.baseDir;
        this.prefix = options.prefix ?? '';
        this.listMode = options.listMode ?? 'directory';
    }

    private getFullPath(key: string): string {
        return path.join(this.baseDir, this.prefix, key);
    }

    async get(key: string): Promise<Buffer | null> {
        try {
            const data = await fs.readFile(this.getFullPath(key));
            return data;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async put(key: string, data: Buffer): Promise<void> {
        const fullPath = this.getFullPath(key);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, data);
    }

    async delete(key: string): Promise<void> {
        try {
            await fs.unlink(this.getFullPath(key));
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // Ignore if file doesn't exist
        }
    }

    async list(prefix?: string): Promise<string[]> {
        const basePath = path.join(this.baseDir, this.prefix, prefix ?? '');
        const possibleFile = basePath.endsWith('.json') ? basePath : `${basePath}.json`;

        // Determine if we should use single-file mode
        let useFileMode = this.listMode === 'file';
        try {
            await fs.access(possibleFile, fsConstants.F_OK);
            useFileMode = true;
        } catch {
            // file doesn't exist — fall back to directory if in directory mode
        }

        if (useFileMode) {
            // Single-file JSON mode
            try {
                const data = await fs.readFile(possibleFile, 'utf-8');
                const json = JSON.parse(data);

                if (Array.isArray(json)) {
                    return json.map((_, idx) => `${idx}`);
                } else if (json && typeof json === 'object') {
                    return Object.keys(json);
                }
                return [];
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    return [];
                }
                throw error;
            }
        }

        // Directory-based mode
        try {
            const files = await fs.readdir(basePath);
            return files.filter(file => file.endsWith('.json'));
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async prepare(projectId: string): Promise<void> {
        const projectPath = path.join(this.baseDir, this.prefix, projectId);
        await fs.mkdir(projectPath, { recursive: true });
    }
}

// Self-register on import
storageRegistry.register('local', LocalJsonStorageAdapter);
