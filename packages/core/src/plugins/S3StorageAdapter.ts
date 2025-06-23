/*import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3';*/
import { StorageAdapter } from '@moteur/types/Storage';
import { storageRegistry } from '../registry/StorageRegistry';
import { Readable } from 'stream';

export interface S3StorageOptions {
    bucket: string;
    region: string;
    credentials?: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    prefix?: string; // Optional: e.g., 'entries/', 'layouts/'
}

export class S3StorageAdapter implements StorageAdapter {
    //private s3: S3Client;
    private bucket: string;
    private prefix: string;

    constructor(options: S3StorageOptions) {
        /*this.s3 = new S3Client({
            region: options.region,
            credentials: options.credentials
        });*/
        this.bucket = options.bucket;
        this.prefix = options.prefix ?? '';
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    async get(key: string): Promise<Buffer | null> {
        return null;
        /*try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: this.getKey(key)
            });
            const response = await this.s3.send(command);

            if (!response.Body) {
                return null;
            }

            const stream = response.Body as Readable;
            const chunks: Uint8Array[] = [];
            for await (const chunk of stream) {
                chunks.push(chunk as Uint8Array);
            }

            return Buffer.concat(chunks);
        } catch (error: any) {
            // Prefer HTTP 404 check for missing objects
            if (error.$metadata?.httpStatusCode === 404) {
                return null;
            }

            // Legacy / alternate checks
            if (
                error.name === 'NoSuchKey' ||
                error.Code === 'NoSuchKey' ||
                error.message?.includes('NoSuchKey')
            ) {
                return null;
            }

            // Re-throw for other unexpected errors
            throw error;
        }*/
    }

    async put(key: string, data: Buffer, options?: Record<string, any>): Promise<void> {
        return; /*
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: this.getKey(key),
            Body: data,
            ...options // S3-specific options: e.g., ContentType, Metadata
        });
        await this.s3.send(command);*/
    }

    async delete(key: string): Promise<void> {
        return; /*
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: this.getKey(key)
        });
        await this.s3.send(command);*/
    }

    async list(prefix?: string): Promise<string[]> {
        return []; /*
        const fullPrefix = this.getKey(prefix ?? '');
        const command = new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: fullPrefix
        });
        const response = await this.s3.send(command);

        // Strip global prefix from keys for return consistency
        const keys =
            response.Contents?.map(obj => (obj.Key ? obj.Key.replace(this.prefix, '') : '')).filter(
                key => key !== ''
            ) ?? [];

        return keys;*/
    }

    async prepare(projectId: string): Promise<void> {
        return; /*
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
        } catch (err: any) {
            if (err.$metadata?.httpStatusCode === 404) {
                // Bucket doesn't exist: create it
                await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
            } else {
                throw err;
            }
        }

        // Optional: create a placeholder object for the project directory
        if (this.prefix) {
            const testKey = `${this.prefix}${projectId}/.init`;
            await this.put(testKey, Buffer.from(''));
        }*/
    }
}

// Self-register on import
storageRegistry.register('s3', S3StorageAdapter);
