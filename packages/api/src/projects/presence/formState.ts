import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { formStateStore } from '@moteur/presence/FormStateStore';

const router: Router = Router({ mergeParams: true });

router.delete('/presence/form-state/:screenId', (req: any, res: any) => {
    const { screenId } = req.params;

    if (!screenId) {
        return res.status(400).json({ error: 'Missing screenId' });
    }

    formStateStore.clear(screenId);
    res.json({ success: true });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/presence/form-state/{screenId}': {
        delete: {
            summary: 'Clear form state for a specific screen',
            tags: ['Presence'],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                },
                {
                    name: 'screenId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Form state cleared',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean' }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Missing screenId',
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
