import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.js';
import {
    listBlueprints,
    getBlueprint,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint
} from '@moteur/core/blueprints.js';
import type { BlueprintKind, BlueprintSchema } from '@moteur/types/Blueprint.js';
import type { OpenAPIV3 } from 'openapi-types';

function createKindRouter(kind: BlueprintKind): Router {
    const router = Router({ mergeParams: true });

    /** List all blueprints of this kind */
    router.get('/', requireAdmin, (_req: any, res: any) => {
        try {
            const blueprints = listBlueprints(kind);
            return res.json({ blueprints });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /** Get one blueprint by id */
    router.get('/:blueprintId', requireAdmin, (req: any, res: any) => {
        try {
            const blueprint = getBlueprint(kind, req.params.blueprintId);
            return res.json(blueprint);
        } catch (err: any) {
            if (err.message?.includes('not found')) {
                return res.status(404).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }
    });

    /** Create or replace a blueprint */
    router.post('/', requireAdmin, (req: any, res: any) => {
        try {
            const body = req.body as BlueprintSchema;
            if (!body?.id) {
                return res.status(400).json({ error: 'Blueprint "id" is required' });
            }
            const blueprint = createBlueprint({ ...body, kind }, req.user);
            return res.status(201).json(blueprint);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    });

    /** Update a blueprint (partial) */
    router.patch('/:blueprintId', requireAdmin, (req: any, res: any) => {
        try {
            const { blueprintId } = req.params;
            const blueprint = updateBlueprint(kind, blueprintId, req.body, req.user);
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
            deleteBlueprint(kind, req.params.blueprintId, req.user);
            return res.status(204).send();
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }
    });

    return router;
}

const router: Router = Router();
router.use('/projects', createKindRouter('project'));
router.use('/models', createKindRouter('model'));
router.use('/structures', createKindRouter('structure'));
router.use('/templates', createKindRouter('template'));

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/blueprints/projects': {
        get: {
            summary: 'List project blueprints',
            tags: ['Blueprints'],
            responses: {
                '200': {
                    description: 'List of project blueprints',
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
            summary: 'Create a project blueprint',
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
    '/blueprints/projects/{blueprintId}': {
        get: {
            summary: 'Get a project blueprint by id',
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
            summary: 'Update a project blueprint',
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
            summary: 'Delete a project blueprint',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'Blueprint deleted' },
                '400': { description: 'Invalid id' }
            }
        }
    },
    '/blueprints/models': {
        get: {
            summary: 'List model blueprints',
            tags: ['Blueprints'],
            responses: {
                '200': {
                    description: 'List of model blueprints',
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
            summary: 'Create a model blueprint',
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
    '/blueprints/models/{blueprintId}': {
        get: {
            summary: 'Get a model blueprint by id',
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
            summary: 'Update a model blueprint',
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
            summary: 'Delete a model blueprint',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'Blueprint deleted' },
                '400': { description: 'Invalid id' }
            }
        }
    },
    '/blueprints/structures': {
        get: {
            summary: 'List structure blueprints',
            tags: ['Blueprints'],
            responses: {
                '200': {
                    description: 'List of structure blueprints',
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
            summary: 'Create a structure blueprint',
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
    '/blueprints/structures/{blueprintId}': {
        get: {
            summary: 'Get a structure blueprint by id',
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
            summary: 'Update a structure blueprint',
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
            summary: 'Delete a structure blueprint',
            tags: ['Blueprints'],
            parameters: [
                { name: 'blueprintId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'Blueprint deleted' },
                '400': { description: 'Invalid id' }
            }
        }
    },
    '/blueprints/templates': {
        get: {
            summary: 'List template blueprints',
            tags: ['Blueprints'],
            responses: {
                '200': {
                    description: 'List of template blueprints',
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
            summary: 'Create a template blueprint',
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
    '/blueprints/templates/{blueprintId}': {
        get: {
            summary: 'Get a template blueprint by id',
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
            summary: 'Update a template blueprint',
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
            summary: 'Delete a template blueprint',
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
            kind: {
                type: 'string',
                enum: ['project', 'model', 'structure', 'template'],
                description: 'Blueprint kind; set by route for create.'
            },
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
            },
            model: { $ref: '#/components/schemas/Model' },
            structure: { type: 'object' },
            template: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    description: { type: 'string' },
                    fields: { type: 'object', additionalProperties: true }
                }
            }
        }
    }
};

export default router;
