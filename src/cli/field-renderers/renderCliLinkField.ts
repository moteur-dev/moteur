import inquirer from 'inquirer';
import type { Field } from '../../types/Field.js';

export async function renderCliLinkField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Link:',
            default: initial ?? ''
        }
    ]);

    return response.value;
}
