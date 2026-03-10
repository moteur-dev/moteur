import { Router, Request, Response } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { getAdapter } from '@moteur/ai';
import { requireAuth } from '../middlewares/auth.js';

const router: Router = Router();

/**
 * GET /ai/status — Returns whether AI is enabled (provider configured).
 * Used by Studio to hide AI buttons when disabled. Requires auth.
 */
router.get('/status', requireAuth, async (_req: Request, res: Response) => {
    const adapter = await getAdapter();
    res.json({ enabled: !!adapter });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/status': {
        get: {
            summary: 'Check if AI is enabled',
            tags: ['AI'],
            description: 'Returns whether an AI provider is configured. Studio uses this to show or hide AI features.',
            responses: {
                '200': {
                    description: 'AI status',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { enabled: { type: 'boolean' } },
                                required: ['enabled']
                            }
                        }
                    }
                }
            }
        }
    }
};

export default router;
