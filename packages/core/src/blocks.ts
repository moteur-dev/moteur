import fs from 'fs';
import path from 'path';
import { BlockSchema } from '@moteur/types/Block';
//import { htmlRenderer } from '@/renderers/html/htmlBlockRenderer';
import { isValidId } from './utils/idUtils';
import { isExistingProjectId } from './utils/fileUtils';
import { normalizeType } from './utils/normalizeType';

/*const rendererMap: Record<string, any> = {
    html: htmlRenderer
};*/

export function listBlocks(projectId?: string): Record<string, BlockSchema> {
    const registry: Record<string, BlockSchema> = {};
    const namespaces = ['core'];

    console.log(`Loading blocks for project: ${projectId || 'all'}`);

    for (const namespace of namespaces) {
        const root = path.resolve(`data/${namespace}/blocks`);

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
