import { Router } from 'express';
import { getGlobalLog } from '@moteur/core/activityLogger.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireAdmin } from '../middlewares/auth.js';

const router: Router = Router();

router.get('/', requireAdmin, async (req: any, res: any) => {
    const limit = req.query.limit != null ? Math.min(Number(req.query.limit), 200) : 50;
    try {
        const events = await getGlobalLog(limit);
        return res.json({ events });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to load activity' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/activity': {
        get: {
            summary: 'Get recent global (system) activity',
            description: 'User and blueprint changes. Admin only.',
            tags: ['Activity'],
            parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }],
            responses: {
                '200': {
                    description: 'List of activity events (newest first)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    events: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ActivityEvent' }
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
