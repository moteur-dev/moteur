import inquirer from 'inquirer';
import type { Field } from '@moteur/types/Field.js';

export async function renderCliBooleanField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'value',
            message: field.label || 'Boolean:',
            default: initial === undefined ? false : Boolean(initial)
        }
    ]);

    return response.value;
}
