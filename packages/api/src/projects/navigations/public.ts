import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import {
    listNavigations,
    getNavigationByHandle,
    resolveNavigation
} from '@moteur/core/navigations.js';

const router: Router = Router({ mergeParams: true });

/** GET /projects/:projectId/navigations — all navigations resolved */
router.get('/', async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const list = await listNavigations(projectId);
        const resolved = await Promise.all(
            list.map(nav => resolveNavigation(projectId, nav))
        );
        return res.json(resolved);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get navigations' });
    }
});

/** GET /projects/:projectId/navigations/:handle — one navigation by handle, resolved */
router.get('/:handle', async (req: any, res: any) => {
    const { projectId, handle } = req.params;
    if (!projectId || !handle) return res.status(400).json({ error: 'Missing projectId or handle' });
    try {
        const nav = await getNavigationByHandle(projectId, handle);
        if (!nav) return res.status(404).json({ error: 'Navigation not found' });
        const resolved = await resolveNavigation(projectId, nav);
        return res.json(resolved);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get navigation' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/navigations': {
        get: {
            summary: 'Get all navigations (resolved)',
            tags: ['Navigations'],
            parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'ResolvedNavigation[]' } }
        }
    },
    '/projects/{projectId}/navigations/{handle}': {
        get: {
            summary: 'Get navigation by handle (resolved)',
            tags: ['Navigations'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'handle', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'ResolvedNavigation' }, '404': { description: 'Handle not found' } }
        }
    }
};

export default router;
