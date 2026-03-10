vi.mock('../../src/middlewares/auth', () => ({
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['admin'] };
        next();
    },
}));

vi.mock('@moteur/core/projects', () => ({
    getProject: vi.fn(),
}));
vi.mock('@moteur/core/models', () => ({
    getModelSchema: vi.fn(),
}));
vi.mock('@moteur/core/entries', () => ({
    getEntry: vi.fn(),
}));

const runWritingActionMock = vi.fn();
vi.mock('../../src/ai/writing', () => ({
    runWritingAction: (...args: unknown[]) => runWritingActionMock(...args),
}));
vi.mock('../../src/ai/credits', () => ({
    getCredits: vi.fn(() => 100),
}));

import request from 'supertest';
import express from 'express';
import writeRouter from '../../src/ai/write/index.js';
import { getProject } from '@moteur/core/projects';
import { getModelSchema } from '@moteur/core/models';
import { getEntry } from '@moteur/core/entries';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const app = express();
app.use(express.json());
app.use('/write', writeRouter);

const mockProject = {
    id: 'proj1',
    label: 'Test Project',
    defaultLocale: 'en',
    supportedLocales: ['fr'],
};
const mockModel = {
    id: 'article',
    label: 'Article',
    fields: {
        title: { type: 'core/text', label: 'Title' },
        body: { type: 'core/rich-text', label: 'Body' },
        excerpt: { type: 'core/text', label: 'Excerpt' },
    },
};

describe('POST /write/draft and /write/rewrite', () => {
    beforeEach(() => {
        vi.mocked(getProject).mockResolvedValue(mockProject as any);
        vi.mocked(getModelSchema).mockResolvedValue(mockModel as any);
        vi.mocked(getEntry).mockResolvedValue(null);
        runWritingActionMock.mockResolvedValue('Generated content');
    });

    it('returns 200 with value and credits when draft succeeds', async () => {
        const res = await request(app)
            .post('/write/draft')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                entryId: 'e1',
                fieldPath: 'title',
                locale: 'en',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('value', 'Generated content');
        expect(res.body).toHaveProperty('creditsUsed');
        expect(res.body).toHaveProperty('creditsRemaining');
    });

    it('returns 400 when projectId or modelId missing', async () => {
        const res = await request(app)
            .post('/write/draft')
            .send({
                fieldPath: 'title',
                locale: 'en',
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/projectId|modelId|required/);
    });

    it('returns 400 when fieldPath or locale missing', async () => {
        const res = await request(app)
            .post('/write/draft')
            .send({
                projectId: 'proj1',
                modelId: 'article',
            });
        expect(res.status).toBe(400);
    });

    it('returns 402 when runWritingAction throws INSUFFICIENT_CREDITS', async () => {
        runWritingActionMock.mockRejectedValue(new Error('INSUFFICIENT_CREDITS'));

        const res = await request(app)
            .post('/write/draft')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                fieldPath: 'title',
                locale: 'en',
            });

        expect(res.status).toBe(402);
        expect(res.body.error).toBe('insufficient_credits');
    });

    it('returns 404 when model not found', async () => {
        vi.mocked(getModelSchema).mockResolvedValue(null);

        const res = await request(app)
            .post('/write/draft')
            .send({
                projectId: 'proj1',
                modelId: 'missing',
                fieldPath: 'title',
                locale: 'en',
            });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Model not found');
    });

    it('returns 400 when field not on model', async () => {
        const res = await request(app)
            .post('/write/draft')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                fieldPath: 'unknownField',
                locale: 'en',
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('not found');
    });

    it('passes graceRegenerate to runWritingAction when body has graceRegenerate true', async () => {
        await request(app)
            .post('/write/rewrite')
            .send({
                projectId: 'proj1',
                modelId: 'article',
                fieldPath: 'title',
                locale: 'en',
                currentValue: 'Some text',
                graceRegenerate: true,
            });

        expect(runWritingActionMock).toHaveBeenCalled();
        const lastCall = runWritingActionMock.mock.calls[runWritingActionMock.mock.calls.length - 1];
        const options = lastCall?.[4];
        expect(options?.skipDeduction).toBe(true);
    });
});
