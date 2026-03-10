import express, { Router } from 'express';
import fieldRegistry from '@moteur/core/registry/FieldRegistry.js';
import { stripUiFromFieldSchema } from '../utils/stripUiFromFields.js';

const router: Router = express.Router();

// GET /api/moteur/fields
// Note: ui hint is stripped from field schemas — it must never appear in public API responses.
router.get('/', (req, res) => {
    const all = fieldRegistry.all();
    const stripped = Object.fromEntries(
        Object.entries(all).map(([type, schema]) => [
            type,
            stripUiFromFieldSchema(schema as Record<string, unknown>)
        ])
    );
    res.json(stripped);
});

export default router;
