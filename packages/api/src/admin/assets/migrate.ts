import { Router } from 'express';
import { migrateProvider } from '@moteur/core/assets/assetService.js';
import { requireAuth } from '../../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/assets/migrate-provider': {
        post: {
            summary: 'Migrate assets between storage providers',
            description: 'Migrate assets from one storage provider to another (e.g. local to Mux). Requires admin auth.',
            tags: ['Admin Assets'],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                fromProvider: { type: 'string' },
                                toProvider: { type: 'string', description: 'Target provider (required)' },
                                projectIds: { type: 'array', items: { type: 'string' } },
                                keepLocalCopy: { type: 'boolean' }
                            },
                            required: ['toProvider']
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Migration result' },
                '400': { description: 'Missing toProvider' },
                '500': { description: 'Migration failed' }
            }
        }
    }
};

router.post('/migrate-provider', requireAuth, async (req: any, res: any) => {
    try {
        const body = req.body ?? {};
        const fromProvider = body.fromProvider;
        const toProvider = body.toProvider;
        const projectIds = body.projectIds;
        const keepLocalCopy = body.keepLocalCopy;
        if (!toProvider) return res.status(400).json({ error: 'Missing toProvider' });
        const result = await migrateProvider(req.user!, {
            fromProvider,
            toProvider,
            projectIds,
            keepLocalCopy
        });
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: (err as Error)?.message ?? 'Migration failed' });
    }
});

export default router;
