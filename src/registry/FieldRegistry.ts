import { loadFields } from '../loaders/loadFields';
import { FieldSchema } from '../types/Field';

export class FieldRegistry {
    private fieldTypes: Record<string, FieldSchema>;

    constructor() {
        this.fieldTypes = loadFields();
    }

    get(type: string): FieldSchema {
        const fieldSchema = this.fieldTypes[type] || this.fieldTypes[`core/${type}`];
        if (!fieldSchema) {
            throw new Error(`Field type "${type}" not found in registry.`);
        }
        return this.fieldTypes[type] || this.fieldTypes[`core/${type}`];
    }

    has(type: string): boolean {
        return !!this.get(type);
    }

    all(): Record<string, FieldSchema> {
        return this.fieldTypes;
    }
}
