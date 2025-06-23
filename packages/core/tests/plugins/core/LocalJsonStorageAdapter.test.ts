// tests/plugins/LocalJsonStorageAdapter.test.ts
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { LocalJsonStorageAdapter } from '../../../src/plugins/LocalJsonStorageAdapter.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('LocalJsonStorageAdapter', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'moteur-test-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('listMode: directory', () => {
        let adapter: LocalJsonStorageAdapter;

        beforeEach(() => {
            adapter = new LocalJsonStorageAdapter({
                baseDir: tempDir,
                listMode: 'directory'
            });
        });

        it('should write and read data', async () => {
            const key = 'test.json';
            const content = Buffer.from(JSON.stringify({ foo: 'bar' }));
            await adapter.put(key, content);

            const retrieved = await adapter.get(key);
            expect(retrieved?.toString()).toBe(content.toString());
        });

        it('should list correct keys', async () => {
            const key1 = 'a.json';
            const key2 = 'b.json';
            await adapter.put(key1, Buffer.from('{}'));
            await adapter.put(key2, Buffer.from('{}'));

            const keys = await adapter.list();
            expect(keys.sort()).toEqual([key1, key2].sort());
        });

        it('should delete a file', async () => {
            const key = 'to-delete.json';
            await adapter.put(key, Buffer.from('{}'));
            await adapter.delete(key);

            const result = await adapter.get(key);
            expect(result).toBeNull();
        });

        it('should create project directory on prepare()', async () => {
            const projectId = 'new-project';
            const projectPath = path.join(tempDir, adapter['prefix'], projectId);

            await adapter.prepare(projectId);

            const stat = await fs.stat(projectPath);
            expect(stat.isDirectory()).toBe(true);
        });
    });

    describe('listMode: file', () => {
        let adapter: LocalJsonStorageAdapter;
        let fileKey: string;

        beforeEach(() => {
            adapter = new LocalJsonStorageAdapter({
                baseDir: tempDir,
                listMode: 'file'
            });
            fileKey = 'entries.json';
        });

        it('should list keys in a single JSON file (array)', async () => {
            const entries = [{ id: 1 }, { id: 2 }];
            const fullPath = path.join(tempDir, fileKey);
            await fs.writeFile(fullPath, JSON.stringify(entries));

            const keys = await adapter.list('entries');
            expect(keys).toEqual(['0', '1']);
        });

        it('should list keys in a single JSON file (object)', async () => {
            const entries = { a: { id: 1 }, b: { id: 2 } };
            const fullPath = path.join(tempDir, fileKey);
            await fs.writeFile(fullPath, JSON.stringify(entries));

            const keys = await adapter.list('entries');
            expect(keys.sort()).toEqual(['a', 'b']);
        });

        it('should read the entire file as Buffer for get()', async () => {
            const entries = [{ id: 1 }, { id: 2 }];
            const fullPath = path.join(tempDir, fileKey);
            await fs.writeFile(fullPath, JSON.stringify(entries));

            const data = await adapter.get('entries.json');
            expect(data?.toString()).toBe(JSON.stringify(entries));
        });

        it('should write the entire file as Buffer for put()', async () => {
            const newEntries = [{ id: 3 }];
            const fullPath = path.join(tempDir, fileKey);

            await adapter.put('entries.json', Buffer.from(JSON.stringify(newEntries)));
            const data = await fs.readFile(fullPath, 'utf-8');

            expect(JSON.parse(data)).toEqual(newEntries);
        });
    });
});
