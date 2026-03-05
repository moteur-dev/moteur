import { Router } from 'express';
import { getProjectLog, getLog } from '@moteur/core/activityLogger.js';
import type { ActivityResourceType } from '@moteur/types/Activity.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../../middlewares/auth.js';

const RESOURCE_TYPES: ActivityResourceType[] = [
    'entry',
    'layout',
    'page',
    'structure',
    'model',
    'project',
    'user',
    'blueprint'
];

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const limit = req.query.limit != null ? Math.min(Number(req.query.limit), 200) : 50;
    try {
        const events = await getProjectLog(projectId, limit);
        return res.json({ events });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to load activity' });
    }
});

router.get('/:resourceType/:resourceId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, resourceType, resourceId } = req.params;
    if (!RESOURCE_TYPES.includes(resourceType as ActivityResourceType)) {
        return res.status(400).json({
            error: `Invalid resourceType. Must be one of: ${RESOURCE_TYPES.join(', ')}`
        });
    }
    try {
        const events = await getLog(projectId, resourceType as ActivityResourceType, resourceId);
        return res.json({ events });
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to load activity' });
    }
});

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    ActivityEvent: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            projectId: { type: 'string' },
            resourceType: { type: 'string', enum: RESOURCE_TYPES },
            resourceId: { type: 'string' },
            action: {
                type: 'string',
                enum: ['created', 'updated', 'deleted', 'published', 'unpublished']
            },
            userId: { type: 'string' },
            userName: { type: 'string' },
            fieldPath: { type: 'string' },
            before: {},
            after: {},
            timestamp: { type: 'string', format: 'date-time' }
        }
    }
};

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/activity': {
        get: {
            summary: 'Get recent activity for a project',
            tags: ['Activity'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
            ],
            responses: {
                '200': {
                    description: 'List of activity events (newest first)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    events: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ActivityEvent' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    '/projects/{projectId}/activity/{resourceType}/{resourceId}': {
        get: {
            summary: 'Get activity for a specific resource',
            tags: ['Activity'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                {
                    name: 'resourceType',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', enum: RESOURCE_TYPES }
                },
                { name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'List of activity events for the resource (newest first)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    events: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ActivityEvent' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default router;
