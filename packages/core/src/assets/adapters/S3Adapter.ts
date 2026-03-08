import type { StorageAdapter, UploadResult } from '../StorageAdapter.js';

export interface S3AdapterConfig {
    bucket: string;
    region: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    publicUrl?: string;
}

function getS3Client(_config: S3AdapterConfig): any {
    try {
        const {
            S3Client,
            PutObjectCommand,
            GetObjectCommand,
            DeleteObjectCommand
        } = require('@aws-sdk/client-s3');
        return { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand };
    } catch {
        throw new Error(
            '[moteur] S3 asset adapter requires @aws-sdk/client-s3 — run: npm install @aws-sdk/client-s3'
        );
    }
}

/**
 * S3 asset storage. Path format: projects/{projectId}/assets/{variantKey}/{filename}
 */
export class S3Adapter implements StorageAdapter {
    id = 's3';
    label = 'Amazon S3';
    private client: any;
    private bucket: string;
    private publicUrl: string | null;
    private PutObjectCommand: any;
    private GetObjectCommand: any;
    private DeleteObjectCommand: any;

    constructor(config: S3AdapterConfig) {
        const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } =
            getS3Client(config);
        this.PutObjectCommand = PutObjectCommand;
        this.GetObjectCommand = GetObjectCommand;
        this.DeleteObjectCommand = DeleteObjectCommand;
        this.bucket = config.bucket;
        this.publicUrl = config.publicUrl?.replace(/\/$/, '') ?? null;
        this.client = new S3Client({
            region: config.region,
            credentials:
                config.accessKeyId && config.secretAccessKey
                    ? { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
                    : undefined
        });
    }

    private key(projectId: string, variantKey: string, filename: string): string {
        return `projects/${projectId}/assets/${variantKey}/${filename}`;
    }

    async upload(
        projectId: string,
        filename: string,
        buffer: Buffer,
        mimeType: string,
        variantKey = 'original'
    ): Promise<UploadResult> {
        const key = this.key(projectId, variantKey, filename);
        await this.client.send(
            new this.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType
            })
        );
        const path = `${projectId}/${variantKey}/${filename}`;
        const url = this.publicUrl ? `${this.publicUrl}/${key}` : path;
        return { path, url, size: buffer.length };
    }

    async download(storedPath: string): Promise<Buffer> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        const key = this.key(projectId, variantKey, filename);
        const response = await this.client.send(
            new this.GetObjectCommand({ Bucket: this.bucket, Key: key })
        );
        const chunks: Uint8Array[] = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async delete(storedPath: string): Promise<void> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        const key = this.key(projectId, variantKey, filename);
        await this.client.send(new this.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }

    async getUrl(storedPath: string): Promise<string> {
        const [projectId, variantKey, ...rest] = storedPath.split('/');
        const filename = rest.join('/');
        const key = this.key(projectId, variantKey, filename);
        if (this.publicUrl) return `${this.publicUrl}/${key}`;
        return key;
    }
}
