import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import {
    generateKey,
    rotateKey,
    revokeKey
} from '@moteur/core/projectApiKey.js';
import { getProject } from '@moteur/core/projects.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.post('/generate', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const { rawKey, prefix } = await generateKey(projectId, req.user!);
        return res.status(201).json({
            prefix,
            rawKey,
            message: 'Store this key securely. It will not be shown again.'
        });
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to generate API key' });
    }
});

router.post('/rotate', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const { rawKey, prefix } = await rotateKey(projectId, req.user!);
        return res.json({
            prefix,
            rawKey,
            message: 'Store this key securely. It will not be shown again.'
        });
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to rotate API key' });
    }
});

router.delete('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        await revokeKey(projectId, req.user!);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to revoke API key' });
    }
});

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const project = await getProject(req.user!, projectId);
        if (!project.apiKey) {
            return res.json({ prefix: null, createdAt: null });
        }
        return res.json({
            prefix: project.apiKey.prefix,
            createdAt: project.apiKey.createdAt
        });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get API key info' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/api-key/generate': {
        post: {
            summary: 'Generate project API key',
            tags: ['Admin API Key'],
            parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: {
                '201': {
                    description: 'Returns rawKey (once) and prefix',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    prefix: { type: 'string' },
                                    rawKey: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/admin/projects/{projectId}/api-key/rotate': {
        post: {
            summary: 'Rotate project API key',
            tags: ['Admin API Key'],
            parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'New rawKey and prefix' } }
        }
    },
    '/admin/projects/{projectId}/api-key': {
        get: {
            summary: 'Get API key metadata (prefix and createdAt only)',
            tags: ['Admin API Key'],
            parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '200': { description: 'prefix, createdAt' } }
        },
        delete: {
            summary: 'Revoke API key',
            tags: ['Admin API Key'],
            parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
            responses: { '204': { description: 'Revoked' } }
        }
    }
};

export default router;
