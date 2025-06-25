import inquirer from 'inquirer';
import type { Field } from '@moteur/types/Field.js';

export async function renderCliStructureField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Structure:',
            default: initial ?? ''
        }
    ]);

    return response.value;
}
