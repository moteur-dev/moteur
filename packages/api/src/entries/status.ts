import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { getEntry, updateEntry } from '@moteur/core/entries.js';
import type { EntryStatus } from '@moteur/types/Model.js';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

const VALID_STATUSES: EntryStatus[] = ['draft', 'in_review', 'published', 'unpublished'];

router.patch('/:entryId/status', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId, entryId } = req.params;
    if (!projectId || !modelId || !entryId) {
        return res.status(400).json({ error: 'Missing path parameters' });
    }
    const status = req.body?.status as string | undefined;
    if (!status || !VALID_STATUSES.includes(status as EntryStatus)) {
        return res.status(400).json({
            error: `status must be one of: ${VALID_STATUSES.join(', ')}`
        });
    }
    try {
        const entry = await updateEntry(req.user!, projectId, modelId, entryId, {
            status: status as EntryStatus
        });
        return res.json(entry);
    } catch (err: any) {
        const statusCode = err.message?.includes('requires an approved review')
            ? 403
            : err.message?.includes('not found')
              ? 404
              : 400;
        return res.status(statusCode).json({
            error: err?.message ?? 'Failed to update entry status'
        });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries/{entryId}/status': {
        patch: {
            summary:
                'Update entry status (admin can bypass review; others require approval for published)',
            tags: ['Entries'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'modelId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'entryId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['status'],
                            properties: {
                                status: { type: 'string', enum: VALID_STATUSES }
                            }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Entry updated',
                    content: { 'application/json': { schema: { type: 'object' } } }
                },
                '403': {
                    description:
                        'Publishing requires approved review when workflow.requireReview is enabled'
                },
                '404': { description: 'Entry not found' }
            }
        }
    }
};

export default router;
