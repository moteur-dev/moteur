import express, { Router } from 'express';
import { htmlRenderer } from '@moteur/core/renderers/html/htmlBlockRenderer.js';
import { Block } from '@moteur/types/Block.js';

const router: Router = express.Router();

const rendererMap: Record<string, any> = {
    html: htmlRenderer
    // Add reactRenderer, vueRenderer, etc. here later
};

// POST /api/moteur/preview
router.post('/', (req: any, res: any) => {
    if (!req.body || !Array.isArray(req.body.blocks)) {
        return res
            .status(400)
            .json({ error: 'Invalid request body: must contain a "blocks" array' });
    }
    const blocks = req.body.blocks;
    const locale = req.body.locale || process.env.DEFAULT_LOCALE || 'en';
    const format = req.body.format || 'html';

    if (!Array.isArray(blocks)) {
        return res.status(400).json({ error: '`blocks` must be an array' });
    }

    const renderer = rendererMap[format];

    if (!renderer) {
        return res.status(400).json({ error: `Unsupported format: ${format}` });
    }

    try {
        const output = renderer.renderLayout(blocks as Block[], { locale: locale });
        res.send(output);
    } catch (err) {
        res.status(500).json({ error: 'Render failed', details: err });
    }
});

export default router;
