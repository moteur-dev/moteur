import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import {
    listCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection
} from '@moteur/core/apiCollections.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const list = await listCollections(projectId);
        return res.json(list);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list collections' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const collection = await getCollection(projectId, id);
        if (!collection) return res.status(404).json({ error: 'Collection not found' });
        return res.json(collection);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get collection' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const { label, description, resources } = req.body ?? {};
        const collection = await createCollection(projectId, req.user!, {
            label: label ?? 'Unnamed',
            description,
            resources: resources ?? []
        });
        return res.status(201).json(collection);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to create collection' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const patch = req.body ?? {};
        const collection = await updateCollection(projectId, req.user!, id, patch);
        return res.json(collection);
    } catch (err: any) {
        return res.status(err?.message?.includes('not found') ? 404 : 400).json({
            error: err?.message ?? 'Failed to update collection'
        });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deleteCollection(projectId, req.user!, id);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(err?.message?.includes('not found') ? 404 : 400).json({
            error: err?.message ?? 'Failed to delete collection'
        });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/collections': {
        get: {
            summary: 'List collections (JWT + project access)',
            tags: ['Admin Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'List of collections' } }
        },
        post: {
            summary: 'Create collection',
            tags: ['Admin Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                label: { type: 'string' },
                                description: { type: 'string' },
                                resources: { type: 'array', items: { type: 'object' } }
                            }
                        }
                    }
                }
            },
            responses: { '201': { description: 'Created collection' } }
        }
    },
    '/admin/projects/{projectId}/collections/{id}': {
        get: {
            summary: 'Get one collection',
            tags: ['Admin Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Collection' }, '404': { description: 'Not found' } }
        },
        patch: {
            summary: 'Update collection',
            tags: ['Admin Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': { description: 'Updated collection' },
                '404': { description: 'Not found' }
            }
        },
        delete: {
            summary: 'Delete collection',
            tags: ['Admin Collections'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } }
        }
    }
};

export default router;
