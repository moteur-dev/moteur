import fs from 'fs';
import path from 'path';
import { BlockSchema } from '../types/Block';
import { normalizeType } from '../utils/normalizeType';
import { moteurConfig } from '../../moteur.config';

export function loadFields(): Record<string, BlockSchema> {
    const registry: Record<string, BlockSchema> = {};

    for (const namespace of moteurConfig.namespaces) {
        const root = path.resolve(`data/${namespace}/fields`);

        if (!fs.existsSync(root)) {
            console.warn(`Fields directory not found for namespace: ${namespace}`);
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
