import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { createProject } from '@/api/projects';

const router = Router();

router.post('/', requireAuth, (req: any, res: any) => {
    try {
        const project = createProject(req.user!, req.body);
        return res.status(201).json(project);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export default router;
