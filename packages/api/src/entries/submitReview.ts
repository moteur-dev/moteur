import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { submitForReview } from '@moteur/core/reviews.js';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.post('/:entryId/submit-review', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId, entryId } = req.params;
    if (!projectId || !modelId || !entryId) {
        return res.status(400).json({ error: 'Missing path parameters' });
    }
    const assignedTo = req.body?.assignedTo as string | undefined;
    try {
        const review = await submitForReview(req.user!, projectId, modelId, entryId, assignedTo);
        return res.status(201).json(review);
    } catch (err: any) {
        const status =
            err.message?.includes('not enabled') || err.message?.includes('already has a pending')
                ? 400
                : err.message?.includes('not found')
                  ? 404
                  : 403;
        return res.status(status).json({ error: err?.message ?? 'Failed to submit for review' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries/{entryId}/submit-review': {
        post: {
            summary: 'Submit an entry for review',
            tags: ['Reviews'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: { assignedTo: { type: 'string', description: 'User ID of assigned reviewer' } }
                        }
                    }
                }
            },
            responses: {
                '201': { description: 'Review created', content: { 'application/json': { schema: { type: 'object' } } } },
                '400': { description: 'Workflow not enabled or already pending' },
                '404': { description: 'Entry not found' }
            }
        }
    }
};

export default router;
