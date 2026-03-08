import { Router } from 'express';
import { migrateProvider } from '@moteur/core/assets/assetService.js';
import { requireAuth } from '../../middlewares/auth.js';

const router: Router = Router();

router.post('/migrate-provider', requireAuth, async (req: any, res: any) => {
    try {
        const body = req.body ?? {};
        const fromProvider = body.fromProvider;
        const toProvider = body.toProvider;
        const projectIds = body.projectIds;
        const keepLocalCopy = body.keepLocalCopy;
        if (!toProvider) return res.status(400).json({ error: 'Missing toProvider' });
        const result = await migrateProvider(req.user!, {
            fromProvider,
            toProvider,
            projectIds,
            keepLocalCopy
        });
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: (err as Error)?.message ?? 'Migration failed' });
    }
});

export default router;
