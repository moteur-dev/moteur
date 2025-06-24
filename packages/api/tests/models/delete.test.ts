import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../src/middlewares/auth', () => ({
    requireAdmin: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    }
}));

vi.mock('@moteur/core/models', () => ({
    deleteModelSchema: vi.fn()
}));

import deleteRoute from '../../src/models/delete';
import { deleteModelSchema } from '@moteur/core/models';

const app = express();
app.use(express.json());
app.use('/projects/:projectId/models', deleteRoute);

describe('DELETE /projects/:projectId/models/:modelId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 204 on successful deletion', async () => {
        const res = await request(app).delete('/projects/demo/models/article');

        expect(res.status).toBe(204);
        expect(deleteModelSchema).toHaveBeenCalledWith(
            { id: 'admin1', role: 'admin' },
            'demo',
            'article'
        );
    });

    it('should return 400 if projectId or modelId is missing (bad path)', async () => {
        const res1 = await request(app).delete('/projects//models/article');
        const res2 = await request(app).delete('/projects/demo/models/');
        expect([400, 404]).toContain(res1.status);
        expect([400, 404]).toContain(res2.status);
    });

    it('should return 404 if deletion throws (model not found)', async () => {
        (deleteModelSchema as any).mockImplementation(() => {
            throw new Error('Model not found');
        });

        const res = await request(app).delete('/projects/demo/models/missing');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Model not found' });
    });
});
