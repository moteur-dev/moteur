import inquirer from 'inquirer';
import type { Field } from '../../types/Field.js';

export async function renderCliSelectField(field: Field, initial?: any): Promise<any> {
    const isRequired = field.options?.required ?? false;
    const choices: { label: string; value: any }[] = [...(field.options?.choices || [])];

    if (!isRequired) {
        choices.unshift({ label: '— None —', value: null });
    }

    if (choices.length === 0) {
        console.log(`⚠️ No choices defined for "${field.label}". Skipping...`);
        return '';
    }

    const response = await inquirer.prompt({
        type: 'list',
        name: 'value',
        message: field.label || 'Select:',
        choices: choices.map((choice: { label: string; value: any }) => ({
            name: choice.label,
            value: choice.value
        })),
        default: initial ?? undefined
    });

    return response.value;
}
