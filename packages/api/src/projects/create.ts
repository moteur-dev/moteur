import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { createProject } from '@moteur/core/projects';
import { validateProject } from '@moteur/core/validators/validateProject';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.post('/', requireAuth, (req: any, res: any) => {
    try {
        const validation = validateProject(req.body);
        if (!validation.valid) {
            return res
                .status(400)
                .json({ validation: validation.issues, error: 'Validation failed' });
        }
        const project = createProject(req.user!, req.body);
        return res.status(201).json(project);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects': {
        post: {
            summary: 'Create a new project',
            tags: ['Projects'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/Project' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Project successfully created',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/NewProjectInput' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failed or bad input',
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
    NewProjectInput: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            description: { type: 'string' },
            locale: { type: 'string' },
            modules: {
                type: 'array',
                items: { type: 'string' }
            },
            plugins: {
                type: 'array',
                items: { type: 'string' }
            }
        }
    }
};

export default router;
