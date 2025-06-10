import express from 'express';
import { BlockRegistry } from '../../registry/BlockRegistry.js';

const router = express.Router();
const registry = new BlockRegistry();

// GET /api/moteur/blocks
router.get('/', (req, res) => {
    res.json(registry.all());
});

export default router;
