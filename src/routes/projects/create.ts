import { Router } from 'express';
import { requireAuth } from '@/middlewares/auth';
import { createProject } from '@/api/projects';
import { validateProject } from '@/validators/validateProject';

const router = Router();

router.post('/', requireAuth, (req: any, res: any) => {
    try {
        const validation = validateProject(req.body);
        if (!validation.valid) {
            return res
                .status(400)
                .json({ validation: validation.issues, error: 'Validation failed' });
        }
        const project = createProject(req.user!, req.body);
        return res.status(201).json(project);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export default router;
