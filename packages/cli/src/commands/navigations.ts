import {
    listNavigations,
    getNavigation,
    getNavigationByHandle,
    createNavigation,
    deleteNavigation
} from '@moteur/core/navigations.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

function projectIdFromArgs(
    args: { project?: string; projectId?: string },
    user: User
): Promise<string> {
    const id = args.project ?? args.projectId;
    if (id) return Promise.resolve(id as string);
    return projectSelectPrompt(user);
}

export async function listNavigationsCommand(args: {
    project?: string;
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const list = await listNavigations(projectId);
    if (list.length === 0) {
        if (!args.quiet) console.log(`📂 No navigations in project "${projectId}".`);
        return;
    }
    if (args.json) return console.log(JSON.stringify(list, null, 2));
    if (!args.quiet) {
        console.log(`📁 Navigations in project "${projectId}":`);
        list.forEach(n => console.log(`- ${n.id} [${n.handle}] ${n.name}`));
    }
}

export async function getNavigationCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    handle?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    let nav;
    if (args.handle) {
        nav = await getNavigationByHandle(projectId, args.handle as string);
        if (!nav) throw new Error(`Navigation with handle "${args.handle}" not found.`);
    } else {
        nav = await getNavigation(projectId, args.id as string);
    }
    if (args.json) return console.log(JSON.stringify(nav, null, 2));
    if (!args.quiet) console.log(nav);
}

export async function createNavigationCommand(args: {
    project?: string;
    projectId?: string;
    name?: string;
    handle?: string;
    maxDepth?: number;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const name = (args.name ?? 'Untitled').toString().trim();
    const handle = (
        args.handle ??
        name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
    ).trim();
    if (!handle) throw new Error('handle is required (or derived from name).');
    const nav = await createNavigation(projectId, user, {
        name,
        handle,
        maxDepth: args.maxDepth != null ? Number(args.maxDepth) : undefined,
        items: []
    });
    if (args.json) return console.log(JSON.stringify(nav, null, 2));
    if (!args.quiet)
        console.log(
            `✅ Created navigation "${nav.name}" (${nav.handle}) in project "${projectId}".`
        );
}

export async function deleteNavigationCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    await deleteNavigation(projectId, user, args.id as string);
    if (!args.quiet) console.log(`🗑️ Deleted navigation "${args.id}" from project "${projectId}".`);
}

cliRegistry.register('navigations', {
    name: 'list',
    description: 'List navigations',
    action: listNavigationsCommand
});
cliRegistry.register('navigations', {
    name: 'get',
    description: 'Get a navigation by id or --handle',
    action: getNavigationCommand
});
cliRegistry.register('navigations', {
    name: 'create',
    description: 'Create a navigation (--name, --handle, --maxDepth?)',
    action: createNavigationCommand
});
cliRegistry.register('navigations', {
    name: 'delete',
    description: 'Delete a navigation',
    action: deleteNavigationCommand
});
