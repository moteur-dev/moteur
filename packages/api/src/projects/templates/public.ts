import { Router } from 'express';
import { listTemplates, getTemplate } from '@moteur/core/templates.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.get('/', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const templates = await listTemplates(projectId);
        return res.json(templates);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list templates' });
    }
});

router.get('/:id', async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const template = await getTemplate(projectId, id);
        return res.json(template);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Template not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/templates': {
        get: {
            summary: 'List templates (public)',
            tags: ['Templates'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'List of templates',
                    content: {
                        'application/json': { schema: { type: 'array', items: { type: 'object' } } }
                    }
                }
            }
        }
    },
    '/projects/{projectId}/templates/{id}': {
        get: {
            summary: 'Get template by id (public)',
            tags: ['Templates'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Template',
                    content: { 'application/json': { schema: { type: 'object' } } }
                },
                '404': { description: 'Template not found' }
            }
        }
    }
};

export default router;
