import fs from 'fs';
import path from 'path';
import { LayoutBlueprint } from '../types/Blueprint';

export class LayoutBlueprintRegistry {
    private blueprints: Record<string, LayoutBlueprint>;

    constructor() {
        this.blueprints = this.loadLayoutBlueprints();
    }

    get(id: string): LayoutBlueprint {
        const blueprint = this.blueprints[id] || this.blueprints[`core/${id}`];
        if (!blueprint) {
            throw new Error(`Layout blueprint "${id}" not found.`);
        }
        return blueprint;
    }

    has(id: string): boolean {
        return !!this.blueprints[id] || !!this.blueprints[`core/${id}`];
    }

    list(): Record<string, LayoutBlueprint> {
        return this.blueprints;
    }

    private loadLayoutBlueprints(): Record<string, LayoutBlueprint> {
        const root = 'data/blueprints/layouts';
        const entries = fs.readdirSync(root, { withFileTypes: true });
        const blueprints: Record<string, LayoutBlueprint> = {};

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const id = entry.name;
            const blueprintPath = path.join(root, id, 'blueprint.json');
            if (!fs.existsSync(blueprintPath)) continue;

            const raw = fs.readFileSync(blueprintPath, 'utf-8');
            const parsed = JSON.parse(raw);

            blueprints[id] = {
                id,
                label: parsed.label || id,
                description: parsed.description,
                //icon: parsed.icon,
                type: 'layout',
                path: path.join(root, id),
                layoutPath: parsed.layoutPath || 'layout.json'
            };
        }

        return blueprints;
    }
}
