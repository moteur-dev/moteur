import inquirer from 'inquirer';

/**
 * Minimal CLI field renderer: prompts for a value based on field type and schema.
 * Used when editing model schemas, project settings, block fields, and entry data.
 * Returns either a primitive value or a Field object when building a field definition.
 */
export async function renderCliField(
    fieldType: string,
    fieldSchema: { type?: string; label?: string; id?: string; [key: string]: unknown },
    currentValue?: unknown
): Promise<any> {
    const label = fieldSchema.label ?? fieldSchema.id ?? 'Value';
    const message = `${label}${currentValue !== undefined ? ` (current: ${String(currentValue)})` : ''}:`;

    // Building a field definition (editModelSchemaFields): schema has type + id/label
    if (fieldSchema.type && (fieldSchema.id !== undefined || fieldSchema.label !== undefined)) {
        const isFieldDef =
            typeof fieldSchema.id === 'string' || typeof fieldSchema.label === 'string';
        if (isFieldDef) {
            const { description } = await inquirer.prompt<{ description: string }>([
                {
                    type: 'input',
                    name: 'description',
                    message: 'Description (optional):',
                    default: (fieldSchema.description as string) ?? ''
                }
            ]);
            return {
                ...fieldSchema,
                type: fieldType,
                id: fieldSchema.id,
                label: fieldSchema.label ?? fieldSchema.id,
                ...(description !== undefined && description !== '' ? { description } : {})
            };
        }
    }

    // Primitive value by type
    switch (fieldType) {
        case 'core/boolean':
        case 'boolean': {
            const { value } = await inquirer.prompt<{ value: boolean }>([
                {
                    type: 'confirm',
                    name: 'value',
                    message,
                    default: typeof currentValue === 'boolean' ? currentValue : false
                }
            ]);
            return value;
        }
        case 'core/number':
        case 'number': {
            const { value } = await inquirer.prompt<{ value: string }>([
                {
                    type: 'input',
                    name: 'value',
                    message,
                    default: currentValue != null ? String(currentValue) : undefined
                }
            ]);
            const n = Number(value);
            return Number.isNaN(n) ? value : n;
        }
        default: {
            const { value } = await inquirer.prompt<{ value: string }>([
                {
                    type: 'input',
                    name: 'value',
                    message,
                    default: currentValue != null ? String(currentValue) : undefined
                }
            ]);
            return value;
        }
    }
}
