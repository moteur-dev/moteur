import { Router } from 'express';
import { listEntries } from '@moteur/core/entries.js';
import { getModelSchema } from '@moteur/core/models.js';
import { resolveEntryAssets } from '@moteur/core/assets/assetResolver.js';
import { resolveEntryUrl } from '@moteur/core/pages.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId } = req.params;

    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'Missing projectId or modelId in path' });
    }

    try {
        let entries = await listEntries(req.user!, projectId, modelId);
        if (req.query.resolveAssets === '1') {
            const schema = await getModelSchema(req.user!, projectId, modelId);
            entries = await Promise.all(entries.map(e => resolveEntryAssets(projectId, e, schema)));
        }
        if (req.query.resolveUrl === '1') {
            entries = await Promise.all(
                entries.map(async e => {
                    const url = await resolveEntryUrl(projectId, e.id, modelId);
                    return { ...e, ...(url != null && { resolvedUrl: url }) };
                })
            );
        }
        return res.json({ entries });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries': {
        get: {
            summary: 'List entries for a model',
            tags: ['Entries'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'List of entries',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    entries: {
                                        type: 'array',
                                        items: { type: 'object' }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Missing parameters',
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
