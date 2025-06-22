import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth';
import { createModelSchema } from '@moteur/core/models';
import { validateModel } from '@moteur/core/validators/validateModel';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.post('/', requireAdmin, (req: any, res: any) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ error: 'Missing projectId in path' });
        }
        const validation = validateModel(req.body);
        if (!validation.valid) {
            return res
                .status(400)
                .json({ validation: validation.issues, error: 'Validation failed' });
        }
        const model = createModelSchema(req.user!, projectId, req.body);
        return res.status(201).json(model);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models': {
        post: {
            summary: 'Create a new model in a project',
            tags: ['Models'],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/NewModelInput' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Model successfully created',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Model' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failed or invalid model',
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

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    NewModelInput: {
        type: 'object',
        required: ['id', 'label', 'fields'],
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            description: { type: 'string' },
            fields: {
                type: 'object',
                additionalProperties: {
                    $ref: '#/components/schemas/Field'
                }
            },
            meta: {
                type: 'object',
                additionalProperties: true
            }
        }
    }
};

export default router;
