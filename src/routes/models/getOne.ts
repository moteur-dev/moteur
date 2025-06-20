import { Router } from 'express';
import { requireProjectAccess } from '@/middlewares/auth';
import { getModelSchema } from '@/api/models';

const router = Router({ mergeParams: true });

router.get('/:modelId', requireProjectAccess, (req: any, res: any) => {
    const { projectId, modelId } = req.params;
    const user = req.user;
    try {
        const model = getModelSchema(user, projectId, modelId);

        if (!model || !model.id) {
            return res.status(404).json({ error: 'Model not found' });
        }

        res.json({ model });
    } catch (err) {
        console.error(`Failed to get model ${modelId} for project ${projectId}`, err);
        res.status(500).json({ error: 'Failed to get model' });
    }
});

export default router;
