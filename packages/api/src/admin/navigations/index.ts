import { Router } from 'express';
import {
    listNavigations,
    getNavigation,
    createNavigation,
    updateNavigation,
    deleteNavigation
} from '@moteur/core/navigations.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const list = await listNavigations(projectId);
        return res.json(list);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list navigations' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const nav = await createNavigation(projectId, req.user!, req.body);
        return res.status(201).json(nav);
    } catch (err: any) {
        const code = err?.message?.includes('already exists')
            ? 409
            : err?.message?.includes('exceed max depth') ||
                err?.message?.includes('not found') ||
                err?.message?.includes('Handle must')
              ? 422
              : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to create navigation' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const nav = await getNavigation(projectId, id);
        return res.json(nav);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Navigation not found' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const nav = await updateNavigation(projectId, req.user!, id, req.body);
        return res.json(nav);
    } catch (err: any) {
        const code =
            err?.message?.includes('maxDepth') ||
            err?.message?.includes('existing items have depth')
                ? 422
                : err?.message?.includes('already exists')
                  ? 409
                  : err?.message?.includes('not found')
                    ? 404
                    : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to update navigation' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deleteNavigation(projectId, req.user!, id);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Navigation not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/navigations': {
        get: {
            summary: 'List navigations',
            tags: ['Admin Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Navigation[]' } }
        },
        post: {
            summary: 'Create navigation',
            tags: ['Admin Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                handle: { type: 'string' },
                                maxDepth: { type: 'number' },
                                itemSchema: { type: 'array', items: {} },
                                items: { type: 'array', items: {} }
                            },
                            required: ['name', 'handle']
                        }
                    }
                }
            },
            responses: {
                '201': { description: 'Navigation' },
                '409': { description: 'Handle conflict' },
                '422': { description: 'Validation failed' }
            }
        }
    },
    '/admin/projects/{projectId}/navigations/{id}': {
        get: {
            summary: 'Get navigation by id',
            tags: ['Admin Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Navigation' }, '404': { description: 'Not found' } }
        },
        patch: {
            summary: 'Update navigation',
            tags: ['Admin Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': { description: 'Navigation' },
                '404': { description: 'Not found' },
                '422': { description: 'maxDepth conflict' }
            }
        },
        delete: {
            summary: 'Delete navigation',
            tags: ['Admin Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } }
        }
    }
};

export default router;
