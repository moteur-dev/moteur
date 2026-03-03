import { Router } from 'express';
import type { Request, Response } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { mergePluginSpecs } from './utils/mergePluginSpecs.js';

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
    },
    Presence: {
        type: 'object',
        properties: {
            userId: { type: 'string' },
            name: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            projectId: { type: 'string' },
            screenId: { type: 'string', nullable: true },
            entryId: { type: 'string', nullable: true },
            fieldPath: { type: 'string', nullable: true },
            typing: { type: 'boolean', nullable: true },
            textPreview: { type: 'string', nullable: true },
            cursor: {
                type: 'object',
                nullable: true,
                properties: {
                    x: { type: 'number' },
                    y: { type: 'number' }
                }
            },
            updatedAt: { type: 'number' }
        },
        required: ['userId', 'name', 'projectId', 'updatedAt']
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

const router: Router = Router();

router.get('/openapi.json', async (req: Request, res: Response) => {
    const mergedSpec = await mergePluginSpecs(baseSpec);
    res.json(mergedSpec);
});

export default router;
