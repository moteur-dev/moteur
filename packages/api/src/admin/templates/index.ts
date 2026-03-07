import { Router } from 'express';
import {
    listTemplates,
    getTemplateWithAuth as getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateTemplateById
} from '@moteur/core/templates.js';
import { getBlueprint } from '@moteur/core/blueprints.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const templates = await listTemplates(projectId);
        return res.json(templates);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list templates' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const template = await getTemplate(req.user!, projectId, id);
        return res.json(template);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Template not found' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const body = req.body as Record<string, unknown>;
        let data: Parameters<typeof createTemplate>[2];

        if (body.blueprintId) {
            const blueprint = getBlueprint('template', body.blueprintId as string);
            if ((blueprint.kind ?? 'project') !== 'template') {
                return res.status(400).json({ error: 'Blueprint is not a template blueprint' });
            }
            const t = blueprint.template as
                | {
                      template?: {
                          id?: string;
                          label: string;
                          description?: string;
                          fields?: Record<string, unknown>;
                      };
                  }
                | undefined;
            if (!t?.template) {
                return res.status(400).json({ error: 'Blueprint has no template.template' });
            }
            const { blueprintId: _b, ...overrides } = body;
            const merged = { ...t.template, ...overrides };
            const id =
                (merged.id as string) ??
                ((merged.label as string)?.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() ||
                    'template');
            data = { ...merged, id, projectId } as Parameters<typeof createTemplate>[2];
        } else {
            data = { ...body, projectId } as Parameters<typeof createTemplate>[2];
        }

        const template = await createTemplate(projectId, req.user!, data);
        return res.status(201).json(template);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to create template' });
    }
});

router.put('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const template = await updateTemplate(projectId, req.user!, id, req.body);
        return res.json(template);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to update template' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const template = await updateTemplate(projectId, req.user!, id, req.body);
        return res.json(template);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to patch template' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deleteTemplate(projectId, req.user!, id);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Template not found' });
    }
});

router.post('/:id/validate', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const result = await validateTemplateById(projectId, id);
        return res.json(result);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Template not found' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/templates': {
        get: {
            summary: 'List templates (admin)',
            tags: ['Templates (Admin)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'List of templates' } }
        },
        post: {
            summary: 'Create template (admin)',
            tags: ['Templates (Admin)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '201': { description: 'Template created' } }
        }
    },
    '/admin/projects/{projectId}/templates/{id}': {
        get: {
            summary: 'Get template (admin)',
            tags: ['Templates (Admin)'],
            responses: { '200': { description: 'Template' } }
        },
        put: {
            summary: 'Replace template (admin)',
            tags: ['Templates (Admin)'],
            responses: { '200': { description: 'Template updated' } }
        },
        patch: {
            summary: 'Patch template (admin)',
            tags: ['Templates (Admin)'],
            responses: { '200': { description: 'Template updated' } }
        },
        delete: {
            summary: 'Delete template (admin)',
            tags: ['Templates (Admin)'],
            responses: { '204': { description: 'Deleted' } }
        }
    },
    '/admin/projects/{projectId}/templates/{id}/validate': {
        post: {
            summary: 'Validate template (admin)',
            tags: ['Templates (Admin)'],
            responses: { '200': { description: 'Validation result' } }
        }
    }
};

export default router;
