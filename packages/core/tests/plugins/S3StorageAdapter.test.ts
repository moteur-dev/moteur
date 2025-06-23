// tests/plugins/S3StorageAdapter.test.ts

import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { S3StorageAdapter } from '../../plugins/S3StorageAdapter.js';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'stream';

describe('S3StorageAdapter', () => {
    const s3Mock = mockClient(S3Client);
    const bucket = 'test-bucket';
    let adapter: S3StorageAdapter;

    beforeEach(() => {
        s3Mock.reset();
        adapter = new S3StorageAdapter({
            bucket,
            region: 'us-east-1',
            prefix: 'entries/'
        });
    });

    it('should upload data', async () => {
        s3Mock.on(PutObjectCommand).resolves({});
        await adapter.put('test.json', Buffer.from('{"foo":"bar"}'));
        expect(s3Mock.commandCalls(PutObjectCommand).length).toBe(1);
    });

    it('should retrieve data', async () => {
        const stream = Readable.from([Buffer.from('{"foo":"bar"}')]);
        s3Mock.on(GetObjectCommand).resolves({
            Body: stream
        });
        const data = await adapter.get('test.json');
        expect(data?.toString()).toBe('{"foo":"bar"}');
    });

    it('should return null for missing objects', async () => {
        const error = Object.assign(new Error('NotFound'), {
            $metadata: { httpStatusCode: 404 }
        });
        s3Mock.on(GetObjectCommand).rejects(error);

        const data = await adapter.get('missing.json');
        expect(data).toBeNull();
    });

    it('should list keys', async () => {
        s3Mock.on(ListObjectsV2Command).resolves({
            Contents: [{ Key: 'entries/test1.json' }, { Key: 'entries/test2.json' }]
        });
        const keys = await adapter.list();
        expect(keys.sort()).toEqual(['test1.json', 'test2.json'].sort());
    });

    it('should delete an object', async () => {
        s3Mock.on(DeleteObjectCommand).resolves({});
        await adapter.delete('test.json');
        expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);
    });

    it('should create bucket if not exists during prepare()', async () => {
        const notFoundError = Object.assign(new Error('NotFound'), {
            $metadata: { httpStatusCode: 404 }
        });

        s3Mock.on(HeadBucketCommand).rejects(notFoundError);
        s3Mock.on(CreateBucketCommand).resolves({});

        await adapter.prepare('my-project');
        expect(s3Mock.commandCalls(CreateBucketCommand).length).toBe(1);
    });

    it('should skip bucket creation if bucket exists during prepare()', async () => {
        s3Mock.on(HeadBucketCommand).resolves({});

        await adapter.prepare('my-project');
        expect(s3Mock.commandCalls(CreateBucketCommand).length).toBe(0);
    });
});
