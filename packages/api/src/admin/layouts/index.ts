import { Router } from 'express';
import {
    listLayouts,
    getLayout,
    createLayout,
    updateLayout,
    deleteLayout
} from '@moteur/core/layouts.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const layouts = await listLayouts(req.user!, projectId);
        return res.json(layouts);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list layouts' });
    }
});

router.get('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId)
        return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        const layout = await getLayout(req.user!, projectId, layoutId);
        return res.json(layout);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Layout not found' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const layout = await createLayout(req.user!, projectId, req.body);
        return res.status(201).json(layout);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to create layout' });
    }
});

router.patch('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId)
        return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        const updated = await updateLayout(req.user!, projectId, layoutId, req.body);
        return res.json(updated);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to update layout' });
    }
});

router.delete('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId)
        return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        await deleteLayout(req.user!, projectId, layoutId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to delete layout' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/layouts': {
        get: {
            summary: 'List layouts',
            tags: ['Admin Layouts'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'List of layouts' } }
        },
        post: {
            summary: 'Create layout',
            tags: ['Admin Layouts'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '201': { description: 'Layout created' }, '400': { description: 'Bad request' } }
        }
    },
    '/admin/projects/{projectId}/layouts/{layoutId}': {
        get: {
            summary: 'Get layout by id',
            tags: ['Admin Layouts'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'layoutId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Layout' }, '404': { description: 'Not found' } }
        },
        patch: {
            summary: 'Update layout',
            tags: ['Admin Layouts'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'layoutId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Layout updated' }, '404': { description: 'Not found' } }
        },
        delete: {
            summary: 'Delete layout',
            tags: ['Admin Layouts'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'layoutId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } }
        }
    }
};

export default router;
