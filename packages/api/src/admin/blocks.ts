import express from 'express';
import { BlockRegistry } from '@moteur/core/registry/BlockRegistry';

const router = express.Router();
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

export default router;
