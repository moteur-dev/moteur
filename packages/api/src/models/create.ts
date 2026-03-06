import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import { createModelSchema } from '@moteur/core/models.js';
import { getBlueprint } from '@moteur/core/blueprints.js';
import { validateModel } from '@moteur/core/validators/validateModel.js';
import type { ModelSchema } from '@moteur/types/Model.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.post('/', requireAdmin, async (req: any, res: any) => {
    try {
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ error: 'Missing projectId in path' });
        }
        const body = req.body || {};
        let schema: ModelSchema;

        if (body.blueprintId) {
            const blueprint = getBlueprint('model', body.blueprintId);
            if ((blueprint.kind ?? 'project') !== 'model') {
                return res.status(400).json({ error: 'Blueprint is not a model blueprint' });
            }
            const template = blueprint.template as { model: ModelSchema } | undefined;
            if (!template?.model) {
                return res.status(400).json({ error: 'Blueprint has no template.model' });
            }
            const { blueprintId: _b, ...overrides } = body;
            schema = { ...template.model, ...overrides } as ModelSchema;
        } else {
            schema = body as ModelSchema;
        }

        const validation = validateModel(schema);
        if (!validation.valid) {
            return res
                .status(400)
                .json({ validation: validation.issues, error: 'Validation failed' });
        }
        const model = await createModelSchema(req.user!, projectId, schema);
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
        description:
            'Full model schema, or blueprintId + optional overrides (id, label, description, fields, etc.) to create from a model blueprint.',
        properties: {
            blueprintId: {
                type: 'string',
                description:
                    'Optional. If set, create from this model blueprint; other fields act as overrides.'
            },
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
