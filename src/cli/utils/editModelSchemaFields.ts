import inquirer from 'inquirer';
import { getModelSchema, updateModelSchema } from '../../../src/api/models.js';
import { listFields } from '../../../src/api/fields.js';
import { renderCliField } from '../field-renderers/renderCliField.js';
import '../field-renderers/index.js';
import { editJsonInEditor } from './editJsonInEditor.js';
import { User } from '../../types/User.js';

export async function editModelSchemaFields(user: User, projectId: string, modelId: string) {
    let modelSchema = getModelSchema(user, projectId, modelId);

    // Fetch available field types dynamically
    const availableFields = Object.values(listFields()).map(f => ({
        name: `${f.label} (${f.type})`,
        value: f.type
    }));

    let editing = true;
    while (editing) {
        console.clear();
        console.log(`\n🛠️ Editing fields for model "${modelSchema.label}" (${modelSchema.id})`);

        if (Object.keys(modelSchema.fields).length === 0) {
            console.log('\nNo fields yet.');
        } else {
            console.log('\nCurrent fields:');
            Object.entries(modelSchema.fields).forEach(([key, field]) => {
                console.log(`- ${key} (${field.type})`);
            });
        }

        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: [
                { name: '➕ Add a field', value: 'add' },
                { name: '📝 Edit a field', value: 'edit' },
                { name: '🗑️ Remove a field', value: 'remove' },
                new inquirer.Separator(),
                { name: '✅ Finish editing', value: 'done' }
            ]
        });

        switch (action) {
            case 'add': {
                const { newFieldId } = await inquirer.prompt({
                    type: 'input',
                    name: 'newFieldId',
                    message: 'Enter new field ID:',
                    validate: input => input.trim() !== '' || 'Field ID cannot be empty.'
                });

                const { fieldType } = await inquirer.prompt({
                    type: 'list',
                    name: 'fieldType',
                    message: 'Select field type:',
                    choices: availableFields
                });

                const { useJson } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'useJson',
                    message: 'Edit full field schema as JSON?',
                    default: false
                });

                let newFieldSchema;
                if (useJson) {
                    newFieldSchema = await editJsonInEditor(
                        { id: newFieldId, type: fieldType, label: newFieldId },
                        `Field "${newFieldId}" schema`
                    );
                } else {
                    newFieldSchema = await renderCliField(fieldType, {
                        type: fieldType,
                        id: newFieldId,
                        label: newFieldId
                    });
                }

                modelSchema.fields[newFieldId] = newFieldSchema;
                break;
            }

            case 'edit': {
                const { fieldToEdit } = await inquirer.prompt({
                    type: 'list',
                    name: 'fieldToEdit',
                    message: 'Which field to edit?',
                    choices: Object.keys(modelSchema.fields)
                });

                const { useJson } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'useJson',
                    message: 'Edit full field schema as JSON?',
                    default: false
                });

                let updatedField;
                if (useJson) {
                    updatedField = await editJsonInEditor(
                        modelSchema.fields[fieldToEdit],
                        `Field "${fieldToEdit}" schema`
                    );
                } else {
                    updatedField = await renderCliField(
                        modelSchema.fields[fieldToEdit].type,
                        modelSchema.fields[fieldToEdit]
                    );
                }

                modelSchema.fields[fieldToEdit] = updatedField;
                break;
            }

            case 'remove': {
                const { fieldToRemove } = await inquirer.prompt({
                    type: 'list',
                    name: 'fieldToRemove',
                    message: 'Which field to remove?',
                    choices: Object.keys(modelSchema.fields)
                });
                delete modelSchema.fields[fieldToRemove];
                break;
            }

            case 'done':
                editing = false;
                break;
        }
    }

    // Save updated schema
    updateModelSchema(user, projectId, modelId, { fields: modelSchema.fields });
    console.log('✅ Model schema fields updated!');
}
