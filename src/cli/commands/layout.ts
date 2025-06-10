import inquirer from 'inquirer';
import {
    createLayout,
    updateLayout,
    listLayouts,
    getLayout,
    hasLayout,
    deleteLayout,
    renderLayout
} from '../../../src/api/layouts.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { Layout } from '../../../src/types/Layout.js';
import { listBlocks } from '../../../src/api/blocks.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '../../types/User.js';



export async function listLayoutsCommand(args: {
    project: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layouts = listLayouts(user, args.project);
    if (args.json) return console.log(JSON.stringify(layouts, null, 2));
    if (!args.quiet) {
        console.log(`📄 Layouts in project "${args.project}":`);
        layouts.forEach(l => console.log(`- ${l.id} (${l.label})`));
    }
}

export async function getLayoutCommand(args: {
    project: string;
    id: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.project, args.id);
    if (args.json) return console.log(JSON.stringify(layout, null, 2));
    if (!args.quiet) {
        console.log(`📄 Layout "${args.id}":`);
        console.log(layout);
    }
}

export async function createLayoutCommand(args: {
    project: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const input = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['id', 'label']
    });

    const layout: Layout = {
        id: input.id,
        label: input.label,
        project: args.project,
        blocks: []
    };

    await editLayoutBlocksInteractively(layout, args.project, args.quiet);
    return layout;
}

export async function patchLayoutCommand(args: {
    project: string;
    id: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.project, args.id);
    if (!layout) throw new Error(`Layout not found: ${args.id}`);

    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label']
    });

    layout.label = patch.label ?? layout.label;

    await editLayoutBlocksInteractively(layout, args.project, args.quiet);
    return layout;
}

async function editLayoutBlocksInteractively(layout: Layout, project: string, quiet?: boolean) {
    const user: User = cliLoadUser();
    const blockRegistry = await listBlocks();
    let editing = true;

    while (editing) {
        console.clear();
        console.log(`✏️ Editing layout: ${layout.id} (${layout.project})`);
        layout.blocks.forEach((b, i) => console.log(`[${i}] ${b.type}`));

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Choose an action:',
                choices: [
                    { name: '➕ Add block', value: 'add' },
                    { name: '✏️ Edit block', value: 'edit' },
                    { name: '❌ Remove block', value: 'remove' },
                    { name: '💾 Save and exit', value: 'save' }
                ]
            }
        ]);

        if (action === 'add') {
            const { blockType } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'blockType',
                    message: 'Select block type:',
                    choices: Object.keys(blockRegistry)
                }
            ]);

            const blockSchema = blockRegistry[blockType];
            const fieldPrompts = Object.entries(blockSchema.fields).map(([key, def]) => ({
                type: 'input',
                name: key,
                message: `Enter value for "${key}" (${def.type})`
            }));

            const fieldAnswers: Record<string, any> = await inquirer.prompt(fieldPrompts as any);

            layout.blocks.push({
                type: blockType,
                data: fieldAnswers
            });
        } else if (action === 'edit') {
            const { index } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'index',
                    message: 'Enter block index to edit:'
                }
            ]);

            const block = layout.blocks[index];
            if (!block) {
                console.log('❌ Invalid index');
                continue;
            }

            const blockSchema = blockRegistry[block.type];
            const fieldPrompts = Object.entries(blockSchema.fields).map(([key, def]) => ({
                type: 'input',
                name: key,
                message: `Edit "${key}" (${def.type}):`,
                default: block.data?.[key] ?? ''
            }));

            const newFields: Record<string, any> = await inquirer.prompt(fieldPrompts as any);
            layout.blocks[index].data = newFields;
        } else if (action === 'remove') {
            const { index } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'index',
                    message: 'Enter block index to remove:'
                }
            ]);
            if (layout.blocks[index]) {
                layout.blocks.splice(index, 1);
                console.log(`✅ Removed block at index ${index}`);
            } else {
                console.log('❌ Invalid index');
            }
        } else if (action === 'save') {
            const isNew = hasLayout(project, layout.id) === false;
            const result = isNew
                ? createLayout(user, project, layout)
                : updateLayout(user, project, layout.id, layout);
            if (!quiet) {
                console.log(`✅ Layout ${isNew ? 'created' : 'updated'}: ${layout.id}`);
            }
            editing = false;
            return result;
        }
    }
}

export async function deleteLayoutCommand(args: { project: string; id: string; quiet?: boolean }) {
    const user: User = cliLoadUser();
    deleteLayout(user, args.project, args.id);
    if (!args.quiet) {
        console.log(`🗑️ Moved layout "${args.id}" to trash in project "${args.project}"`);
    }
}

export async function renderLayoutCommand(args: {
    project: string;
    id: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.project, args.id);
    if (!layout) {
        throw new Error(`Layout "${args.id}" not found in project "${args.project}"`);
    }
    const data = args.data ? JSON.parse(args.data) : {};
    renderLayout(user, layout, 'html');
}
