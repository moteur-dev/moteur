import express, { Router } from 'express';
import { BlockRegistry } from '@moteur/core/registry/BlockRegistry';

const router: Router = express.Router();
const registry = new BlockRegistry();

// GET /api/moteur/blocks
router.get('/', (req, res) => {
    res.json(registry.all());
});

export default router;
