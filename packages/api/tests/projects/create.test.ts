import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../src/middlewares/auth', () => ({
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    }
}));

vi.mock('@moteur/core/projects', () => ({
    createProject: vi.fn()
}));

vi.mock('@moteur/core/validators/validateProject', () => ({
    validateProject: vi.fn()
}));

import createRoute from '../../src/projects/create';
import { createProject } from '@moteur/core/projects';
import { validateProject } from '@moteur/core/validators/validateProject';

const app = express();
app.use(express.json());
app.use('/projects', createRoute);

describe('POST /projects', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validBody = {
        id: 'demo',
        label: 'Demo Project',
        description: 'A test project',
        locale: 'en',
        modules: ['core'],
        plugins: []
    };

    it('should create a project and return 201', async () => {
        (validateProject as any).mockReturnValue({ valid: true });
        (createProject as any).mockReturnValue({ ...validBody, createdAt: Date.now() });

        const res = await request(app).post('/projects').send(validBody);
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject(validBody);
        expect(validateProject).toHaveBeenCalledWith(validBody);
        expect(createProject).toHaveBeenCalledWith({ id: 'admin1', role: 'admin' }, validBody);
    });

    it('should return 400 on validation failure', async () => {
        (validateProject as any).mockReturnValue({
            valid: false,
            issues: [
                { path: 'label', message: 'Label is required' },
                { path: 'id', message: 'ID must be lowercase' }
            ]
        });

        const res = await request(app)
            .post('/projects')
            .send({ ...validBody, id: 'INVALID_ID' });

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Validation failed',
            validation: [
                { path: 'label', message: 'Label is required' },
                { path: 'id', message: 'ID must be lowercase' }
            ]
        });
    });

    it('should return 400 on unexpected error', async () => {
        (validateProject as any).mockReturnValue({ valid: true });
        (createProject as any).mockImplementation(() => {
            throw new Error('Something went wrong');
        });

        const res = await request(app).post('/projects').send(validBody);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Something went wrong' });
    });
});
