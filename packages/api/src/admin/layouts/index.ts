import { Router } from 'express';
import {
    listLayouts,
    getLayout,
    createLayout,
    updateLayout,
    deleteLayout
} from '@moteur/core/layouts.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const layouts = await listLayouts(req.user!, projectId);
        return res.json(layouts);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list layouts' });
    }
});

router.get('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId) return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        const layout = await getLayout(req.user!, projectId, layoutId);
        return res.json(layout);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Layout not found' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const layout = await createLayout(req.user!, projectId, req.body);
        return res.status(201).json(layout);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to create layout' });
    }
});

router.patch('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId) return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        const updated = await updateLayout(req.user!, projectId, layoutId, req.body);
        return res.json(updated);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to update layout' });
    }
});

router.delete('/:layoutId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, layoutId } = req.params;
    if (!projectId || !layoutId) return res.status(400).json({ error: 'Missing projectId or layoutId' });
    try {
        await deleteLayout(req.user!, projectId, layoutId);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to delete layout' });
    }
});

export default router;
