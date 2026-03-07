import fs from 'fs';
import path from 'path';
import { BlockSchema } from '@moteur/types/Block.js';
import { storageConfig } from './config/storageConfig.js';
import { isValidId } from './utils/idUtils.js';
import { isExistingProjectId } from './utils/fileUtils.js';
import { normalizeType } from './utils/normalizeType.js';

/*const rendererMap: Record<string, any> = {
    html: htmlRenderer
};*/

export function listBlocks(projectId?: string): Record<string, BlockSchema> {
    const registry: Record<string, BlockSchema> = {};
    const namespaces = ['core'];

    console.log(`Loading blocks for project: ${projectId || 'all'}`);

    for (const namespace of namespaces) {
        const root = path.join(storageConfig.dataRoot, 'data', namespace, 'blocks');

        if (!fs.existsSync(root)) {
            console.warn(`Blocks directory not found for namespace: ${namespace}`);
            continue;
        }

        try {
            const files = fs.readdirSync(root).filter(file => file.endsWith('on'));

            for (const file of files) {
                try {
                    const content = fs.readFileSync(path.join(root, file), 'utf-8');
                    const schema = JSON.parse(content) as BlockSchema;

                    if (!schema || !schema.type) {
                        console.warn(`Invalid schema in file: ${file} - ${schema?.type}`);
                        continue;
                    }

                    // Ensure the type is normalized with its namespace
                    const key = `${namespace}/${normalizeType(schema.type)}`;
                    registry[key] = schema;
                } catch (err) {
                    console.error(`Failed to process file: ${file}`, err);
                }
            }
        } catch (err) {
            console.error(`Failed to load blocks from namespace: ${namespace}`, err);
        }
    }

    return registry;
}

export function getBlock(type: string, project?: string): BlockSchema {
    if (project && !isValidId(project)) {
        throw new Error(`Invalid project ID: ${project}`);
    }
    if (project && !isExistingProjectId(project as string)) {
        throw new Error(`Project "${project}" does not exist`);
    }
    const blocks = listBlocks(project);
    if (!blocks[type]) {
        throw new Error(`Block type "${type}" not found`);
    }
    return blocks[type];
}

export function createBlock(schema: BlockSchema): BlockSchema {
    if (!schema || !schema.type) {
        throw new Error('Block schema must have a "type" field');
    }
    const namespace = 'core';
    const slug = schema.type.includes('/') ? schema.type.split('/')[1] : schema.type;
    const safeSlug = slug.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'block';
    const normalizedType = `${namespace}/${safeSlug}`;
    const root = path.join(storageConfig.dataRoot, 'data', namespace, 'blocks');
    if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
    }
    const filePath = path.join(root, `${safeSlug}.json`);
    if (fs.existsSync(filePath)) {
        throw new Error(`Block type "${normalizedType}" already exists`);
    }
    const toWrite = {
        type: normalizedType,
        label: schema.label ?? safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1),
        description: schema.description,
        category: schema.category,
        fields: schema.fields ?? {},
        optionsSchema: schema.optionsSchema,
    };
    fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 4), 'utf-8');
    return toWrite as BlockSchema;
}
