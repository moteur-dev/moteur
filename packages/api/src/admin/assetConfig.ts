import { Router } from 'express';
import { getAssetConfig, updateAssetConfig } from '@moteur/core/assets/assetService.js';
import { requireProjectAccess } from '../middlewares/auth.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const config = await getAssetConfig(projectId, req.user!);
        return res.json(config);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get asset config' });
    }
});

router.patch('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const config = await updateAssetConfig(projectId, req.user!, req.body);
        return res.json(config);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Update failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/asset-config': {
        get: {
            summary: 'Get asset config',
            tags: ['Admin Asset Config'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Asset config' } }
        },
        patch: {
            summary: 'Update asset config',
            tags: ['Admin Asset Config'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Config updated' } }
        }
    }
};

export default router;
