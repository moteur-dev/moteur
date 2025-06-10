import express from 'express';
import { FieldRegistry } from '../../registry/FieldRegistry.js';

const router = express.Router();
const registry = new FieldRegistry();

// GET all field types
router.get('/', (req, res) => {
    res.json(registry.all());
});

// GET one field type
router.get('/:id', (req, res) => {
    res.json({ type: req.params.id });
});

// POST new field type
router.post('/', (req, res) => {
    res.status(201).json(req.body);
});

// PUT (replace)
router.put('/:id', (req, res) => {
    res.json({ replaced: true, ...req.body });
});

// PATCH
router.patch('/:id', (req, res) => {
    res.json({ patched: true, ...req.body });
});

// DELETE
router.delete('/:id', (req, res) => {
    res.status(204).send();
});

export default router;
