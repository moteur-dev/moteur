import express, { Router } from 'express';
import { BlockRegistry } from '@moteur/core/registry/BlockRegistry.js';
import { createBlock } from '@moteur/core/blocks.js';
import { stripVariantHintsFromBlockSchema } from '../utils/stripBlockSchema.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = express.Router();
const registry = new BlockRegistry();

// GET /api/moteur/blocks — variantHints stripped from public response
router.get('/', (_req, res) => {
    const all = registry.all();
    const stripped = Object.fromEntries(
        Object.entries(all).map(([k, v]) => [
            k,
            stripVariantHintsFromBlockSchema(v as unknown as Record<string, unknown>)
        ])
    );
    res.json(stripped);
});

// POST /api/moteur/blocks
router.post('/', (req: any, res: any) => {
    try {
        const schema = req.body;
        if (!schema || typeof schema !== 'object') {
            return res.status(400).json({ error: 'Request body must be a block schema object' });
        }
        const created = createBlock(schema);
        return res.status(201).json(created);
    } catch (err: any) {
        const msg = err?.message ?? 'Failed to create block';
        return res.status(400).json({ error: msg });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/api/moteur/blocks': {
        get: {
            summary: 'List block types (public)',
            description:
                'Returns all registered block schemas with variant hints stripped for public use.',
            tags: ['Blocks'],
            responses: { '200': { description: 'Map of block id to block schema' } }
        },
        post: {
            summary: 'Register block type',
            description:
                'Create a new block type from a schema. Request body must be a block schema object.',
            tags: ['Blocks'],
            requestBody: {
                content: {
                    'application/json': {
                        schema: { type: 'object', description: 'Block schema object' }
                    }
                }
            },
            responses: {
                '201': { description: 'Block created' },
                '400': { description: 'Request body must be a block schema object' }
            }
        }
    }
};

export default router;
