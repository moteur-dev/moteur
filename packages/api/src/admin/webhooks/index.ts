import { Router } from 'express';
import {
    listWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    rotateSecret,
    sendTestPing,
    getDeliveryLog,
    retryDelivery
} from '@moteur/core/webhooks/webhookService.js';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.get('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    try {
        const list = await listWebhooks(projectId);
        return res.json(list);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to list webhooks' });
    }
});

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    const user = req.user!;
    try {
        const webhook = await createWebhook(projectId, user.id, req.body);
        return res.status(201).json(webhook);
    } catch (err: any) {
        const msg = err?.message ?? 'Failed to create webhook';
        return res.status(msg.includes('required') || msg.includes('Invalid') ? 422 : 400).json({
            error: msg
        });
    }
});

router.get('/:webhookId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const webhook = await getWebhook(projectId, webhookId);
        return res.json(webhook);
    } catch (err: any) {
        if (err?.message?.includes('not found'))
            return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: err?.message ?? 'Failed to get webhook' });
    }
});

router.patch('/:webhookId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const webhook = await updateWebhook(projectId, req.user!.id, webhookId, req.body);
        return res.json(webhook);
    } catch (err: any) {
        const msg = err?.message ?? 'Failed to update webhook';
        if (msg.includes('not found')) return res.status(404).json({ error: msg });
        return res.status(msg.includes('required') || msg.includes('Invalid') ? 422 : 400).json({
            error: msg
        });
    }
});

router.delete('/:webhookId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        await deleteWebhook(projectId, req.user!.id, webhookId);
        return res.status(204).send();
    } catch (err: any) {
        if (err?.message?.includes('not found'))
            return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: err?.message ?? 'Failed to delete webhook' });
    }
});

router.post('/:webhookId/rotate-secret', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const { secret } = await rotateSecret(projectId, req.user!.id, webhookId);
        return res.json({ secret });
    } catch (err: any) {
        if (err?.message?.includes('not found'))
            return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: err?.message ?? 'Failed to rotate secret' });
    }
});

router.post('/:webhookId/test', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const delivery = await sendTestPing(projectId, webhookId);
        return res.json(delivery);
    } catch (err: any) {
        if (err?.message?.includes('not found'))
            return res.status(404).json({ error: err.message });
        return res.status(500).json({ error: err?.message ?? 'Failed to send test' });
    }
});

router.get('/:webhookId/log', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, webhookId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 200);
    const offset = parseInt(req.query.offset as string, 10) || 0;
    if (!projectId || !webhookId) return res.status(400).json({ error: 'Missing parameters' });
    try {
        const list = await getDeliveryLog(projectId, webhookId, { limit, offset });
        return res.json(list);
    } catch (err: any) {
        return res.status(500).json({ error: err?.message ?? 'Failed to get delivery log' });
    }
});

router.post(
    '/:webhookId/log/:deliveryId/retry',
    requireProjectAccess,
    async (req: any, res: any) => {
        const { projectId, webhookId, deliveryId } = req.params;
        if (!projectId || !webhookId || !deliveryId)
            return res.status(400).json({ error: 'Missing parameters' });
        try {
            await retryDelivery(projectId, webhookId, deliveryId);
            return res.status(204).send();
        } catch (err: any) {
            const msg = err?.message ?? 'Failed to retry';
            if (msg.includes('not found')) return res.status(404).json({ error: msg });
            if (msg.includes('Only failed')) return res.status(422).json({ error: msg });
            return res.status(500).json({ error: msg });
        }
    }
);

export default router;
