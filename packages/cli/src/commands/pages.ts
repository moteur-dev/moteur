import {
    listPages,
    getPageWithAuth as getPage,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    resolveAllUrls,
    validatePageById,
    validateAllPages
} from '@moteur/core/pages.js';
import { getProjectById } from '@moteur/core/projects.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

function projectIdFromArgs(
    args: { project?: string; projectId?: string },
    user: User
): Promise<string> {
    const id = args.project ?? args.projectId;
    if (id) return Promise.resolve(id);
    return projectSelectPrompt(user);
}

export async function listPagesCommand(args: {
    project?: string;
    projectId?: string;
    template?: string;
    parent?: string;
    status?: string;
    type?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const options = {
        templateId: args.template,
        parentId: args.parent === '' || args.parent === 'null' ? null : args.parent,
        status: args.status as 'draft' | 'published' | undefined,
        type: args.type as 'static' | 'collection' | 'folder' | undefined
    };
    const pages = await listPages(projectId, options);
    if (pages.length === 0) {
        if (!args.quiet) console.log(`📂 No pages found.`);
        return;
    }
    if (args.json) return console.log(JSON.stringify(pages, null, 2));
    if (!args.quiet) {
        console.log(`📁 Pages in project "${projectId}":`);
        pages.forEach(p => console.log(`- ${p.id} [${p.type}] (${p.label}) ${p.slug ?? ''}`));
    }
}

export async function getPageCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    slug?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    let page;
    if (args.slug) {
        page = await getPageBySlug(projectId, args.slug);
        if (!page) throw new Error(`Page with slug "${args.slug}" not found.`);
    } else {
        page = await getPage(user, projectId, args.id as string);
    }
    if (args.json) return console.log(JSON.stringify(page, null, 2));
    if (!args.quiet) {
        console.log(`📁 Page "${page.id}":`);
        console.log(page);
    }
}

export async function createPageCommand(args: {
    project?: string;
    projectId?: string;
    type?: string;
    label?: string;
    slug?: string;
    template?: string;
    model?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const type = (args.type ?? 'static') as 'static' | 'collection' | 'folder';
    const label = args.label ?? 'Untitled';
    const slug = args.slug ?? (type === 'folder' ? label.toLowerCase().replace(/\s+/g, '-') : '');
    const data: Record<string, unknown> = {
        type,
        label,
        slug,
        projectId,
        ...(args.template && { templateId: args.template }),
        ...(args.model && type === 'collection' && { modelId: args.model }),
        ...(type !== 'folder' && { status: 'draft', fields: {} })
    };
    if (args.file || args.data) {
        const patch = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: [
                'templateId',
                'label',
                'slug',
                'parentId',
                'status',
                'modelId',
                'urlPattern'
            ]
        });
        Object.assign(data, patch);
        if (patch.templateId) data.templateId = patch.templateId;
        if (patch.modelId) data.modelId = patch.modelId;
        if (patch.fields) data.fields = patch.fields;
    }
    const created = await createPage(projectId, user, data as any);
    if (args.json) return console.log(JSON.stringify(created, null, 2));
    if (!args.quiet)
        console.log(`✅ Created page "${created.id}" (${type}) in project "${projectId}".`);
    return created;
}

export async function patchPageCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    'nav-include'?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const patch: Record<string, unknown> = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: [
            'label',
            'slug',
            'parentId',
            'status',
            'navInclude',
            'navLabel',
            'sitemapInclude'
        ]
    });
    if (args['nav-include'] !== undefined) patch.navInclude = args['nav-include'] === 'true';
    const updated = await updatePage(projectId, user, args.id as string, patch as any);
    if (!args.quiet) console.log(`🔧 Patched page "${args.id}" in project "${projectId}".`);
    if (args.json) return console.log(JSON.stringify(updated, null, 2));
    return updated;
}

export async function deletePageCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    await deletePage(projectId, user, args.id as string);
    if (!args.quiet) console.log(`🗑️ Moved page "${args.id}" to trash in project "${projectId}".`);
}

export async function urlsPageCommand(args: {
    project?: string;
    projectId?: string;
    sitemap?: boolean;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    const urls = await resolveAllUrls(projectId);
    if (args.sitemap) {
        const project = await getProjectById(projectId);
        const siteUrl = project?.siteUrl?.replace(/\/$/, '') ?? '';
        const filtered = urls.filter(r => r.sitemapInclude);
        const escapeXml = (s: string) =>
            s
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        const loc = (path: string) => (siteUrl ? `${siteUrl}${path}` : path);
        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...filtered.map(
                u =>
                    `<url><loc>${escapeXml(loc(u.url))}</loc>` +
                    (u.sitemapPriority !== undefined
                        ? `<priority>${u.sitemapPriority}</priority>`
                        : '') +
                    (u.sitemapChangefreq ? `<changefreq>${u.sitemapChangefreq}</changefreq>` : '') +
                    '</url>'
            ),
            '</urlset>'
        ].join('\n');
        console.log(xml);
        return;
    }
    if (args.json) return console.log(JSON.stringify(urls, null, 2));
    if (!args.quiet) {
        console.log(`📎 Resolved URLs in project "${projectId}" (${urls.length}):`);
        urls.forEach(u => console.log(u.url));
    }
    return urls;
}

export async function validatePageCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = await projectIdFromArgs(args, user);
    if (args.id) {
        const result = await validatePageById(projectId, args.id);
        if (!args.quiet) {
            if (result.valid) console.log('✅ Page is valid.');
            else result.issues.forEach(i => console.log(`- ${i.path}: ${i.message}`));
        }
        if (args.json) console.log(JSON.stringify(result, null, 2));
        return result;
    }
    const results = await validateAllPages(projectId);
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
    name: 'urls',
    description: 'List resolved URLs (or --sitemap for XML sitemap)',
    action: urlsPageCommand
});
cliRegistry.register('pages', {
    name: 'validate',
    description: 'Validate page(s)',
    action: validatePageCommand
});
