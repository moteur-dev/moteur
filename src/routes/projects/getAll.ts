import { Router } from 'express';
import { requireAdmin } from '@/middlewares/auth';
import { listProjects } from '@/api/projects';

const router = Router();

router.get('/', requireAdmin, (req: any, res: any) => {
    const user = req.user;
    const projects = listProjects(user);
    res.json({ projects });
});

export default router;
