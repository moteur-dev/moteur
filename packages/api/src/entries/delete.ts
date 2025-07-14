import { Router } from 'express';
import { deleteEntry } from '@moteur/core/entries.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.delete('/:entryId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId, entryId } = req.params;

    if (!projectId || !modelId || !entryId) {
        return res.status(400).json({ error: 'Missing path parameters' });
    }

    try {
        await deleteEntry(req.user!, projectId, modelId, entryId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(404).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries/{entryId}': {
        delete: {
            summary: 'Delete an entry',
            tags: ['Entries'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': {
                    description: 'Entry deleted successfully'
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
