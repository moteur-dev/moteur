import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth';
import { updateProject } from '@moteur/core/projects';
import { validateProject } from '@moteur/core/validators/validateProject';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.patch('/:projectId', requireAdmin, (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({ error: 'Missing projectId in path' });
    }

    const validation = validateProject(req.body);
    if (!validation.valid) {
        return res.status(400).json({ validation: validation.issues, error: 'Validation failed' });
    }

    try {
        const project = updateProject(req.user!, projectId, req.body);
        return res.json(project);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}': {
        patch: {
            summary: 'Update a project',
            tags: ['Projects'],
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
                        schema: { $ref: '#/components/schemas/UpdateProjectInput' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Project updated',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Project' }
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
