import express, { Request, Response } from 'express';
import {
    handleProviderWebhook,
    verifyProviderWebhookSignature
} from '@moteur/core/assets/assetService.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: express.Router = express.Router();

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/webhooks/mux': {
        post: {
            summary: 'Mux webhook',
            description: 'Webhook endpoint for Mux video provider. Verifies mux-signature header. No auth; signature required.',
            tags: ['Webhooks'],
            security: [],
            parameters: [
                { name: 'mux-signature', in: 'header', required: true, schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Accepted' }, '400': { description: 'Invalid signature' } }
        }
    },
    '/webhooks/vimeo': {
        post: {
            summary: 'Vimeo webhook',
            description: 'Webhook endpoint for Vimeo video provider. Verifies x-vimeo-signature or vimeo-signature. No auth; signature required.',
            tags: ['Webhooks'],
            security: [],
            parameters: [
                { name: 'x-vimeo-signature', in: 'header', schema: { type: 'string' } },
                { name: 'vimeo-signature', in: 'header', schema: { type: 'string' } }
            ],
            requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
            responses: { '200': { description: 'Accepted' }, '400': { description: 'Invalid signature' } }
        }
    }
};

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
