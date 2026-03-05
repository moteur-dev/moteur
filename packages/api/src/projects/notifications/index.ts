import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { getNotifications, markRead, markAllRead } from '@moteur/core/notifications.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const unreadOnly = req.query.unreadOnly !== 'false' && req.query.unreadOnly !== '0';
    try {
        const notifications = await getNotifications(projectId, userId, unreadOnly);
        return res.json(notifications);
    } catch {
        return res.status(500).json({ error: 'Failed to get notifications' });
    }
});

router.post('/read-all', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const userId = req.user!.id;
    try {
        await markAllRead(projectId, userId);
        return res.status(204).send();
    } catch {
        return res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

router.post('/:id/read', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    const userId = req.user!.id;
    try {
        const notification = await markRead(projectId, userId, id);
        return res.json(notification);
    } catch (err: any) {
        return res.status(err.message?.includes('not found') ? 404 : 400).json({
            error: err?.message ?? 'Failed to mark as read'
        });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/notifications': {
        get: {
            summary: 'List notifications for current user (default unread only)',
            tags: ['Notifications'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'unreadOnly', in: 'query', schema: { type: 'boolean', default: true } }
            ],
            responses: {
                '200': {
                    description: 'List of notifications',
                    content: {
                        'application/json': { schema: { type: 'array', items: { type: 'object' } } }
                    }
                }
            }
        }
    },
    '/projects/{projectId}/notifications/{id}/read': {
        post: {
            summary: 'Mark a notification as read',
            tags: ['Notifications'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Notification',
                    content: { 'application/json': { schema: { type: 'object' } } }
                },
                '404': { description: 'Notification not found' }
            }
        }
    },
    '/projects/{projectId}/notifications/read-all': {
        post: {
            summary: 'Mark all notifications as read for current user',
            tags: ['Notifications'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'All marked as read' }
            }
        }
    }
};

export default router;
