import fs from 'fs';
import path from 'path';
import { Blueprint } from '../types/Blueprint';

export class BlueprintRegistry {
  private blueprints: Record<string, Blueprint>;

  constructor() {
    this.blueprints = this.loadBlueprints();
  }

  get(id: string): Blueprint {
    const blueprint = this.blueprints[id] || this.blueprints[`core/${id}`];
    if (!blueprint) {
      throw new Error(`Blueprint "${id}" not found in registry.`);
    }
    return blueprint;
  }

  has(id: string): boolean {
    return !!this.blueprints[id] || !!this.blueprints[`core/${id}`];
  }

  list(): Record<string, Blueprint> {
    return this.blueprints;
  }

  filterByType(type: Blueprint['type']): Record<string, Blueprint> {
    return Object.fromEntries(
      Object.entries(this.blueprints).filter(([, bp]) => bp.type === type)
    );
  }

  private loadBlueprints(): Record<string, Blueprint> {
    const root = 'plugins/blueprints';
    const entries = fs.readdirSync(root, { withFileTypes: true });
    const blueprints: Record<string, Blueprint> = {};

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
        type: parsed.type || 'model',
        description: parsed.description,
        icon: parsed.icon,
        path: path.join(root, id),
        seedPath: parsed.seedPath ? path.join(root, id, parsed.seedPath) : undefined
      };
    }

    return blueprints;
  }
}
