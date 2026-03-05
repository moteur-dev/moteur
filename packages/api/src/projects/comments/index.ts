import { Router } from 'express';
import {
    addComment,
    getComments,
    resolveComment,
    deleteComment,
    editComment
} from '@moteur/core/comments.js';
import type { CommentResourceType } from '@moteur/types/Comment.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../../middlewares/auth.js';

const RESOURCE_TYPES: CommentResourceType[] = ['entry', 'layout'];

const router: Router = Router({ mergeParams: true });

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    try {
        const { projectId } = req.params;
        const user = req.user;
        const body = req.body ?? {};
        const { resourceType, resourceId, fieldPath, blockId, parentId, body: commentBody } = body;
        if (
            !resourceType ||
            !resourceId ||
            commentBody == null ||
            String(commentBody).trim() === ''
        ) {
            return res.status(400).json({
                error: 'resourceType, resourceId, and body are required'
            });
        }
        if (!RESOURCE_TYPES.includes(resourceType as CommentResourceType)) {
            return res.status(400).json({
                error: `resourceType must be one of: ${RESOURCE_TYPES.join(', ')}`
            });
        }
        const comment = await addComment(projectId, user, {
            resourceType,
            resourceId,
            ...(fieldPath != null && { fieldPath: String(fieldPath) }),
            ...(blockId != null && { blockId: String(blockId) }),
            ...(parentId != null && { parentId: String(parentId) }),
            body: String(commentBody).trim()
        });
        return res.status(201).json(comment);
    } catch (err: any) {
        const status = err.message?.includes('not found') ? 404 : 400;
        return res.status(status).json({ error: err?.message ?? 'Failed to add comment' });
    }
});

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    try {
        const { projectId } = req.params;
        const resourceType = req.query.resourceType as string | undefined;
        const resourceId = req.query.resourceId as string | undefined;
        if (!resourceType || !resourceId) {
            return res.status(400).json({
                error: 'resourceType and resourceId query parameters are required'
            });
        }
        if (!RESOURCE_TYPES.includes(resourceType as CommentResourceType)) {
            return res.status(400).json({
                error: `resourceType must be one of: ${RESOURCE_TYPES.join(', ')}`
            });
        }
        const includeResolved =
            req.query.includeResolved === 'true' || req.query.includeResolved === true;
        const fieldPath = typeof req.query.fieldPath === 'string' ? req.query.fieldPath : undefined;
        const comments = await getComments(
            projectId,
            resourceType as CommentResourceType,
            resourceId,
            {
                includeResolved,
                ...(fieldPath !== undefined && { fieldPath })
            }
        );
        return res.json(comments);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get comments' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    try {
        const { projectId, id } = req.params;
        const user = req.user;
        const body = req.body?.body;
        if (body == null || String(body).trim() === '') {
            return res.status(400).json({ error: 'body is required' });
        }
        const comment = await editComment(projectId, user, id, String(body).trim());
        return res.json(comment);
    } catch (err: any) {
        const status = err.message?.includes('not found')
            ? 404
            : err.message?.includes('author')
              ? 403
              : 400;
        return res.status(status).json({ error: err?.message ?? 'Failed to edit comment' });
    }
});

router.post('/:id/resolve', requireProjectAccess, async (req: any, res: any) => {
    try {
        const { projectId, id } = req.params;
        const user = req.user;
        const comment = await resolveComment(projectId, user, id);
        return res.json(comment);
    } catch (err: any) {
        const status = err.message?.includes('not found') ? 404 : 400;
        return res.status(status).json({ error: err?.message ?? 'Failed to resolve comment' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    try {
        const { projectId, id } = req.params;
        const user = req.user;
        await deleteComment(projectId, user, id);
        return res.status(204).send();
    } catch (err: any) {
        const status = err.message?.includes('not found')
            ? 404
            : err.message?.includes('author') || err.message?.includes('admin')
              ? 403
              : 400;
        return res.status(status).json({ error: err?.message ?? 'Failed to delete comment' });
    }
});

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Comment: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            projectId: { type: 'string' },
            resourceType: { type: 'string', enum: RESOURCE_TYPES },
            resourceId: { type: 'string' },
            fieldPath: { type: 'string' },
            blockId: { type: 'string' },
            parentId: { type: 'string' },
            body: { type: 'string' },
            authorId: { type: 'string' },
            authorName: { type: 'string' },
            resolved: { type: 'boolean' },
            resolvedBy: { type: 'string' },
            resolvedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        }
    }
};

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/comments': {
        post: {
            summary: 'Create a comment',
            tags: ['Comments'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['resourceType', 'resourceId', 'body'],
                            properties: {
                                resourceType: { type: 'string', enum: RESOURCE_TYPES },
                                resourceId: { type: 'string' },
                                fieldPath: { type: 'string' },
                                blockId: { type: 'string' },
                                parentId: { type: 'string' },
                                body: { type: 'string' }
                            }
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Created comment',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Comment' } }
                    }
                },
                '400': { description: 'Bad request' },
                '404': { description: 'Not found' }
            }
        },
        get: {
            summary: 'List comments for a resource',
            tags: ['Comments'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                {
                    name: 'resourceType',
                    in: 'query',
                    required: true,
                    schema: { type: 'string', enum: RESOURCE_TYPES }
                },
                { name: 'resourceId', in: 'query', required: true, schema: { type: 'string' } },
                { name: 'fieldPath', in: 'query', schema: { type: 'string' } },
                {
                    name: 'includeResolved',
                    in: 'query',
                    schema: { type: 'boolean', default: false }
                }
            ],
            responses: {
                '200': {
                    description: 'List of comments',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Comment' }
                            }
                        }
                    }
                },
                '400': { description: 'Bad request' }
            }
        }
    },
    '/projects/{projectId}/comments/{id}': {
        patch: {
            summary: 'Edit a comment',
            tags: ['Comments'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['body'],
                            properties: { body: { type: 'string' } }
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Updated comment',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Comment' } }
                    }
                },
                '400': { description: 'Bad request' },
                '403': { description: 'Forbidden' },
                '404': { description: 'Not found' }
            }
        },
        delete: {
            summary: 'Delete a comment',
            tags: ['Comments'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '204': { description: 'No content' },
                '403': { description: 'Forbidden' },
                '404': { description: 'Not found' }
            }
        }
    },
    '/projects/{projectId}/comments/{id}/resolve': {
        post: {
            summary: 'Resolve a comment',
            tags: ['Comments'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': {
                    description: 'Resolved comment',
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/Comment' } }
                    }
                },
                '404': { description: 'Not found' }
            }
        }
    }
};

export default router;
