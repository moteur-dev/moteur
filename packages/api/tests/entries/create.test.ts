// Mocks
vi.mock('../../src/middlewares/auth', () => ({
    requireAdmin: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    },
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'editor1', role: 'admin' };
        next();
    }
}));

import request from 'supertest';
import express from 'express';
import createRoute from '../../src/entries/create';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { getModelSchema } from '@moteur/core/models';
import { createEntry } from '@moteur/core/entries';
import { validateEntry } from '@moteur/core/validators/validateEntry';
import { requireProjectAccess } from '../../src/middlewares/auth';

vi.mock('@moteur/core/models', () => ({
    getModelSchema: vi.fn()
}));
vi.mock('@moteur/core/entries', () => ({
    createEntry: vi.fn()
}));
vi.mock('@moteur/core/validators/validateEntry', () => ({
    validateEntry: vi.fn()
}));

const mockUser = { id: 'user-123', roles: ['admin'] };
const mockSchema = {
    id: 'article',
    label: 'Article',
    fields: { title: { type: 'core/text' } }
};

const app = express();
app.use(express.json());
app.use((req: any, res, next) => {
    req.user = mockUser;
    next();
});
app.use('/projects/:projectId/models/:modelId/entries', createRoute);

describe('POST /projects/:projectId/models/:modelId/entries', () => {
    const basePath = '/projects/test-project/models/article/entries';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an entry and return 201', async () => {
        (getModelSchema as any).mockReturnValue(mockSchema);
        (validateEntry as any).mockReturnValue({ valid: true });
        (createEntry as any).mockResolvedValue({ id: 'entry-1', title: 'Hello' });

        const res = await request(app).post(basePath).send({ title: 'Hello' });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 'entry-1', title: 'Hello' });
    });

    it('should return 404 if model schema is not found', async () => {
        (getModelSchema as any).mockReturnValue(null);
        const res = await request(app).post(basePath).send({});
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Model not found');
    });

    it('should return 400 if entry validation fails', async () => {
        (getModelSchema as any).mockReturnValue(mockSchema);
        (validateEntry as any).mockReturnValue({
            valid: false,
            issues: [{ path: 'title', message: 'Required' }]
        });

        const res = await request(app).post(basePath).send({});

        expect(res.status).toBe(400);
        expect(res.body.valid).toBe(false);
        expect(res.body.errors[0].field).toBe('title');
    });

    it('should return 400 on entry creation error', async () => {
        (getModelSchema as any).mockReturnValue(mockSchema);
        (validateEntry as any).mockReturnValue({ valid: true });
        (createEntry as any).mockRejectedValue(new Error('fail'));

        const res = await request(app).post(basePath).send({ title: 'Fail' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('fail');
    });
});
