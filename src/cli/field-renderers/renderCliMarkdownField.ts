import inquirer from 'inquirer';
import type { Field } from '../../types/Field.js';

export async function renderCliMarkdownField(field: Field, initial?: any): Promise<any> {
    const response = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: field.label || 'Markdown:',
            default: initial ?? ''
        }
    ]);

    return response.value;
}
