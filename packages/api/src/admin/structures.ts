import express, { Router, Request, Response } from 'express';
import {
    listStructures,
    getStructure,
    createStructure,
    updateStructure,
    deleteStructure
} from '@moteur/core/structures';
import { getBlueprint } from '@moteur/core/blueprints.js';
import type { StructureSchema } from '@moteur/types/Structure.js';

type StructureParams = { project: string };
type StructureWithIdParams = { project: string; id: string };

export const router: Router = express.Router({ mergeParams: true });

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

router.post('/', (async (req: any, res: any) => {
    const { project } = req.params;
    try {
        const body = req.body || {};
        let schema: StructureSchema;

        if (body.blueprintId) {
            const blueprint = getBlueprint('structure', body.blueprintId);
            if ((blueprint.kind ?? 'project') !== 'structure') {
                res.status(400).json({ error: 'Blueprint is not a structure blueprint' });
                return;
            }
            const template = blueprint.template as { structure: StructureSchema } | undefined;
            if (!template?.structure) {
                res.status(400).json({ error: 'Blueprint has no template.structure' });
                return;
            }
            const { blueprintId: _b, ...overrides } = body;
            schema = { ...template.structure, ...overrides } as StructureSchema;
        } else {
            schema = body as StructureSchema;
        }

        const structure = await createStructure(project, schema, req.user);
        res.status(201).json(structure);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
}) as express.RequestHandler);

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
