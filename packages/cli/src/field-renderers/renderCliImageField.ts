import inquirer from 'inquirer';
import type { Field } from '@moteur/types/Field.js';

export async function renderCliImageField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Image:',
            default: initial ?? ''
        }
    ]);

    return response.value;
}
