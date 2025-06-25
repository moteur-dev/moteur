import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth';
import { listProjects } from '@moteur/core/projects';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.get('/', requireAdmin, (req: any, res: any) => {
    const user = req.user;
    const projects = listProjects(user);
    res.json({ projects });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects': {
        get: {
            summary: 'List all accessible projects',
            tags: ['Projects'],
            responses: {
                '200': {
                    description: 'List of projects',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    projects: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Project' }
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
