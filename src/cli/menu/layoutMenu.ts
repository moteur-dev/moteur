// src/cli/menu/layoutMenu.ts
import inquirer from 'inquirer';
import { getLayout, updateLayout } from '../../api/layouts.js';
import { renderCliField } from '../field-renderers/renderCliField.js';
import { listBlocks } from '../../api/blocks.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '../../types/User.js';

export async function addBlockToLayout(projectId: string, layoutId: string) {
    const user: User = cliLoadUser();
    const blockTypes = await listBlocks();
    const { selectedType } = await inquirer.prompt({
        type: 'list',
        name: 'selectedType',
        message: 'Select block type to add:',
        choices: Object.keys(blockTypes).map(type => ({
            name: `${blockTypes[type].label} (${type})`,
            value: type
        }))
    });
    console.log(`\n📝 You selected: ${selectedType} block type.`);

    const schema = blockTypes[selectedType];
    const newBlock: any = {
        type: selectedType,
        fields: {}
    };

    console.log('\n⚙️  Please fill in the fields for this block:');
    for (const [key, fieldSchema] of Object.entries(schema.fields)) {
        newBlock.fields[key] = await renderCliField(fieldSchema.type, fieldSchema);
    }

    if (schema.optionsSchema) {
        const { configureOptions } = await inquirer.prompt({
            type: 'confirm',
            name: 'configureOptions',
            message: 'Would you like to configure advanced block options?',
            default: false
        });

        if (configureOptions) {
            console.log('\n⚙️  Please fill in the advanced options:');
            for (const [key, optionSchema] of Object.entries(schema.optionsSchema)) {
                console.log(`\n🛠️  Option: ${key} (${optionSchema.type})`);
                newBlock.options[key] = await renderCliField(optionSchema.type, optionSchema);
            }
        }
    }

    // Append new block to layout.blocks
    const layout = await getLayout(user, projectId, layoutId);
    layout.blocks.push(newBlock);
    await updateLayout(user, projectId, layoutId, layout);

    console.log('\n✅ Block added successfully!');
}

export async function showLayoutMenu(projectId: string, layoutId: string) {
    const user: User = cliLoadUser();
    const layout = await getLayout(user, projectId, layoutId);

    console.clear();
    console.log(`\n📝 Editing Layout: ${layout.label || layoutId}`);

    const { layoutAction } = await inquirer.prompt([
        {
            type: 'list',
            name: 'layoutAction',
            message: 'Choose an action for this layout:',
            choices: [
                { name: '✏️ Rename layout', value: 'rename' },
                { name: '➕ Add a block', value: 'add' },
                { name: '🧩 Edit existing blocks', value: 'edit' },
                { name: '🗑️ Remove a block', value: 'remove' },
                { name: '🔃 Reorder blocks', value: 'reorder' },
                new inquirer.Separator(),
                { name: '⬅️ Back to project menu', value: 'back' }
            ]
        }
    ]);

    switch (layoutAction) {
        case 'rename': {
            const { newLabel } = await inquirer.prompt({
                type: 'input',
                name: 'newLabel',
                message: 'Enter new layout label:',
                default: layout.label
            });
            layout.label = newLabel;
            await updateLayout(user, projectId, layoutId, layout);
            console.log('\n✅ Layout renamed successfully.');
            break;
        }
        case 'add': {
            await addBlockToLayout(projectId, layoutId);
            break;
        }
        case 'edit': {
            // TODO: Select block to edit and prompt via renderCliField.
            console.log('\n[TODO] Edit block logic.');
            break;
        }
        case 'remove': {
            // TODO: Select block to remove.
            console.log('\n[TODO] Remove block logic.');
            break;
        }
        case 'reorder': {
            // TODO: Implement reordering logic (multi-select reorder?).
            console.log('\n[TODO] Reorder blocks logic.');
            break;
        }
        case 'back':
            return;
    }

    console.log('\n');
    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to return to layout menu...' }
    ]);
    await showLayoutMenu(projectId, layoutId);
}
