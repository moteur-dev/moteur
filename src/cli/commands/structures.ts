import { StructureSchema } from '@/types/Structure.js';
import {
    listStructures,
    getStructure,
    createStructure,
    updateStructure,
    deleteStructure
} from '../../../src/api/structures.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { cliRegistry } from '@/registry/CommandRegistry.js';
import { showStructuresMenu } from '../menu/structuresMenu.js';
import { cliLoadUser } from '../utils/auth.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';

export async function listStructuresCommand(args: {
    project?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const structures = listStructures(args.project as string);
    if (args.json) {
        console.log(JSON.stringify(structures, null, 2));
    } else if (!args.quiet) {
        console.log(`📐 Structures${args.project ? ` in project "${args.project}"` : ''}:`);
        Object.entries(structures).forEach(([id, s]) => {
            console.log(`- ${id} (${s.label})`);
        });
    }
}

export async function getStructureCommand(args: {
    id?: string;
    project?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const structure = getStructure(args.id as string, args.project as string);
    if (args.json) {
        console.log(JSON.stringify(structure, null, 2));
    } else if (!args.quiet) {
        console.log(`📐 ${structure.type}: ${structure.label}`);
        console.log(`Fields: ${Object.keys(structure.fields).join(', ')}`);
    }
}

export async function createStructureCommand(args: {
    project?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const input = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['type', 'label']
    });

    const result = createStructure(args.project as string, input as StructureSchema);

    if (!args.quiet) {
        console.log(`✅ Created structure "${result.type}" in project "${args.project}"`);
    }
}

export async function patchStructureCommand(args: {
    project?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label']
    });

    const updated = updateStructure(args.project as string, args.id as string, patch);

    if (!args.quiet) {
        console.log(`✅ Updated structure "${args.id}" in project "${args.project}"`);
    }
}

export async function deleteStructureCommand(args: {
    project?: string;
    id?: string;
    quiet?: boolean;
}) {
    deleteStructure(args.project as string, args.id as string);
    if (!args.quiet) {
        console.log(`🗑️ Moved structure "${args.id}" to trash in project "${args.project}"`);
    }
}

cliRegistry.register('structures', {
    name: '',
    description: 'Interactive structures menu',
    action: async (opts: { projectId?: string }) => {
        const user = cliLoadUser();
        const projectId = opts.projectId ?? (await projectSelectPrompt(user));
        await showStructuresMenu(projectId);
    }
});

// structures list
cliRegistry.register('structures', {
    name: 'list',
    description: 'List all structures in a project',
    action: listStructuresCommand
});

// structures get
cliRegistry.register('structures', {
    name: 'get',
    description: 'Get a single structure schema',
    action: getStructureCommand
});

// structures create
cliRegistry.register('structures', {
    name: 'create',
    description: 'Create a new structure schema',
    action: createStructureCommand
});

// structures patch
cliRegistry.register('structures', {
    name: 'patch',
    description: 'Update an existing structure schema',
    action: patchStructureCommand
});

// structures delete
cliRegistry.register('structures', {
    name: 'delete',
    description: 'Delete a structure schema',
    action: deleteStructureCommand
});
