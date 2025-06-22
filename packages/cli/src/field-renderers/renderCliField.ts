import type { Field } from '@moteur/types/Field.js';

type CliFieldRenderer = (field: Field, value?: any) => Promise<any>;

const registry = new Map<string, CliFieldRenderer>();

export function registerCliFieldRenderer(type: string, fn: CliFieldRenderer) {
    registry.set(type, fn);
}

export async function renderCliField(type: string, field: Field, value?: any): Promise<any> {
    const renderer = registry.get(type);
    if (!renderer) {
        console.warn(`No CLI renderer for field type "${type}"`);
        return value ?? null;
    }
    return await renderer(field, value);
}
