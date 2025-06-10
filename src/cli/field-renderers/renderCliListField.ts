import inquirer from 'inquirer';
import type { Field } from '../../types/Field.js';

export async function renderCliListField(field: Field, initial?: any[]): Promise<any[]> {
    const values: any[] = initial ? [...initial] : [];

    let done = false;
    while (!done) {
        const { item } = await inquirer.prompt([
            {
                type: 'input',
                name: 'item',
                message: `${field.label || 'List'} item (leave empty to finish):`
            }
        ]);

        if (!item) {
            done = true;
        } else {
            values.push(item);
        }
    }

    return values;
}
