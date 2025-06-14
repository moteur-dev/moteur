import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config';
import { StructureSchema } from '../types/Structure';
import { readJson, writeJson } from '../utils/fileUtils';
import { loadStructures } from '../loaders/loadStructures';
import { validateStructure } from '../validators/validateStructure';
import { isValidId } from '../utils/idUtils';

/** List all structures for a given project (including global fallbacks) */
export function listStructures(project?: string): Record<string, StructureSchema> {
    return loadStructures(project);
}

/** Get a specific structure (project takes priority if provided) */
export function getStructure(id: string, project?: string): StructureSchema {
    if (!isValidId(id)) {
        throw new Error(`Invalid structureId: "${id}"`);
    }
    if (project && !isValidId(project)) {
        throw new Error(`Invalid projectId: "${project}"`);
    }
    const type = id.endsWith('.json') ? id.replace(/\.json$/, '') : id;
    const all = loadStructures(project);
    const resolved = all[type];
    if (!resolved) {
        throw new Error(`Structure "${id}" not found`);
    }
    return resolved;
}

/** Create a new structure in a given project */
export function createStructure(project: string, schema: StructureSchema): StructureSchema {
    if (!isValidId(project)) {
        throw new Error(`Invalid projectId: "${project}"`);
    }

    const validationResult = validateStructure(schema);
    if (validationResult.issues.length > 0) {
        const errorMessages = validationResult.issues
            .map(issue => `${issue.path}: ${issue.message}`)
            .join(', ');
        throw new Error(`Structure validation failed: ${errorMessages}`);
    }

    const base = path.resolve(moteurConfig.projectRoot ?? 'projects', project, 'structures');
    fs.mkdirSync(base, { recursive: true });

    const file = path.join(base, `${schema.type}.json`);
    if (fs.existsSync(file)) {
        throw new Error(`Structure "${schema.type}" already exists`);
    }

    writeJson(file, schema);
    return schema;
}

/** Update a structure in a project (only project scope is writable) */
export function updateStructure(
    project: string,
    id: string,
    patch: Partial<StructureSchema>
): StructureSchema {
    if (!isValidId(project)) {
        throw new Error(`Invalid projectId: "${project}"`);
    }
    if (!isValidId(id)) {
        throw new Error(`Invalid structureId: "${id}"`);
    }

    const file = path.resolve(
        moteurConfig.projectRoot ?? 'projects',
        project,
        'structures',
        `${id}.json`
    );
    if (!fs.existsSync(file)) {
        throw new Error(`Structure ${id} not found in project ${project}`);
    }

    const current = readJson(file);
    const updated = { ...current, ...patch };

    const validationResult = validateStructure(updated);
    if (validationResult.issues.length > 0) {
        const errorMessages = validationResult.issues
            .map(issue => `${issue.path}: ${issue.message}`)
            .join(', ');
        throw new Error(`Structure validation failed: ${errorMessages}`);
    }

    writeJson(file, updated);
    return updated;
}

/** Soft-delete (trash) a structure in a project */
export function deleteStructure(project: string, id: string): void {
    if (!isValidId(project)) {
        throw new Error(`Invalid projectId: "${project}"`);
    }
    if (!isValidId(id)) {
        throw new Error(`Invalid structureId: "${id}"`);
    }
    const base = moteurConfig.projectRoot ?? 'projects';
    const source = path.join(base, project, 'structures', `${id}.json`);
    const trashDir = path.join(base, project, '.trash', 'structures');
    const dest = path.join(trashDir, `${id}.json`);

    if (!fs.existsSync(source)) {
        throw new Error(`Structure ${id} not found in project ${project}`);
    }
    fs.mkdirSync(trashDir, { recursive: true });
    fs.renameSync(source, dest);
}
