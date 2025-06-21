import express from 'express';
import fieldRegistry from '../../registry/FieldRegistry';

const router = express.Router();

// GET /api/moteur/fields
router.get('/', (req, res) => {
    res.json(fieldRegistry.all());
});

export default router;
