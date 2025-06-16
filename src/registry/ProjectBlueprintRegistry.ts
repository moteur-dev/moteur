import fs from 'fs';
import path from 'path';
import { ProjectBlueprint } from '../types/Blueprint';

export class ProjectBlueprintRegistry {
    private blueprints: Record<string, ProjectBlueprint>;

    constructor() {
        this.blueprints = this.loadProjectBlueprints();
    }

    get(id: string): ProjectBlueprint {
        const blueprint = this.blueprints[id];
        if (!blueprint) {
            throw new Error(`Project blueprint "${id}" not found.`);
        }
        return blueprint;
    }

    has(id: string): boolean {
        return !!this.blueprints[id];
    }

    list(): Record<string, ProjectBlueprint> {
        return this.blueprints;
    }

    private loadProjectBlueprints(): Record<string, ProjectBlueprint> {
        const root = 'data/blueprints/projects';
        const entries = fs.readdirSync(root, { withFileTypes: true });
        const blueprints: Record<string, ProjectBlueprint> = {};

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const id = entry.name;
            const blueprintPath = path.join(root, id, 'blueprint.json');
            if (!fs.existsSync(blueprintPath)) continue;

            const raw = fs.readFileSync(blueprintPath, 'utf-8');
            const parsed = JSON.parse(raw);

            blueprints[id] = {
                id,
                type: parsed.type || 'project',
                label: parsed.label || id,
                description: parsed.description,
                path: path.join(root, id),
                models: parsed.models || [],
                layouts: parsed.layouts || [],
                templates: parsed.templates || [],
                structures: parsed.structures || [],
                entries: parsed.entries || []
            };
        }

        return blueprints;
    }
}
