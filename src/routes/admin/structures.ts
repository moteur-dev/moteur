import express, { Request, Response } from 'express';
import {
    listStructures,
    getStructure,
    createStructure,
    updateStructure,
    deleteStructure
} from '../../api/structures.js';

type StructureParams = { project: string };
type StructureWithIdParams = { project: string; id: string };

export const router = express.Router({ mergeParams: true });

router.get('/', (req: Request<StructureParams>, res: Response) => {
    const { project } = req.params;
    try {
        const structures = listStructures(project);
        res.json(structures);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/:id', (req: Request<StructureWithIdParams>, res: Response) => {
    const { id, project } = req.params;
    try {
        const structure = getStructure(id, project);
        res.json(structure);
    } catch (err) {
        res.status(404).json({ error: (err as Error).message });
    }
});

router.post('/', (req: Request<StructureParams>, res: Response) => {
    const { project } = req.params;
    try {
        const structure = createStructure(project, req.body);
        res.status(201).json(structure);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.patch('/:id', (req: Request<StructureWithIdParams>, res: Response) => {
    const { id, project } = req.params;
    try {
        const updated = updateStructure(project, id, req.body);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.delete('/:id', (req: Request<StructureWithIdParams>, res: Response) => {
    const { id, project } = req.params;
    try {
        deleteStructure(project, id);
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
