import { Router } from 'express';
import multer from 'multer';
import {
    uploadAsset,
    listAssets,
    getAsset,
    updateAsset,
    deleteAsset,
    moveToFolder,
    regenerateVariants
} from '@moteur/core/assets/assetService.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
});

router.post('/', requireProjectAccess, upload.single('file'), async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Missing file' });
    try {
        const folder = req.body.folder as string | undefined;
        const alt = req.body.alt as string | undefined;
        const title = req.body.title as string | undefined;
        const credit = req.body.credit as string | undefined;
        const keepLocalCopy = req.body.keepLocalCopy === 'true' || req.body.keepLocalCopy === true;
        const asset = await uploadAsset(
            projectId,
            req.user!,
            {
                buffer: file.buffer,
                originalName: file.originalname,
                mimeType: file.mimetype
            },
            { folder, alt, title, credit, keepLocalCopy }
        );
        return res.status(201).json(asset);
    } catch (err: any) {
        if (err?.message?.includes('exceeds max'))
            return res.status(413).json({ error: err.message });
        if (err?.message?.includes('not allowed') || err?.message?.includes('Unsupported'))
            return res.status(415).json({ error: err.message });
        return res.status(500).json({ error: err?.message ?? 'Upload failed' });
    }
});

router.post('/regenerate', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const assetIds = req.body?.assetIds as string[] | undefined;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const result = await regenerateVariants(projectId, req.user!, assetIds);
        return res.json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Regenerate failed' });
    }
});

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    const type = req.query.type as string | undefined;
    const folder = req.query.folder as string | undefined;
    const search = req.query.search as string | undefined;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const assets = await listAssets(projectId, { type: type as any, folder, search });
        return res.json(assets);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list assets' });
    }
});

router.get('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const asset = await getAsset(projectId, id);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        return res.json(asset);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get asset' });
    }
});

router.patch('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        const asset = await updateAsset(projectId, req.user!, id, req.body);
        return res.json(asset);
    } catch (err: any) {
        return res
            .status(err?.message?.includes('not found') ? 404 : 400)
            .json({ error: err?.message ?? 'Update failed' });
    }
});

router.delete('/:id', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    try {
        await deleteAsset(projectId, req.user!, id);
        res.set('X-Moteur-Warning', 'Deletion does not cascade to entries.');
        return res.status(204).send();
    } catch (err: any) {
        return res
            .status(err?.message?.includes('not found') ? 404 : 500)
            .json({ error: err?.message ?? 'Delete failed' });
    }
});

router.post('/:id/move', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, id } = req.params;
    const folder = req.body?.folder;
    if (!projectId || !id) return res.status(400).json({ error: 'Missing projectId or id' });
    if (typeof folder !== 'string') return res.status(400).json({ error: 'Missing folder' });
    try {
        const asset = await moveToFolder(projectId, req.user!, id, folder);
        return res.json(asset);
    } catch (err: any) {
        return res
            .status(err?.message?.includes('not found') ? 404 : 400)
            .json({ error: err?.message ?? 'Move failed' });
    }
});

export default router;
