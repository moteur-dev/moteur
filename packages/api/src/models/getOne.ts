import { Router } from 'express';
import { requireProjectAccess } from '../middlewares/auth';
import { getModelSchema } from '@moteur/core/models';
import type { OpenAPIV3 } from 'openapi-types';

const router = Router({ mergeParams: true });

router.get('/:modelId', requireProjectAccess, (req: any, res: any) => {
    const { projectId, modelId } = req.params;
    const user = req.user;
    try {
        const model = getModelSchema(user, projectId, modelId);

        if (!model || !model.id) {
            return res.status(404).json({ error: 'Model not found' });
        }

        res.json({ model });
    } catch (err) {
        console.error(`Failed to get model ${modelId} for project ${projectId}`, err);
        res.status(500).json({ error: 'Failed to get model' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}': {
        get: {
            summary: 'Get a single model from a project',
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
                '200': {
                    description: 'Returns the model schema',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    model: { $ref: '#/components/schemas/Model' }
                                }
                            }
                        }
                    }
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
