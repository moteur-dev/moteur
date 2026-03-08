import express, { Request, Response } from 'express';
import {
    handleProviderWebhook,
    verifyProviderWebhookSignature
} from '@moteur/core/assets/assetService.js';

const router: express.Router = express.Router();

function getRawBody(req: Request): string {
    const raw = (req as any).rawBody;
    if (typeof raw === 'string') return raw;
    if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
    return JSON.stringify(req.body ?? {});
}

router.post('/mux', (req: Request, res: Response) => {
    const signature = (req.headers['mux-signature'] as string) ?? '';
    const rawBody = getRawBody(req);
    if (!verifyProviderWebhookSignature('mux', rawBody, signature)) {
        res.status(400).end();
        return;
    }
    res.status(200).send();
    setImmediate(async () => {
        try {
            const payload = rawBody ? JSON.parse(rawBody) : {};
            await handleProviderWebhook('mux', payload, signature);
        } catch {
            // ignore
        }
    });
});

router.post('/vimeo', (req: Request, res: Response) => {
    const signature = (req.headers['x-vimeo-signature'] ??
        req.headers['vimeo-signature'] ??
        '') as string;
    const rawBody = getRawBody(req);
    if (!verifyProviderWebhookSignature('vimeo', rawBody, signature)) {
        res.status(400).end();
        return;
    }
    res.status(200).send();
    setImmediate(async () => {
        try {
            const payload = rawBody ? JSON.parse(rawBody) : {};
            await handleProviderWebhook('vimeo', payload, signature);
        } catch {
            // ignore
        }
    });
});

export default router;
