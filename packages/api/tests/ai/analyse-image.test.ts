import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import analyseImageRouter from '../../src/ai/analyse/image.js';
import { requireAuth as _requireAuth } from '../../src/middlewares/auth.js';
import { setAdapter } from '../../src/ai/adapter.js';
import { setCredits, getCredits } from '../../src/ai/credits.js';
import { MockAdapter } from '@moteur/ai';

vi.mock('../../src/middlewares/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['admin'] };
        next();
    }
}));

vi.mock('@moteur/core/projects', () => ({
    getProject: vi.fn().mockResolvedValue({ id: 'p1', defaultLocale: 'en' })
}));

const app = express();
app.use(express.json());
app.locals = { io: undefined };
app.use('/ai/analyse/image', analyseImageRouter);

describe('POST /ai/analyse/image', () => {
    beforeEach(() => {
        setAdapter(new MockAdapter());
        setCredits('p1', 100);
    });

    it('returns 400 when assetUrl or locale missing', async () => {
        const res = await request(app).post('/ai/analyse/image').send({ projectId: 'p1' });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/assetUrl|locale|required/);
    });

    it('returns 400 when projectId missing', async () => {
        const res = await request(app)
            .post('/ai/analyse/image')
            .send({ assetUrl: 'https://example.com/img.png', locale: 'en' });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/projectId/);
    });

    it('returns 402 when insufficient credits', async () => {
        setCredits('p1', 0);
        const res = await request(app).post('/ai/analyse/image').send({
            assetUrl: 'https://example.com/img.png',
            locale: 'en',
            projectId: 'p1'
        });
        expect(res.status).toBe(402);
        expect(res.body.error).toBe('insufficient_credits');
        expect(res.body).toHaveProperty('creditsRemaining');
    });

    it('returns 200 with alt, caption, creditsUsed, creditsRemaining', async () => {
        const res = await request(app).post('/ai/analyse/image').send({
            assetUrl: 'https://example.com/img.png',
            locale: 'en',
            projectId: 'p1'
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('alt');
        expect(res.body).toHaveProperty('caption');
        expect(res.body).toHaveProperty('creditsUsed');
        expect(res.body).toHaveProperty('creditsRemaining');
        expect(getCredits('p1')).toBe(98);
    });

    it('returns 503 when no adapter', async () => {
        setAdapter(null);
        const res = await request(app).post('/ai/analyse/image').send({
            assetUrl: 'https://example.com/img.png',
            locale: 'en',
            projectId: 'p1'
        });
        expect(res.status).toBe(503);
    });
});
