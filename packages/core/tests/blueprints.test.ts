import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
    listBlueprints,
    getBlueprint,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint
} from '../src/blueprints.js';
import type { BlueprintSchema } from '@moteur/types/Blueprint.js';

describe('blueprints', () => {
    let tempDir: string;
    let originalBluprintsDir: string | undefined;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'moteur-blueprints-'));
        originalBluprintsDir = process.env.BLUEPRINTS_DIR;
        process.env.BLUEPRINTS_DIR = tempDir;
    });

    afterEach(async () => {
        process.env.BLUEPRINTS_DIR = originalBluprintsDir;
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('listBlueprints', () => {
        it('returns empty array when directory does not exist', () => {
            const list = listBlueprints();
            expect(list).toEqual([]);
        });

        it('returns empty array when directory is empty', async () => {
            await fs.mkdir(tempDir, { recursive: true });
            const list = listBlueprints();
            expect(list).toEqual([]);
        });

        it('returns blueprints from JSON files', async () => {
            const bp: BlueprintSchema = {
                id: 'blog',
                name: 'Blog Site',
                description: 'A blog template'
            };
            await fs.mkdir(tempDir, { recursive: true });
            await fs.writeFile(path.join(tempDir, 'blog.json'), JSON.stringify(bp), 'utf-8');
            const list = listBlueprints();
            expect(list).toHaveLength(1);
            expect(list[0]).toMatchObject({
                id: 'blog',
                name: 'Blog Site',
                description: 'A blog template'
            });
        });

        it('ignores non-JSON files', async () => {
            await fs.mkdir(tempDir, { recursive: true });
            await fs.writeFile(path.join(tempDir, 'readme.txt'), 'hello', 'utf-8');
            const list = listBlueprints();
            expect(list).toEqual([]);
        });
    });

    describe('getBlueprint', () => {
        it('throws for invalid id', () => {
            expect(() => getBlueprint('invalid id!')).toThrow('Invalid blueprint id');
        });

        it('throws when file does not exist', () => {
            expect(() => getBlueprint('missing')).toThrow('not found');
        });

        it('returns blueprint when file exists', async () => {
            const bp: BlueprintSchema = {
                id: 'landing',
                name: 'Landing Page',
                description: 'Simple landing'
            };
            await fs.mkdir(tempDir, { recursive: true });
            await fs.writeFile(path.join(tempDir, 'landing.json'), JSON.stringify(bp), 'utf-8');
            const got = getBlueprint('landing');
            expect(got).toMatchObject({ id: 'landing', name: 'Landing Page' });
        });
    });

    describe('createBlueprint', () => {
        it('throws when id is missing', () => {
            expect(() => createBlueprint({ name: 'Test', id: '' as any })).toThrow(
                'Invalid blueprint id'
            );
        });

        it('throws when id is invalid', () => {
            expect(() => createBlueprint({ id: 'bad id', name: 'Test' })).toThrow(
                'Invalid blueprint id'
            );
        });

        it('writes blueprint file and returns payload', () => {
            const bp: BlueprintSchema = {
                id: 'portfolio',
                name: 'Portfolio',
                description: 'Showcase work'
            };
            const result = createBlueprint(bp);
            expect(result).toMatchObject({ id: 'portfolio', name: 'Portfolio' });
        });

        it('persists blueprint so getBlueprint and listBlueprints see it', () => {
            createBlueprint({ id: 'agency', name: 'Agency', description: 'Agency site' });
            expect(getBlueprint('agency')).toMatchObject({ id: 'agency', name: 'Agency' });
            const list = listBlueprints();
            expect(list.some(b => b.id === 'agency')).toBe(true);
        });
    });

    describe('updateBlueprint', () => {
        it('throws when blueprint does not exist', () => {
            expect(() => updateBlueprint('nonexistent', { name: 'New' })).toThrow('not found');
        });

        it('merges patch and preserves id', () => {
            createBlueprint({ id: 'patch-me', name: 'Old', description: 'Desc' });
            const updated = updateBlueprint('patch-me', { name: 'New Name' });
            expect(updated.id).toBe('patch-me');
            expect(updated.name).toBe('New Name');
            expect(updated.description).toBe('Desc');
        });

        it('persists updated blueprint', () => {
            createBlueprint({ id: 'persist', name: 'A', description: 'B' });
            updateBlueprint('persist', { description: 'Updated desc' });
            const got = getBlueprint('persist');
            expect(got.description).toBe('Updated desc');
        });
    });

    describe('deleteBlueprint', () => {
        it('throws for invalid id', () => {
            expect(() => deleteBlueprint('invalid!')).toThrow('Invalid blueprint id');
        });

        it('removes file when it exists', () => {
            createBlueprint({ id: 'to-delete', name: 'Delete Me' });
            deleteBlueprint('to-delete');
            expect(() => getBlueprint('to-delete')).toThrow('not found');
        });

        it('does not throw when file does not exist', () => {
            expect(() => deleteBlueprint('already-gone')).not.toThrow();
        });
    });
});
