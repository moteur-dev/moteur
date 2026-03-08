import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { listForms, getForm, createForm, updateForm, deleteForm } from '@moteur/core/forms.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import submissionsRouter, { openapi as submissionsOpenapi } from './submissions.js';
import { mergePathSpecs } from '../../utils/mergePathSpecs.js';

const router: Router = Router({ mergeParams: true });

router.use('/:formId/submissions', submissionsRouter);

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const forms = await listForms(req.user!, projectId);
        return res.json({ forms });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list forms' });
    }
});

router.get('/:formId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId } = req.params;
    if (!projectId || !formId) {
        return res.status(400).json({ error: 'Missing projectId or formId' });
    }
    try {
        const form = await getForm(req.user!, projectId, formId);
        return res.json({ form });
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 500;
        return res.status(code).json({ error: err?.message ?? 'Failed to get form' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const body = req.body ?? {};
        const { createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = body;
        const form = await createForm(req.user!, projectId, rest as any);
        return res.status(201).json({ form });
    } catch (err: any) {
        const msg = err?.message ?? 'Failed to create form';
        const isValidation =
            msg.includes('Invalid') || msg.includes('already exists') || msg.includes('required');
        return res.status(isValidation ? 422 : 400).json({ error: msg });
    }
});

router.patch('/:formId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId } = req.params;
    if (!projectId || !formId) {
        return res.status(400).json({ error: 'Missing projectId or formId' });
    }
    try {
        const patch = req.body ?? {};
        const form = await updateForm(req.user!, projectId, formId, patch);
        return res.json({ form });
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to update form' });
    }
});

router.delete('/:formId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, formId } = req.params;
    if (!projectId || !formId) {
        return res.status(400).json({ error: 'Missing projectId or formId' });
    }
    try {
        await deleteForm(req.user!, projectId, formId);
        return res.status(204).send();
    } catch (err: any) {
        const code = err?.message?.includes('not found') ? 404 : 400;
        return res.status(code).json({ error: err?.message ?? 'Failed to delete form' });
    }
});

const formsOpenapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/forms': {
        get: {
            summary: 'List forms',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: '{ forms }' } }
        },
        post: {
            summary: 'Create form',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                label: { type: 'string' },
                                description: { type: 'string' },
                                fields: { type: 'object' },
                                status: { type: 'string', enum: ['active', 'inactive', 'archived'] }
                            }
                        }
                    }
                }
            },
            responses: {
                '201': { description: '{ form }' },
                '422': { description: 'Validation failed' }
            }
        }
    },
    '/admin/projects/{projectId}/forms/{formId}': {
        get: {
            summary: 'Get one form (full schema)',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: '{ form }' }, '404': { description: 'Not found' } }
        },
        patch: {
            summary: 'Update form',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': { description: '{ form }' },
                '404': { description: 'Not found' }
            }
        },
        delete: {
            summary: 'Soft-delete form',
            tags: ['Admin Forms'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found' } }
        }
    }
};

export const openapi = mergePathSpecs(formsOpenapi, submissionsOpenapi);

export default router;
