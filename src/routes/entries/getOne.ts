import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';

import { getEntry } from '@/api/entries';
import { requireProjectAccess } from '@/middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/:entryId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId, entryId } = req.params;

    if (!projectId || !modelId || !entryId) {
        return res.status(400).json({ error: 'Missing path parameters' });
    }

    try {
        const entry = await getEntry(req.user!, projectId, modelId, entryId);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        return res.json({ entry });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries/{entryId}': {
        get: {
            summary: 'Get a single entry',
            tags: ['Entries'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Single entry found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    entry: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Entry not found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default router;
