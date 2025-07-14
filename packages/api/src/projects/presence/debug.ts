import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { formStateStore } from '@moteur/presence/FormStateStore.js';
import { presenceStore } from '@moteur/presence/PresenceStore.js';

const router: Router = Router({ mergeParams: true });

router.get('/:projectId/presence/debug', (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });

    const presence = presenceStore.getByProject(projectId);

    // Get all screenIds mentioned in presence for this project
    const screenIds = new Set<string>();
    for (const p of presence) {
        if (p.screenId) screenIds.add(p.screenId);
    }

    const formState: Record<string, Record<string, string>> = {};
    for (const screenId of screenIds) {
        formState[screenId] = formStateStore.get(screenId);
    }

    res.json({ presence, formState });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/presence/debug': {
        get: {
            summary: 'Inspect presence and form state in a project',
            tags: ['Presence'],
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
                    description: 'Active presence and form state',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    presence: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Presence' }
                                    },
                                    formState: {
                                        type: 'object',
                                        additionalProperties: {
                                            type: 'object',
                                            additionalProperties: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Missing projectId',
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
