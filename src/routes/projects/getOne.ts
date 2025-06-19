import { Router } from 'express';
import { requireProjectAccess } from '@/middlewares/auth';
import { getProject } from '@/api/projects';

const router = Router();

router.get('/:projectId', requireProjectAccess, (req: any, res: any) => {
    const { projectId } = req.params;
    const user = req.user;
    const project = getProject(user, projectId);

    if (!project || !project.id) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
});

export default router;
