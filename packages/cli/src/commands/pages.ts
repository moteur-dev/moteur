import {
    listPages,
    getPageWithAuth as getPage,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    validatePageById,
    validateAllPages
} from '@moteur/core/pages.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

export async function listPagesCommand(args: {
    projectId?: string;
    template?: string;
    parent?: string;
    status?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    const options = {
        templateId: args.template,
        parentId: args.parent === '' || args.parent === 'null' ? null : args.parent,
        status: args.status as 'draft' | 'in_review' | 'published' | 'unpublished' | undefined
    };
    const pages = await listPages(args.projectId as string, options);
    if (pages.length === 0) {
        if (!args.quiet) console.log(`📂 No pages found.`);
        return;
    }
    if (args.json) return console.log(JSON.stringify(pages, null, 2));
    if (!args.quiet) {
        console.log(`📁 Pages in project "${args.projectId}":`);
        pages.forEach(p => console.log(`- ${p.id} (${p.label}) ${p.slug ?? ''}`));
    }
}

export async function getPageCommand(args: {
    projectId?: string;
    id?: string;
    slug?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    let page;
    if (args.slug) {
        page = await getPageBySlug(args.projectId as string, args.slug);
        if (!page) throw new Error(`Page with slug "${args.slug}" not found.`);
    } else {
        page = await getPage(user, args.projectId as string, args.id as string);
    }
    if (args.json) return console.log(JSON.stringify(page, null, 2));
    if (!args.quiet) {
        console.log(`📁 Page "${page.id}":`);
        console.log(page);
    }
}

export async function createPageCommand(args: {
    projectId?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['templateId', 'label', 'slug', 'parentId', 'status']
    });
    const data = {
        ...patch,
        projectId: args.projectId,
        templateId: patch.templateId,
        label: patch.label ?? 'Untitled',
        status: patch.status ?? 'draft',
        fields: patch.fields ?? {}
    };
    const created = await createPage(args.projectId as string, user, data);
    if (args.json) return console.log(JSON.stringify(created, null, 2));
    if (!args.quiet) console.log(`✅ Created page "${created.id}" in project "${args.projectId}".`);
    return created;
}

export async function patchPageCommand(args: {
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label', 'slug', 'parentId', 'status']
    });
    const updated = await updatePage(args.projectId as string, user, args.id as string, patch);
    if (!args.quiet) console.log(`🔧 Patched page "${args.id}" in project "${args.projectId}".`);
    if (args.json) return console.log(JSON.stringify(updated, null, 2));
    return updated;
}

export async function deletePageCommand(args: {
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    await deletePage(args.projectId as string, user, args.id as string);
    if (!args.quiet)
        console.log(`🗑️ Moved page "${args.id}" to trash in project "${args.projectId}".`);
}

export async function validatePageCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    if (args.id) {
        const result = await validatePageById(args.projectId as string, args.id);
        if (!args.quiet) {
            if (result.valid) console.log('✅ Page is valid.');
            else result.issues.forEach(i => console.log(`- ${i.path}: ${i.message}`));
        }
        if (args.json) console.log(JSON.stringify(result, null, 2));
        return result;
    }
    const results = await validateAllPages(args.projectId as string);
    if (!args.quiet) {
        const invalid = results.filter(r => !r.valid);
        if (invalid.length === 0) console.log('✅ All pages are valid.');
        else
            invalid.forEach(r =>
                r.issues.forEach(issue => console.log(`- ${issue.path}: ${issue.message}`))
            );
    }
    if (args.json) console.log(JSON.stringify(results, null, 2));
    return results;
}

cliRegistry.register('pages', {
    name: 'list',
    description: 'List pages',
    action: listPagesCommand
});
cliRegistry.register('pages', {
    name: 'get',
    description: 'Get a single page (by id or slug)',
    action: getPageCommand
});
cliRegistry.register('pages', {
    name: 'create',
    description: 'Create a new page',
    action: createPageCommand
});
cliRegistry.register('pages', {
    name: 'patch',
    description: 'Update an existing page',
    action: patchPageCommand
});
cliRegistry.register('pages', {
    name: 'delete',
    description: 'Delete a page',
    action: deletePageCommand
});
cliRegistry.register('pages', {
    name: 'validate',
    description: 'Validate page(s)',
    action: validatePageCommand
});
