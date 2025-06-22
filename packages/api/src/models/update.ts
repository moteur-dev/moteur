import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth';
import { updateModelSchema } from '@moteur/core/models';
import { validateModel } from '@moteur/core/validators/validateModel';
import type { OpenAPIV3 } from 'openapi-types';

const router = Router({ mergeParams: true });

router.patch('/:modelId', requireAdmin, (req: any, res: any) => {
    const { projectId, modelId } = req.params;
    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'Missing projectId or modelId in path' });
    }

    const validation = validateModel(req.body);
    if (!validation.valid) {
        return res.status(400).json({ validation: validation.issues, error: 'Validation failed' });
    }

    try {
        const model = updateModelSchema(req.user!, projectId, modelId, req.body);
        return res.json(model);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}': {
        patch: {
            summary: 'Update a model in a project',
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
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateModelInput' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Model updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Model' }
                        }
                    }
                },
                '400': {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' },
                                    validation: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                path: { type: 'string' },
                                                message: { type: 'string' }
                                            }
                                        }
                                    }
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
