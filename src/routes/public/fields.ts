import express from 'express';
import { FieldRegistry } from '../../registry/FieldRegistry.js';

const router = express.Router();
const registry = new FieldRegistry();

// GET /api/moteur/fields
router.get('/', (req, res) => {
    res.json(registry.all());
});

export default router;
