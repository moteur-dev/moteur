import express, { Router } from 'express';
import { BlockRegistry } from '@moteur/core/registry/BlockRegistry.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = express.Router();
const registry = new BlockRegistry();

// GET all block types
router.get('/', (req, res) => {
    res.json(registry.all());
});

// GET one block type
router.get('/:id', (req, res) => {
    console.log(req.params.id);
    res.json(registry.get(req.params.id));
});

// POST new block type
router.post('/', (req, res) => {
    res.status(201).json(req.body);
});

// PUT (replace) block type
router.put('/:id', (req, res) => {
    res.json({ replaced: true, ...req.body });
});

// PATCH (partial update)
router.patch('/:id', (req, res) => {
    res.json({ patched: true, ...req.body });
});

// DELETE
router.delete('/:id', (req, res) => {
    res.status(204).send();
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/admin/projects/{projectId}/blocks': {
        get: {
            summary: 'List block types',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Block registry' } }
        },
        post: {
            summary: 'Register block type',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '201': { description: 'Block registered' } }
        }
    },
    '/admin/projects/{projectId}/blocks/{id}': {
        get: {
            summary: 'Get block type',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '200': { description: 'Block schema' } }
        },
        put: {
            summary: 'Replace block type',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Block updated' } }
        },
        patch: {
            summary: 'Patch block type',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Block updated' } }
        },
        delete: {
            summary: 'Unregister block type',
            tags: ['Admin Blocks'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { '204': { description: 'Deleted' } }
        }
    }
};

export default router;
