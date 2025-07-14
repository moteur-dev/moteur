import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import { deleteModelSchema } from '@moteur/core/models.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.delete('/:modelId', requireAdmin, (req: any, res: any) => {
    const { projectId, modelId } = req.params;
    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'Missing projectId or modelId in path' });
    }

    try {
        deleteModelSchema(req.user!, projectId, modelId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(404).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}': {
        delete: {
            summary: 'Delete a model from a project',
            tags: ['Models'],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                },
                {
                    name: 'modelId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '204': {
                    description: 'Model deleted successfully'
                },
                '404': {
                    description: 'Model not found',
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
