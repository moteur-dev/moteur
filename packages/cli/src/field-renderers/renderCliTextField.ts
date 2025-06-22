import inquirer from 'inquirer';
import type { Field } from '@moteur/types/Field.js';

export async function renderCliTextField(field: Field, initial?: any): Promise<any> {
    const isRequired = field.options?.required ?? false;
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Text:',
            default: initial ?? '',
            validate: (input: string) => {
                if (isRequired && input.trim() === '') {
                    return '❌ This field is required.';
                }
                return true;
            }
        }
    ]);

    return response.value;
}
