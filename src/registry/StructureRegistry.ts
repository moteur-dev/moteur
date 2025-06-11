import { loadStructures } from '../loaders/loadStructures';
import { StructureSchema } from '../types/Structure';

export class StructureRegistry {
    private structures: Record<string, StructureSchema>;

    constructor() {
        this.structures = loadStructures();
    }

    get(type: string): StructureSchema | undefined {
        return this.structures[type];
    }

    has(type: string): boolean {
        return !!this.get(type);
    }

    all(): Record<string, StructureSchema> {
        return this.structures;
    }
}
