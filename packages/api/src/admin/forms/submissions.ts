import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { listSubmissions, getSubmission, deleteSubmission } from '@moteur/core/formSubmissions.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId } = req.params;
    if (!projectId || !formId) {
        return res.status(400).json({ error: 'Missing projectId or formId' });
    }
    try {
        const status = req.query.status as string | undefined;
        const limitRaw = req.query.limit;
        const limit =
            limitRaw !== undefined
                ? Math.min(Math.max(0, parseInt(String(limitRaw), 10) || 50), 500)
                : 50;
        const submissions = await listSubmissions(req.user!, projectId, formId, {
            status: status as any,
            limit
        });
        return res.json({ submissions });
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 500;
        return res.status(code).json({ error: err?.message ?? 'Failed to list submissions' });
    }
});

router.get('/:submissionId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId, submissionId } = req.params;
    if (!projectId || !formId || !submissionId) {
        return res.status(400).json({ error: 'Missing projectId, formId or submissionId' });
    }
    try {
        const submission = await getSubmission(req.user!, projectId, formId, submissionId);
        return res.json({ submission });
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 500;
        return res.status(code).json({ error: err?.message ?? 'Failed to get submission' });
    }
});

router.delete('/:submissionId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId, submissionId } = req.params;
    if (!projectId || !formId || !submissionId) {
        return res.status(400).json({ error: 'Missing projectId, formId or submissionId' });
    }
    try {
        await deleteSubmission(req.user!, projectId, formId, submissionId);
        return res.status(204).send();
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to delete submission' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/forms/{formId}/submissions': {
        get: {
            summary: 'List form submissions',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'status', in: 'query', schema: { type: 'string' } },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
            ],
            responses: {
                '200': { description: '{ submissions }' },
                '404': { description: 'Not found' }
            }
        }
    },
    '/admin/projects/{projectId}/forms/{formId}/submissions/{submissionId}': {
        get: {
            summary: 'Get one submission',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': { description: '{ submission }' },
                '404': { description: 'Not found' }
            }
        },
        delete: {
            summary: 'Soft-delete submission',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } }
        }
    }
};

export default router;
