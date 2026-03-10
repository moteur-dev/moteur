import { Router } from 'express';
import {
    listPages,
    getPageWithAuth as getPage,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    reorderPages,
    validatePageById,
    validateAllPages
} from '@moteur/core/pages.js';
import { getTemplate } from '@moteur/core/templates.js';
import { resolvePageAssets } from '@moteur/core/assets/assetResolver.js';
import { submitForPageReview } from '@moteur/core/reviews.js';
import type { PageNode } from '@moteur/types/Page.js';
import type { EntryStatus } from '@moteur/types/Model.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

const VALID_STATUSES: EntryStatus[] = ['draft', 'in_review', 'published', 'unpublished'];
const VALID_PAGE_STATUSES = ['draft', 'published'] as const;

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const templateId = req.query.templateId as string | undefined;
    const parentId = req.query.parentId as string | undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as PageNode['type'] | undefined;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const pages = await listPages(projectId, {
            templateId,
            parentId: parentId === '' || parentId === 'null' ? null : parentId,
            status: status as 'draft' | 'published' | undefined,
            type
        });
        return res.json(pages);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list pages' });
    }
});

router.get('/by-slug/:slug', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, slug } = req.params;
    if (!projectId || !slug) return res.status(400).json({ error: 'Missing projectId or slug' });
    try {
        const page = await getPageBySlug(projectId, slug);
        if (!page) return res.status(404).json({ error: 'Page not found' });
        return res.json(page);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        let page = await getPage(req.user!, projectId, id);
        if (req.query.resolveAssets === '1' && 'templateId' in page) {
            const template = await getTemplate(projectId, page.templateId);
            page = await resolvePageAssets(projectId, page, template);
        }
        return res.json(page);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const data = { ...req.body, projectId };
        const page = await createPage(projectId, req.user!, data);
        return res.status(201).json(page);
    } catch (err: any) {
        const code = err?.message?.includes('slug')
            ? 409
            : err?.message?.includes('validation')
              ? 422
              : err?.message?.includes('not found')
                ? 404
                : 422;
        return res.status(code).json({ error: err?.message ?? 'Failed to create page' });
    }
});

router.post('/reorder', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    const updates = req.body;
    if (!Array.isArray(updates))
        return res.status(400).json({ error: 'Body must be an array of { id, parentId, order }' });
    try {
        const pages = await reorderPages(projectId, req.user!, updates);
        return res.json(pages);
    } catch (err: any) {
        const code = err?.message?.includes('cycle')
            ? 422
            : err?.message?.includes('not found')
              ? 404
              : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to reorder' });
    }
});

router.put('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const page = await updatePage(projectId, req.user!, id, req.body);
        return res.json(page);
    } catch (err: any) {
        const code = err?.message?.includes('Publishing requires')
            ? 403
            : err?.message?.includes('not found')
              ? 404
              : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to update page' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const page = await updatePage(projectId, req.user!, id, req.body);
        return res.json(page);
    } catch (err: any) {
        const code = err?.message?.includes('Publishing requires')
            ? 403
            : err?.message?.includes('not found')
              ? 404
              : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to patch page' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deletePage(projectId, req.user!, id);
        return res.status(204).send();
    } catch (err: any) {
        if (err?.statusCode === 409)
            return res.status(409).json({ error: err?.message ?? 'Page has children' });
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

router.patch('/:id/status', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    const status = req.body?.status as string | undefined;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    if (!status || !VALID_PAGE_STATUSES.includes(status as 'draft' | 'published')) {
        return res
            .status(400)
            .json({ error: `status must be one of: ${VALID_PAGE_STATUSES.join(', ')}` });
    }
    try {
        const page = await updatePage(projectId, req.user!, id, {
            status: status as 'draft' | 'published'
        });
        return res.json(page);
    } catch (err: any) {
        const code = err?.message?.includes('requires an approved review')
            ? 403
            : err?.message?.includes('not found')
              ? 404
              : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to update page status' });
    }
});

router.post('/:id/submit-review', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    const assignedTo = req.body?.assignedTo as string | undefined;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const review = await submitForPageReview(projectId, req.user!, id, assignedTo);
        return res.status(201).json(review);
    } catch (err: any) {
        const code =
            err?.message?.includes('not enabled') || err?.message?.includes('already has a pending')
                ? 400
                : err?.message?.includes('not found')
                  ? 404
                  : 403;
        return res.status(code).json({ error: err?.message ?? 'Failed to submit for review' });
    }
});

router.post('/validate-all', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const results = await validateAllPages(projectId);
        return res.json(results);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to validate pages' });
    }
});

router.post('/:id/validate', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const result = await validatePageById(projectId, id);
        return res.json(result);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Page not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/pages': {
        get: {
            summary: 'List pages (admin)',
            tags: ['Pages (Admin)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'templateId', in: 'query', schema: { type: 'string' } },
                { name: 'parentId', in: 'query', schema: { type: 'string' } },
                {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: [...VALID_PAGE_STATUSES] }
                },
                {
                    name: 'type',
                    in: 'query',
                    schema: { type: 'string', enum: ['static', 'collection', 'folder'] }
                }
            ],
            responses: { '200': { description: 'List of pages' } }
        },
        post: {
            summary: 'Create page (admin)',
            tags: ['Pages (Admin)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '201': { description: 'Page created' } }
        }
    },
    '/admin/projects/{projectId}/pages/validate-all': {
        post: {
            summary: 'Validate all pages (admin)',
            tags: ['Pages (Admin)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Validation results' } }
        }
    },
    '/admin/projects/{projectId}/pages/{id}': {
        get: {
            summary: 'Get page (admin)',
            tags: ['Pages (Admin)'],
            responses: { '200': { description: 'Page' } }
        },
        put: {
            summary: 'Replace page (admin)',
            tags: ['Pages (Admin)'],
            responses: { '200': { description: 'Page updated' } }
        },
        patch: {
            summary: 'Patch page (admin)',
            tags: ['Pages (Admin)'],
            responses: { '200': { description: 'Page updated' } }
        },
        delete: {
            summary: 'Delete page (admin)',
            tags: ['Pages (Admin)'],
            responses: {
                '204': { description: 'Deleted' },
                '409': { description: 'Page has children; move or delete children first' }
            }
        }
    },
    '/admin/projects/{projectId}/pages/{id}/status': {
        patch: {
            summary: 'Update page status (admin)',
            tags: ['Pages (Admin)'],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: { status: { type: 'string', enum: VALID_STATUSES } }
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Page updated' },
                '403': { description: 'Publish requires approved review' }
            }
        }
    },
    '/admin/projects/{projectId}/pages/{id}/submit-review': {
        post: {
            summary: 'Submit page for review (admin)',
            tags: ['Pages (Admin)'],
            responses: { '201': { description: 'Review created' } }
        }
    },
    '/admin/projects/{projectId}/pages/{id}/validate': {
        post: {
            summary: 'Validate page (admin)',
            tags: ['Pages (Admin)'],
            responses: { '200': { description: 'Validation result' } }
        }
    },
    '/admin/projects/{projectId}/pages/reorder': {
        post: {
            summary: 'Reorder pages (batch parentId + order)',
            tags: ['Pages (Admin)'],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['id', 'parentId', 'order'],
                                properties: {
                                    id: { type: 'string' },
                                    parentId: { type: 'string', nullable: true },
                                    order: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            },
            responses: { '200': { description: 'Updated page nodes' } }
        }
    }
};

export default router;
