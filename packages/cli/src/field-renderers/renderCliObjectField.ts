import inquirer from 'inquirer';
import type { Field } from '@moteur/types/Field.js';

export async function renderCliObjectField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Object:',
            default: initial ?? ''
        }
    ]);

    return response.value;
}
