import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, requireProjectAccess } from '../../middlewares/auth.js';

// Dummy project data for demonstration
const projects = [
    { id: 'proj1', name: 'Project One' },
    { id: 'proj2', name: 'Project Two' }
];

const router = Router();

// List all projects (admin only)
router.get('/', requireAdmin, (req: any, res: any) => {
    res.json({ projects });
});

// Create a new project (admin only)
router.post('/', requireAdmin, (req: any, res: any) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ error: 'Missing project ID or name' });
    }

    // In a real app, insert into DB instead
    const newProject = { id, name };
    projects.push(newProject);

    res.status(201).json({ message: 'Project created', project: newProject });
});

// Delete a project (admin only)
router.delete('/:projectId', requireAdmin, (req: any, res: any) => {
    const { projectId } = req.params;
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const deletedProject = projects.splice(index, 1)[0];
    res.json({ message: 'Project deleted', project: deletedProject });
});

// Get project details (requires project access)
router.get('/:projectId', requireProjectAccess, (req: any, res: any) => {
    const { projectId } = req.params;
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
});

export default router;
