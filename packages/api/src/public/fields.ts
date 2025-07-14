import express, { Router } from 'express';
import fieldRegistry from '@moteur/core/registry/FieldRegistry.js';

const router: Router = express.Router();

// GET /api/moteur/fields
router.get('/', (req, res) => {
    res.json(fieldRegistry.all());
});

export default router;
