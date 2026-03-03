import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../middlewares/auth.js';
import { getProjectUsers } from '@moteur/core/users.js';

const router: Router = Router({ mergeParams: true });

router.get('/:projectId/users', requireProjectAccess, (req: any, res: any) => {
    const { projectId } = req.params;

    if (!projectId) {
        return res.status(400).json({ error: 'Missing projectId' });
    }

    try {
        const users = getProjectUsers(projectId);
        return res.json({ users });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/users': {
        get: {
            summary: 'List users with access to a project',
            tags: ['Users'],
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
                    description: 'List of users for the project',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    users: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/User' }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Missing project ID',
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
                },
                '500': {
                    description: 'Internal server error'
                }
            }
        }
    }
};

export default router;
