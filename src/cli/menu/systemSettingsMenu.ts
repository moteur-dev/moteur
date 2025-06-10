// src/cli/menu/menus/systemSettingsMenu.ts
import inquirer from 'inquirer';
import { listFields } from '../../api/fields';
import { listBlocks } from '../../api/blocks';
import { table } from 'table';

export async function showSystemSettingsMenu() {
    console.clear();
    console.log('\n🛠  System Settings');

    const { settingChoice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'settingChoice',
            message: 'Choose an option:',
            choices: [
                { name: '📦 List available field types', value: 'fields' },
                { name: '📦 List available block types', value: 'blocks' },
                new inquirer.Separator(),
                { name: '⬅️ Back to main menu', value: 'back' }
            ]
        }
    ]);

    switch (settingChoice) {
        case 'fields': {
            const fields = await listFields();
            console.log('\nAvailable field types:\n');

            for (const field of Object.values(fields)) {
                console.log(`- ${field.type}: ${field.label}`);
                if (field.description) console.log(`  📝 ${field.description}`);

                if (field.fields) {
                    console.log(`  🧩 Fields:`);
                    const fieldTable = [['Name', 'Type', 'Required']];
                    for (const [key, def] of Object.entries(field.fields)) {
                        fieldTable.push([key, def.type, def.options?.required ? 'Yes' : 'No']);
                    }
                    console.log(table(fieldTable));
                }

                if (field.options) {
                    console.log(`  ⚙️ Options:`);
                    const optionTable = [['Name', 'Type', 'Default', 'Description']];
                    for (const [key, opt] of Object.entries(field.options)) {
                        optionTable.push([
                            key,
                            opt.type,
                            opt.default !== undefined ? String(opt.default) : '',
                            opt.description || ''
                        ]);
                    }
                    console.log(table(optionTable));
                }
                console.log('');
            }
            break;
        }
        case 'blocks': {
            const blocks = await listBlocks();
            console.log('\nAvailable block types:\n');
            for (const block of Object.values(blocks)) {
                console.log(`- ${block.type}: ${block.label}`);
                if (block.description) console.log(`  📝 ${block.description}`);
                console.log('');
            }
            break;
        }
        case 'back':
            return;
    }

    console.log('\n');
    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to return to menu...' }
    ]);
    await showSystemSettingsMenu();
}
