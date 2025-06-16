import fs from 'fs';
import path from 'path';
import { ModelBlueprint } from '../types/Blueprint';

export class ModelBlueprintRegistry {
    private blueprints: Record<string, ModelBlueprint>;

    constructor() {
        this.blueprints = this.loadModelBlueprints();
    }

    get(id: string): ModelBlueprint {
        const blueprint = this.blueprints[id] || this.blueprints[`core/${id}`];
        if (!blueprint) {
            throw new Error(`Model blueprint "${id}" not found.`);
        }
        return blueprint;
    }

    has(id: string): boolean {
        return !!this.blueprints[id] || !!this.blueprints[`core/${id}`];
    }

    list(): Record<string, ModelBlueprint> {
        return this.blueprints;
    }

    private loadModelBlueprints(): Record<string, ModelBlueprint> {
        const root = 'data/blueprints/models';
        const entries = fs.readdirSync(root, { withFileTypes: true });
        const blueprints: Record<string, ModelBlueprint> = {};

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const id = entry.name;
            const blueprintPath = path.join(root, id, 'blueprint.json');
            if (!fs.existsSync(blueprintPath)) continue;

            const raw = fs.readFileSync(blueprintPath, 'utf-8');
            const parsed = JSON.parse(raw);

            blueprints[id] = {
                id,
                type: parsed.type || 'model',
                label: parsed.label || id,
                description: parsed.description,
                //icon: parsed.icon,
                path: path.join(root, id),
                seedPath: parsed.seedPath ? path.join(root, id, parsed.seedPath) : undefined
            };
        }

        return blueprints;
    }
}
