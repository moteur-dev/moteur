import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import generateImageRouter from '../../src/ai/generateImage.js';
import { requireAuth } from '../../src/middlewares/auth.js';
import { setCredits, getCredits } from '@moteur/ai';

vi.mock('../../src/middlewares/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['admin'] };
        next();
    },
}));

const { mockGenerateImages } = vi.hoisted(() => ({ mockGenerateImages: vi.fn() }));
vi.mock('@moteur/ai', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@moteur/ai')>();
    return {
        ...actual,
        generateImages: mockGenerateImages,
    };
});

vi.mock('@moteur/core/projects', () => ({
    getProject: vi.fn().mockResolvedValue({
        id: 'p1',
        label: 'Test',
        defaultLocale: 'en',
        supportedLocales: ['en'],
        users: ['user1'],
        ai: { imageProvider: 'openai' },
    }),
}));

const app = express();
app.use(express.json());
app.use(generateImageRouter);

describe('POST /ai/generate-image', () => {
    beforeEach(() => {
        vi.mocked(mockGenerateImages).mockReset();
        setCredits('p1', 100);
    });

    it('returns 400 when prompt or projectId missing', async () => {
        const res = await request(app)
            .post('/generate-image')
            .send({ projectId: 'p1' });
        expect(res.status).toBe(400);
    });

    it('returns 403 when user not in project', async () => {
        const { getProject } = await import('@moteur/core/projects.js');
        vi.mocked(getProject).mockResolvedValueOnce({
            id: 'p1',
            users: ['other-user'],
            ai: { imageProvider: 'openai' },
        } as any);
        const res = await request(app)
            .post('/generate-image')
            .send({ prompt: 'a cat', projectId: 'p1' });
        expect(res.status).toBe(403);
    });

    it('returns 402 when insufficient credits', async () => {
        mockGenerateImages.mockRejectedValueOnce(
            Object.assign(new Error('Insufficient credits'), {
                code: 'insufficient_credits',
                details: { required: 10, remaining: 2 },
            })
        );
        const res = await request(app)
            .post('/generate-image')
            .send({ prompt: 'a cat', projectId: 'p1' });
        expect(res.status).toBe(402);
        expect(res.body.error).toBe('insufficient_credits');
        expect(res.body).toHaveProperty('creditsRemaining');
    });

    it('returns 422 when image provider not configured', async () => {
        mockGenerateImages.mockRejectedValueOnce(
            Object.assign(new Error('Not configured'), { code: 'image_provider_not_configured' })
        );
        const res = await request(app)
            .post('/generate-image')
            .send({ prompt: 'a cat', projectId: 'p1' });
        expect(res.status).toBe(422);
        expect(res.body.error).toBe('image_provider_not_configured');
    });

    it('returns 200 with variants, prompt, creditsUsed, creditsRemaining', async () => {
        mockGenerateImages.mockResolvedValueOnce({
            variants: [
                { url: 'https://example.com/1.png', width: 1024, height: 1024, provider: 'openai/dall-e-3' },
                { url: 'https://example.com/2.png', width: 1024, height: 1024, provider: 'openai/dall-e-3' },
            ],
            prompt: 'a cat\nStyle: photographic',
            creditsUsed: 10,
            creditsRemaining: 90,
        });
        const res = await request(app)
            .post('/generate-image')
            .send({
                prompt: 'a cat',
                styleHints: ['photographic'],
                projectId: 'p1',
            });
        expect(res.status).toBe(200);
        expect(res.body.variants).toHaveLength(2);
        expect(res.body.variants[0]).toEqual({ url: 'https://example.com/1.png', width: 1024, height: 1024 });
        expect(res.body.prompt).toBe('a cat\nStyle: photographic');
        expect(res.body.creditsUsed).toBe(10);
        expect(res.body.creditsRemaining).toBe(90);
    });
});
