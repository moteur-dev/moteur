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
import { resolveInputData } from '../utils/resolveInputData';
import { Layout } from '../../../src/types/Layout';
import { listBlocks } from '../../../src/api/blocks';
import { cliLoadUser } from '../utils/auth';
import { User } from '../../../src/types/User';
import { cliRegistry } from '../../registry/CommandRegistry';
import { showLayoutMenu } from '../menu/layoutMenu';

export async function listLayoutsCommand(args: {
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layouts = listLayouts(user, args.projectId as string);
    if (args.json) return console.log(JSON.stringify(layouts, null, 2));
    if (!args.quiet) {
        console.log(`📄 Layouts in project "${args.projectId}":`);
        layouts.forEach(l => console.log(`- ${l.id} (${l.label})`));
    }
}

export async function getLayoutCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.projectId as string, args.id as string);
    if (args.json) return console.log(JSON.stringify(layout, null, 2));
    if (!args.quiet) {
        console.log(`📄 Layout "${args.id}" in project "${args.projectId}":`);
        console.log(layout);
    }
}

export async function createLayoutCommand(args: {
    projectId?: string;
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
        project: args.projectId,
        blocks: []
    };

    await editLayoutBlocksInteractively(layout, args.projectId as string, args.quiet);
    return layout;
}

export async function patchLayoutCommand(args: {
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.projectId as string, args.id as string);
    if (!layout) throw new Error(`Layout not found: ${args.id}`);

    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label']
    });

    layout.label = patch.label ?? layout.label;
    await editLayoutBlocksInteractively(layout, args.projectId as string, args.quiet);
    return layout;
}

async function editLayoutBlocksInteractively(layout?: Layout, projectId?: string, quiet?: boolean) {
    const user: User = cliLoadUser();
    const blockRegistry = await listBlocks();
    let editing = true;

    while (editing) {
        console.clear();
        console.log(`✏️ Editing layout: ${layout?.id} (${projectId})`);
        layout?.blocks.forEach((b, i) => console.log(`[${i}] ${b.type}`));

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
            const fieldAnswers = await inquirer.prompt(fieldPrompts as any);
            layout?.blocks.push({ type: blockType, data: fieldAnswers });
        } else if (action === 'edit') {
            const { index } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'index',
                    message: 'Enter block index to edit:'
                }
            ]);
            const block = layout?.blocks[index];
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
            const newFields = await inquirer.prompt(fieldPrompts as any);
            layout.blocks[index].data = newFields;
        } else if (action === 'remove') {
            const { index } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'index',
                    message: 'Enter block index to remove:'
                }
            ]);
            if (layout?.blocks[index]) {
                layout?.blocks.splice(index, 1);
                console.log(`✅ Removed block at index ${index}`);
            } else {
                console.log('❌ Invalid index');
            }
        } else if (action === 'save') {
            const isNew = !hasLayout(projectId as string, layout?.id as string);
            const result = isNew
                ? createLayout(user, projectId as string, layout as Layout)
                : updateLayout(user, projectId as string, layout?.id as string, layout as Layout);
            if (!quiet) {
                console.log(`✅ Layout ${isNew ? 'created' : 'updated'}: ${layout?.id}`);
            }
            editing = false;
            return result;
        }
    }
}

export async function deleteLayoutCommand(args: {
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    deleteLayout(user, args.projectId as string, args.id as string);
    if (!args.quiet) {
        console.log(`🗑️ Moved layout "${args.id}" to trash in project "${args.projectId}"`);
    }
}

export async function renderLayoutCommand(args: {
    projectId?: string;
    id?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const layout = getLayout(user, args.projectId as string, args.id as string);
    if (!layout) {
        throw new Error(`Layout "${args.id}" not found in project "${args.projectId}"`);
    }
    const inputData = args.data ? JSON.parse(args.data) : {};
    renderLayout(user, layout, 'html', inputData);
}

cliRegistry.register('layouts', {
    name: '',
    description: 'Interactive layouts menu',
    action: async opts => {
        await showLayoutMenu(opts);
    }
});

cliRegistry.register('layouts', {
    name: 'list',
    description: 'List layouts in a project',
    action: listLayoutsCommand
});

cliRegistry.register('layouts', {
    name: 'get',
    description: 'Get a single layout',
    action: getLayoutCommand
});

cliRegistry.register('layouts', {
    name: 'create',
    description: 'Create a new layout',
    action: createLayoutCommand
});

cliRegistry.register('layouts', {
    name: 'patch',
    description: 'Update an existing layout',
    action: patchLayoutCommand
});

cliRegistry.register('layouts', {
    name: 'delete',
    description: 'Delete a layout',
    action: deleteLayoutCommand
});

cliRegistry.register('layouts', {
    name: 'render',
    description: 'Render a layout to HTML',
    action: renderLayoutCommand
});
