// src/routes/models/getAll.ts
//import { Request, Response } from 'express';
import { Router } from 'express';
import { listModelSchemas } from '@/api/models';
import { requireProjectAccess } from '@/middlewares/auth';

const router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const user = req.user;
    const { projectId } = req.params;
    if (!projectId) {
        return res.status(400).json({ error: 'Missing projectId in path' });
    }

    try {
        console.log(`Loading models for project ${projectId} for user ${user.id}`);
        const models = await listModelSchemas(user, projectId);
        return res.json(models);
    } catch (err) {
        console.error(`Failed to load models for project ${projectId}`, err);
        return res.status(500).json({ error: 'Failed to load models' });
    }
});
export default router;
