import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { requireAdmin } from '../middlewares/auth.js';
import { getUsageCounts } from '../usage/usageStore.js';

const router: Router = Router();

router.get('/', requireAdmin, (_req, res) => {
    const counts = getUsageCounts();
    res.json(counts);
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/usage': {
        get: {
            summary: 'Get API request counts (admin and public)',
            tags: ['Admin Usage'],
            responses: {
                '200': {
                    description:
                        'admin: { total, windowStart }, public: { byProject: { [projectId]: { total, windowStart } } }'
                }
            }
        }
    }
};

export default router;
