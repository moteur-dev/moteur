import { Router } from 'express';
import { requireProjectAccess } from '../middlewares/auth';
import { getProject } from '@moteur/core/projects';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.get('/:projectId', requireProjectAccess, (req: any, res: any) => {
    const { projectId } = req.params;
    const user = req.user;
    const project = getProject(user, projectId);

    if (!project || !project.id) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}': {
        get: {
            summary: 'Get a single project by ID',
            tags: ['Projects'],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'The requested project',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    project: { $ref: '#/components/schemas/Project' }
                                }
                            }
                        }
                    }
                },
                '404': {
                    description: 'Project not found',
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
