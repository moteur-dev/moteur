import { Router } from 'express';
import {
    listStructures,
    getStructure,
    createStructure,
    updateStructure,
    deleteStructure
} from '@moteur/core/structures.js';
import { getBlueprint } from '@moteur/core/blueprints.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import type { StructureSchema } from '@moteur/types/Structure.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const registry = await listStructures(projectId);
        const structures = Object.values(registry);
        return res.json(structures);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list structures' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const structure = await getStructure(id, projectId);
        return res.json(structure);
    } catch (err: any) {
        return res.status(404).json({ error: err?.message ?? 'Structure not found' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const body = req.body || {};
        let schema: StructureSchema;

        if (body.blueprintId) {
            const blueprint = getBlueprint('structure', body.blueprintId);
            if ((blueprint.kind ?? 'project') !== 'structure') {
                return res.status(400).json({ error: 'Blueprint is not a structure blueprint' });
            }
            const template = blueprint.template as { structure: StructureSchema } | undefined;
            if (!template?.structure) {
                return res.status(400).json({ error: 'Blueprint has no template.structure' });
            }
            const { blueprintId: _b, ...overrides } = body;
            schema = { ...template.structure, ...overrides } as StructureSchema;
        } else {
            schema = body as StructureSchema;
        }

        const structure = await createStructure(projectId, schema, req.user);
        return res.status(201).json(structure);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to create structure' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const updated = await updateStructure(projectId, id, req.body, req.user);
        return res.json(updated);
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to update structure' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deleteStructure(projectId, id, req.user);
        return res.status(204).send();
    } catch (err: any) {
        return res.status(400).json({ error: err?.message ?? 'Failed to delete structure' });
    }
});

export default router;
