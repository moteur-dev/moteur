vi.mock('../../src/middlewares/auth', () => ({
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['admin'] };
        next();
    }
}));

vi.mock('@moteur/core/projects', () => ({
    getProject: vi.fn()
}));
vi.mock('@moteur/core/models', () => ({
    getModelSchema: vi.fn()
}));
vi.mock('@moteur/core/entries', () => ({
    getEntry: vi.fn()
}));

const translateEntryMock = vi.fn();
vi.mock('../../src/ai/translation', () => ({
    translateEntry: (...args: unknown[]) => translateEntryMock(...args)
}));
vi.mock('../../src/ai/credits', () => ({
    getCredits: vi.fn(() => 100)
}));

import request from 'supertest';
import express from 'express';
import translateRouter from '../../src/ai/translate/index';
import { getProject } from '@moteur/core/projects';
import { getModelSchema } from '@moteur/core/models';
import { getEntry } from '@moteur/core/entries';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const app = express();
app.use(express.json());
app.use('/translate', translateRouter);

const mockProject = {
    id: 'proj1',
    label: 'Test Project',
    defaultLocale: 'en',
    supportedLocales: ['fr']
};
const mockModel = {
    id: 'article',
    label: 'Article',
    fields: {
        title: { type: 'core/text', label: 'Title', options: { multilingual: true } },
        body: { type: 'core/rich-text', label: 'Body', options: { multilingual: true } }
    }
};
const mockEntry = {
    id: 'e1',
    data: { title: { en: 'Hello' }, body: { en: '<p>Content</p>' } }
};

describe('POST /translate/entry', () => {
    beforeEach(() => {
        vi.mocked(getProject).mockResolvedValue(mockProject as any);
        vi.mocked(getModelSchema).mockResolvedValue(mockModel as any);
        vi.mocked(getEntry).mockResolvedValue(mockEntry as any);
        translateEntryMock.mockResolvedValue({
            title: { fr: 'Bonjour' },
            body: { fr: '<p>Contenu</p>' }
        });
    });

    it('returns 200 with fields and credits when translation succeeds', async () => {
        const res = await request(app)
            .post('/translate/entry')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                entryId: 'e1',
                fromLocale: 'en',
                toLocales: ['fr']
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('fields');
        expect(res.body.fields).toHaveProperty('title');
        expect(res.body.fields.title).toHaveProperty('fr', 'Bonjour');
        expect(res.body).toHaveProperty('creditsUsed');
        expect(res.body).toHaveProperty('creditsRemaining');
    });

    it('returns 400 when projectId or modelId missing', async () => {
        const res = await request(app)
            .post('/translate/entry')
            .send({
                entryId: 'e1',
                fromLocale: 'en',
                toLocales: ['fr']
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/projectId|modelId|required/);
    });

    it('returns 400 when entryId, fromLocale or toLocales missing', async () => {
        const res = await request(app).post('/translate/entry').send({
            projectId: 'proj1',
            modelId: 'article'
        });
        expect(res.status).toBe(400);
    });

    it('returns 400 when toLocales is empty', async () => {
        const res = await request(app).post('/translate/entry').send({
            projectId: 'proj1',
            modelId: 'article',
            entryId: 'e1',
            fromLocale: 'en',
            toLocales: []
        });
        expect(res.status).toBe(400);
    });

    it('returns 402 when translateEntry throws INSUFFICIENT_CREDITS', async () => {
        translateEntryMock.mockRejectedValue(new Error('INSUFFICIENT_CREDITS'));

        const res = await request(app)
            .post('/translate/entry')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                entryId: 'e1',
                fromLocale: 'en',
                toLocales: ['fr']
            });

        expect(res.status).toBe(402);
        expect(res.body.error).toBe('insufficient_credits');
    });

    it('returns 404 when model not found', async () => {
        vi.mocked(getModelSchema).mockResolvedValue(null);

        const res = await request(app)
            .post('/translate/entry')
            .send({
                projectId: 'proj1',
                modelId: 'missing',
                entryId: 'e1',
                fromLocale: 'en',
                toLocales: ['fr']
            });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Model not found');
    });
});
