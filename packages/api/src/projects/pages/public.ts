import { Router } from 'express';
import { listPages, getPage, getPageBySlug } from '@moteur/core/pages.js';
import type { PageNode } from '@moteur/types/Page.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

function isPublishedContent(page: PageNode): boolean {
    if (page.type === 'folder') return false;
    return (page as { status?: string }).status === 'published';
}

router.get('/', async (req: any, res: any) => {
    const { projectId } = req.params;
    const templateId = req.query.templateId as string | undefined;
    const parentId = req.query.parentId as string | undefined;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const options = {
            templateId,
            parentId: parentId === '' || parentId === 'null' ? null : parentId,
            status: 'published' as const
        };
        const pages = await listPages(projectId, options);
        return res.json(pages);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list pages' });
    }
});

router.get('/by-slug/:slug', async (req: any, res: any) => {
    const { projectId, slug } = req.params;
    if (!projectId || !slug) return res.status(400).json({ error: 'Missing projectId or slug' });
    try {
        const page = await getPageBySlug(projectId, slug);
        if (!page || !isPublishedContent(page))
            return res.status(404).json({ error: 'Page not found' });
        return res.json(page);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get page' });
    }
});

router.get('/:id', async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const page = await getPage(projectId, id);
        if (!isPublishedContent(page)) return res.status(404).json({ error: 'Page not found' });
        return res.json(page);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/pages': {
        get: {
            summary: 'List pages (public; default published only)',
            tags: ['Pages'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'templateId', in: 'query', schema: { type: 'string' } },
                { name: 'parentId', in: 'query', schema: { type: 'string' } },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Ignored on public API; only published pages returned',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'List of pages',
                    content: {
                        'application/json': { schema: { type: 'array', items: { type: 'object' } } }
                    }
                }
            }
        }
    },
    '/projects/{projectId}/pages/{id}': {
        get: {
            summary: 'Get page by id (public; published only without auth)',
            tags: ['Pages'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Page',
                    content: { 'application/json': { schema: { type: 'object' } } }
                },
                '404': { description: 'Page not found' }
            }
        }
    },
    '/projects/{projectId}/pages/by-slug/{slug}': {
        get: {
            summary: 'Get page by slug (public; published only without auth)',
            tags: ['Pages'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Page',
                    content: { 'application/json': { schema: { type: 'object' } } }
                },
                '404': { description: 'Page not found' }
            }
        }
    }
};

export default router;
