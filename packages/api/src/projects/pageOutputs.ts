import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { resolveAllUrls, resolveBreadcrumb, getNavigation } from '@moteur/core/pages.js';
import { getProjectById } from '@moteur/core/projects.js';

const router: Router = Router({ mergeParams: true });

router.get('/sitemap.xml', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const project = await getProjectById(projectId);
        const siteUrl = project?.siteUrl?.replace(/\/$/, '') ?? '';
        const all = await resolveAllUrls(projectId);
        const urls = all.filter(r => r.sitemapInclude);

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        const loc = (path: string) => (siteUrl ? `${siteUrl}${path}` : path);
        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map(
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
        return res.send(xml);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to generate sitemap' });
    }
});

router.get('/sitemap.json', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const all = await resolveAllUrls(projectId);
        const urls = all.filter(r => r.sitemapInclude);
        return res.json(urls);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get sitemap' });
    }
});

router.get('/navigation', async (req: any, res: any) => {
    const { projectId } = req.params;
    const depth = req.query.depth != null ? Number(req.query.depth) : undefined;
    const rootId = req.query.rootId as string | undefined;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const tree = await getNavigation(projectId, {
            depth,
            rootId: rootId === '' || rootId === 'null' ? null : rootId
        });
        return res.json(tree);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get navigation' });
    }
});

router.get('/urls', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const urls = await resolveAllUrls(projectId);
        return res.json(urls);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get urls' });
    }
});

router.get('/breadcrumb', async (req: any, res: any) => {
    const { projectId } = req.params;
    const pageId = req.query.pageId as string | undefined;
    const entryId = req.query.entryId as string | undefined;
    if (!projectId || !pageId)
        return res.status(400).json({ error: 'Missing projectId or pageId' });
    try {
        const result = await resolveBreadcrumb(projectId, pageId, entryId);
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get breadcrumb' });
    }
});

function escapeXml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/sitemap.xml': {
        get: {
            summary: 'Get sitemap as XML',
            tags: ['Page outputs'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'XML sitemap' } }
        }
    },
    '/projects/{projectId}/sitemap.json': {
        get: {
            summary: 'Get sitemap as JSON (ResolvedUrl[] where sitemapInclude)',
            tags: ['Page outputs'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'JSON array of resolved URLs' } }
        }
    },
    '/projects/{projectId}/navigation': {
        get: {
            summary: 'Get navigation tree',
            tags: ['Page outputs'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'depth', in: 'query', schema: { type: 'number' } },
                { name: 'rootId', in: 'query', schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'NavigationNode[]' } }
        }
    },
    '/projects/{projectId}/urls': {
        get: {
            summary: 'Get all resolved URLs',
            tags: ['Page outputs'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'ResolvedUrl[]' } }
        }
    },
    '/projects/{projectId}/breadcrumb': {
        get: {
            summary: 'Get breadcrumb for a page (and optional entry)',
            tags: ['Page outputs'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'pageId', in: 'query', required: true, schema: { type: 'string' } },
                { name: 'entryId', in: 'query', schema: { type: 'string' } }
            ],
            responses: { '200': { description: '{ url, breadcrumb }' } }
        }
    }
};

export default router;
