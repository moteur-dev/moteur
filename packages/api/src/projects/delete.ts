import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth';
import { deleteProject } from '@moteur/core/projects';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.delete('/:projectId', requireAdmin, (req: any, res: any) => {
    const { projectId } = req.params;

    try {
        deleteProject(req.user!, projectId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(404).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}': {
        delete: {
            summary: 'Delete a project',
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
                '204': {
                    description: 'Project deleted successfully'
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
