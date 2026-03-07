import fs from 'fs';
import path from 'path';
import { baseAssetsDir } from '../../utils/pathUtils.js';
import type { StorageAdapter, UploadResult } from '../StorageAdapter.js';

const DEFAULT_BASE_URL = process.env.STATIC_ASSETS_BASE_URL || 'http://localhost:3000';

export interface LocalAdapterOptions {
    baseUrl?: string;
}

/**
 * Local disk asset storage. Originals: assets/original/{id}-{filename}.
 * Variants: assets/{variantKey}/{id}.{ext}.
 * URLs are served via GET /static/assets/:projectId/:variantKey/:filename
 */
export class LocalAdapter implements StorageAdapter {
    id = 'local';
    label = 'Local disk';
    private baseUrl: string;

    constructor(options: LocalAdapterOptions = {}) {
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    }

    async upload(
        projectId: string,
        filename: string,
        buffer: Buffer,
        _mimeType: string,
        variantKey = 'original'
    ): Promise<UploadResult> {
        const dir = path.join(baseAssetsDir(projectId), variantKey);
        fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, filename);
        fs.writeFileSync(filePath, buffer);
        const storedPath = `${projectId}/${variantKey}/${filename}`;
        const url = `${this.baseUrl}/static/assets/${projectId}/${variantKey}/${filename}`;
        return { path: storedPath, url, size: buffer.length };
    }

    async download(storedPath: string): Promise<Buffer> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        const filePath = path.join(baseAssetsDir(projectId), variantKey, filename);
        return fs.promises.readFile(filePath);
    }

    async delete(storedPath: string): Promise<void> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        const filePath = path.join(baseAssetsDir(projectId), variantKey, filename);
        try {
            await fs.promises.unlink(filePath);
        } catch (err: any) {
            if (err?.code !== 'ENOENT') throw err;
        }
    }

    async getUrl(storedPath: string): Promise<string> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        return `${this.baseUrl}/static/assets/${projectId}/${variantKey}/${filename}`;
    }
}
