import { Router } from 'express';
import { requireAdmin } from '../../middlewares/auth.js';
import {
    listBlueprints,
    getBlueprint,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint
} from '@moteur/core/blueprints.js';
import type { BlueprintSchema } from '@moteur/types/Blueprint.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

/** List all blueprints (admin only) */
router.get('/', requireAdmin, (_req: any, res: any) => {
    try {
        const blueprints = listBlueprints();
        return res.json({ blueprints });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/** Get one blueprint by id */
router.get('/:blueprintId', requireAdmin, (req: any, res: any) => {
    try {
        const blueprint = getBlueprint(req.params.blueprintId);
        return res.json(blueprint);
    } catch (err: any) {
        if (err.message?.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
});

/** Create or replace a blueprint (admin only) */
router.post('/', requireAdmin, (req: any, res: any) => {
    try {
        const body = req.body as BlueprintSchema;
        if (!body?.id) {
            return res.status(400).json({ error: 'Blueprint "id" is required' });
        }
        const blueprint = createBlueprint(body);
        return res.status(201).json(blueprint);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

/** Update a blueprint (partial) */
router.patch('/:blueprintId', requireAdmin, (req: any, res: any) => {
    try {
        const { blueprintId } = req.params;
        const blueprint = updateBlueprint(blueprintId, req.body);
        return res.json(blueprint);
    } catch (err: any) {
        if (err.message?.includes('not found')) {
            return res.status(404).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
    }
});

/** Delete a blueprint */
router.delete('/:blueprintId', requireAdmin, (req: any, res: any) => {
    try {
        deleteBlueprint(req.params.blueprintId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/blueprints': {
        get: {
            summary: 'List all blueprints',
            tags: ['Blueprints'],
            responses: {
                '200': {
                    description: 'List of blueprints',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    blueprints: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Blueprint' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        post: {
            summary: 'Create a blueprint',
            tags: ['Blueprints'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Blueprint' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Blueprint created',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Blueprint' }
                        }
                    }
                },
                '400': { description: 'Validation error' }
            }
        }
    },
    '/projects/blueprints/{blueprintId}': {
        get: {
            summary: 'Get a blueprint by id',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Blueprint',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Blueprint' }
                        }
                    }
                },
                '404': { description: 'Blueprint not found' }
            }
        },
        patch: {
            summary: 'Update a blueprint',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                description: { type: 'string' },
                                template: { $ref: '#/components/schemas/BlueprintTemplate' }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Updated blueprint',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Blueprint' }
                        }
                    }
                },
                '404': { description: 'Blueprint not found' }
            }
        },
        delete: {
            summary: 'Delete a blueprint',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'Blueprint deleted' },
                '400': { description: 'Invalid id' }
            }
        }
    }
};

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Blueprint: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            template: { $ref: '#/components/schemas/BlueprintTemplate' }
        }
    },
    BlueprintTemplate: {
        type: 'object',
        properties: {
            models: {
                type: 'array',
                items: { $ref: '#/components/schemas/Model' }
            },
            layouts: {
                type: 'array',
                items: { type: 'object' }
            },
            structures: {
                type: 'array',
                items: { type: 'object' }
            }
        }
    }
};

export default router;
