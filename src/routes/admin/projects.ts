import { Router, Request, Response } from 'express';
import { requireAdmin, requireProjectAccess } from '../../middlewares/auth';
import { listProjects, getProject } from '../../api/projects';

const router = Router();

// List all projects (admin only)
router.get('/', requireAdmin, (req: any, res: any) => {
    const user = req.user;
    const projects = listProjects(user);
    res.json({ projects });
});

// Get project details (requires project access)
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
