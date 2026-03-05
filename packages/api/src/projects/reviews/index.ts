import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { getReviews, getReview, approveReview, rejectReview } from '@moteur/core/reviews.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const modelId = req.query.modelId as string | undefined;
    const entryId = req.query.entryId as string | undefined;
    const status = req.query.status as string | undefined;
    try {
        const reviews = await getReviews(projectId, {
            ...(modelId && { modelId }),
            ...(entryId && { entryId }),
            ...(status &&
                (status === 'pending' || status === 'approved' || status === 'rejected') && {
                    status: status as 'pending' | 'approved' | 'rejected'
                })
        });
        return res.json({ reviews });
    } catch {
        return res.status(500).json({ error: 'Failed to list reviews' });
    }
});

router.get('/:reviewId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, reviewId } = req.params;
    try {
        const review = await getReview(projectId, reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });
        return res.json({ review });
    } catch {
        return res.status(500).json({ error: 'Failed to get review' });
    }
});

router.post('/:reviewId/approve', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, reviewId } = req.params;
    try {
        const review = await approveReview(projectId, req.user!, reviewId);
        return res.json({ review });
    } catch (err: any) {
        const status =
            err.message?.includes('reviewer') || err.message?.includes('admin')
                ? 403
                : err.message?.includes('not found') || err.message?.includes('not pending')
                  ? 400
                  : 500;
        return res.status(status).json({ error: err?.message ?? 'Failed to approve review' });
    }
});

router.post('/:reviewId/reject', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, reviewId } = req.params;
    const reason = req.body?.reason as string | undefined;
    try {
        const review = await rejectReview(
            projectId,
            req.user!,
            reviewId,
            typeof reason === 'string' ? reason : 'Rejected without comment.'
        );
        return res.json({ review });
    } catch (err: any) {
        const status =
            err.message?.includes('reviewer') || err.message?.includes('admin')
                ? 403
                : err.message?.includes('not found') || err.message?.includes('not pending')
                  ? 400
                  : 500;
        return res.status(status).json({ error: err?.message ?? 'Failed to reject review' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/reviews': {
        get: {
            summary: 'List reviews',
            tags: ['Reviews'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'query', schema: { type: 'string' } },
                { name: 'entryId', in: 'query', schema: { type: 'string' } },
                {
                    name: 'status',
                    in: 'query',
                    schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] }
                }
            ],
            responses: {
                '200': {
                    description: 'List of reviews',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    reviews: { type: 'array', items: { type: 'object' } }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/projects/{projectId}/reviews/{reviewId}': {
        get: {
            summary: 'Get a review',
            tags: ['Reviews'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Review',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { review: { type: 'object' } }
                            }
                        }
                    }
                },
                '404': { description: 'Review not found' }
            }
        }
    },
    '/projects/{projectId}/reviews/{reviewId}/approve': {
        post: {
            summary: 'Approve a review (reviewer or admin only)',
            tags: ['Reviews'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Approved review',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { review: { type: 'object' } }
                            }
                        }
                    }
                },
                '403': { description: 'Reviewer or admin role required' },
                '400': { description: 'Review not found or not pending' }
            }
        }
    },
    '/projects/{projectId}/reviews/{reviewId}/reject': {
        post: {
            summary: 'Reject a review (reviewer or admin only); reason becomes a Comment',
            tags: ['Reviews'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'reviewId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: { reason: { type: 'string' } }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Rejected review',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { review: { type: 'object' } }
                            }
                        }
                    }
                },
                '403': { description: 'Reviewer or admin role required' },
                '400': { description: 'Review not found or not pending' }
            }
        }
    }
};

export default router;
