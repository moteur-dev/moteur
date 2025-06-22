import { Router } from 'express';
import type { Request, Response } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { mergePluginSpecs } from '@moteur/core/utils/mergePluginSpecs';

const baseSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            roles: {
                type: 'array',
                items: { type: 'string' }
            },
            projects: {
                type: 'array',
                items: { type: 'string' }
            },
            isActive: { type: 'boolean' }
        }
    },
    Project: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            description: { type: 'string' },
            plugins: {
                type: 'array',
                items: { type: 'string' }
            }
        }
    },
    Model: {
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
    },
    Field: {
        type: 'object',
        required: ['type'],
        properties: {
            type: { type: 'string' },
            label: { type: 'string' },
            required: { type: 'boolean' },
            options: {
                type: 'object',
                additionalProperties: true
            },
            meta: {
                type: 'object',
                additionalProperties: true
            }
        }
    },
    ValidationResult: {
        type: 'object',
        required: ['valid', 'errors'],
        properties: {
            valid: { type: 'boolean', example: false },
            errors: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['field', 'message'],
                    properties: {
                        field: { type: 'string' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }
};

// You can dynamically generate this if needed
export const baseSpec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'Moteur API',
        version: '1.0.0',
        description: 'REST API for the Moteur content engine'
    },
    paths: {}, // plugins and core will add to this
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        },
        schemas: baseSchemas
    },
    security: [{ bearerAuth: [] }]
};

const router = Router();

router.get('/openapi.json', async (req: Request, res: Response) => {
    const mergedSpec = await mergePluginSpecs(baseSpec);
    res.json(mergedSpec);
});

export default router;
