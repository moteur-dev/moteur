import fs from 'fs';
import path from 'path';
import { BlueprintSchema } from '@moteur/types/Blueprint.js';
import type { User } from '@moteur/types/User.js';
import { isValidId } from './utils/idUtils.js';
import { storageConfig } from './config/storageConfig.js';
import { writeJson } from './utils/fileUtils.js';
import { triggerEvent } from './utils/eventBus.js';

function systemUser(): User {
    return { id: 'system', name: 'System', isActive: true, email: '', roles: [], projects: [] };
}

function blueprintFilePath(id: string): string {
    return path.join(storageConfig.blueprintsDir, `${id}.json`);
}

/**
 * List all blueprints (reads from the blueprints directory).
 * Each file &lt;id&gt;.json is one blueprint.
 */
export function listBlueprints(): BlueprintSchema[] {
    const dir = storageConfig.blueprintsDir;
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const id = f.replace(/\.json$/, '');
            try {
                const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
                const schema = JSON.parse(raw) as BlueprintSchema;
                return { ...schema, id };
            } catch (err) {
                console.error(`[Moteur] Failed to load blueprint "${id}"`, err);
                return null;
            }
        })
        .filter((p): p is BlueprintSchema => p !== null);
}

/**
 * Get a single blueprint by id.
 */
export function getBlueprint(id: string): BlueprintSchema {
    if (!isValidId(id)) {
        throw new Error(`Invalid blueprint id: "${id}"`);
    }
    const filePath = blueprintFilePath(id);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Blueprint "${id}" not found`);
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const schema = JSON.parse(raw) as BlueprintSchema;
    return { ...schema, id };
}

/**
 * Create or overwrite a blueprint. Id must be valid; file is written to blueprintsDir/&lt;id&gt;.json.
 */
export function createBlueprint(blueprint: BlueprintSchema, performedBy?: User): BlueprintSchema {
    if (!blueprint?.id || !isValidId(blueprint.id)) {
        throw new Error(`Invalid blueprint id: "${blueprint?.id}"`);
    }
    const dir = storageConfig.blueprintsDir;
    fs.mkdirSync(dir, { recursive: true });
    const payload = { ...blueprint, id: blueprint.id };
    writeJson(blueprintFilePath(blueprint.id), payload);
    triggerEvent('blueprint.afterCreate', {
        blueprint: payload,
        user: performedBy ?? systemUser()
    });
    return payload;
}

/**
 * Update an existing blueprint (partial patch). Fails if the blueprint does not exist.
 */
export function updateBlueprint(
    id: string,
    patch: Partial<Omit<BlueprintSchema, 'id'>>,
    performedBy?: User
): BlueprintSchema {
    const current = getBlueprint(id);
    const updated: BlueprintSchema = { ...current, ...patch, id };
    writeJson(blueprintFilePath(id), updated);
    triggerEvent('blueprint.afterUpdate', {
        blueprint: updated,
        user: performedBy ?? systemUser()
    });
    return updated;
}

/**
 * Delete a blueprint file. No-op if the file does not exist.
 */
export function deleteBlueprint(id: string, performedBy?: User): void {
    if (!isValidId(id)) {
        throw new Error(`Invalid blueprint id: "${id}"`);
    }
    const filePath = blueprintFilePath(id);
    if (fs.existsSync(filePath)) {
        const current = getBlueprint(id);
        fs.unlinkSync(filePath);
        triggerEvent('blueprint.afterDelete', {
            blueprint: current,
            user: performedBy ?? systemUser()
        });
    }
}
