import fs from 'fs/promises';
import path from 'path';
import { StorageAdapter } from '../types/Storage';
import { storageRegistry } from '../registry/StorageRegistry';

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
        const targetDir = path.join(this.baseDir, this.prefix, prefix ?? '');
        try {
            if (this.listMode === 'directory') {
                const files = await fs.readdir(targetDir);
                return files.filter(file => file.endsWith('on'));
            } else if (this.listMode === 'file') {
                const fullPath = targetDir.endsWith('on') ? targetDir : `${targetDir}on`;
                const data = await fs.readFile(fullPath, 'utf-8');
                const json = JSON.parse(data);
                if (Array.isArray(json)) {
                    return json.map((_, idx) => `${idx}`);
                } else if (typeof json === 'object') {
                    return Object.keys(json);
                }
                return [];
            }
            return [];
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
