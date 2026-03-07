import express, { Router } from 'express';
import { BlockRegistry } from '@moteur/core/registry/BlockRegistry.js';
import { createBlock } from '@moteur/core/blocks.js';

const router: Router = express.Router();
const registry = new BlockRegistry();

// GET /api/moteur/blocks
router.get('/', (_req, res) => {
    res.json(registry.all());
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

export default router;
