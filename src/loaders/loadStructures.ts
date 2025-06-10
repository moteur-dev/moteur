import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config.js';
import { StructureSchema } from '../types/Structure.js';
import { normalizeType } from '../utils/normalizeType.js';

export function loadStructures(project?: string): Record<string, StructureSchema> {
    const registry: Record<string, StructureSchema> = {};

    for (const ns of moteurConfig.namespaces ?? ['core']) {
        const nsDir = path.resolve('structures', ns);
        loadFromDir(nsDir, registry);
    }

    if (project) {
        const projectDir = path.resolve(
            moteurConfig.projectRoot ?? 'projects',
            project,
            'structures'
        );
        loadFromDir(projectDir, registry);
    }

    return registry;
}

function loadFromDir(dirPath: string, registry: Record<string, StructureSchema>) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
        try {
            const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
            const schema = JSON.parse(raw) as StructureSchema;

            if (!schema.type) {
                console.warn(`[Moteur] Skipping invalid structure: ${file}`);
                continue;
            }

            registry[normalizeType(schema.type)] = schema;
        } catch (err) {
            console.error(`[Moteur] Failed to load structure ${file}`, err);
        }
    }
}
