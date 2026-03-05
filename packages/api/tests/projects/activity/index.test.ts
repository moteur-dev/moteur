import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/middlewares/auth', () => ({
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['admin'] };
        next();
    }
}));

vi.mock('@moteur/core/activityLogger', () => ({
    getProjectLog: vi.fn(),
    getLog: vi.fn()
}));

import activityRouter from '../../../src/projects/activity/index';
import { getProjectLog, getLog } from '@moteur/core/activityLogger';

const app = express();
app.use(express.json());
app.use('/projects/:projectId/activity', activityRouter);

describe('GET /projects/:projectId/activity', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns recent project activity with default limit', async () => {
        const mockEvents = [
            {
                id: 'ev-1',
                projectId: 'proj1',
                resourceType: 'entry',
                resourceId: 'article__e1',
                action: 'created',
                userId: 'u1',
                userName: 'Alice',
                timestamp: '2025-01-01T12:00:00.000Z'
            }
        ];
        (getProjectLog as any).mockResolvedValue(mockEvents);

        const res = await request(app).get('/projects/proj1/activity');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ events: mockEvents });
        expect(getProjectLog).toHaveBeenCalledWith('proj1', 50);
    });

    it('accepts limit query and caps at 200', async () => {
        (getProjectLog as any).mockResolvedValue([]);

        await request(app).get('/projects/proj1/activity?limit=300');

        expect(getProjectLog).toHaveBeenCalledWith('proj1', 200);
    });

    it('returns 500 on getProjectLog failure', async () => {
        (getProjectLog as any).mockRejectedValue(new Error('storage error'));

        const res = await request(app).get('/projects/proj1/activity');

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});

describe('GET /projects/:projectId/activity/:resourceType/:resourceId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns activity for the given resource', async () => {
        const mockEvents = [
            {
                id: 'ev-1',
                projectId: 'proj1',
                resourceType: 'entry',
                resourceId: 'article__post-1',
                action: 'updated',
                userId: 'u1',
                userName: 'Bob',
                timestamp: '2025-01-01T12:00:00.000Z'
            }
        ];
        (getLog as any).mockResolvedValue(mockEvents);

        const res = await request(app).get('/projects/proj1/activity/entry/article__post-1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ events: mockEvents });
        expect(getLog).toHaveBeenCalledWith('proj1', 'entry', 'article__post-1');
    });

    it('returns 400 for invalid resourceType', async () => {
        const res = await request(app).get('/projects/proj1/activity/invalid/foo');

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Invalid resourceType|resourceType/);
        expect(getLog).not.toHaveBeenCalled();
    });

    it('returns 500 on getLog failure', async () => {
        (getLog as any).mockRejectedValue(new Error('read error'));

        const res = await request(app).get('/projects/proj1/activity/entry/article__e1');

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});
