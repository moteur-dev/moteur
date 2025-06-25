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

vi.mock('@moteur/core/projects', () => ({
    updateProject: vi.fn()
}));

vi.mock('@moteur/core/validators/validateProject', () => ({
    validateProject: vi.fn()
}));

import updateRoute from '../../src/projects/update';
import { updateProject } from '@moteur/core/projects';
import { validateProject } from '@moteur/core/validators/validateProject';

const app = express();
app.use(express.json());
app.use('/projects', updateRoute);

describe('PATCH /projects/:projectId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validData = {
        id: 'demo',
        label: 'Updated Demo Project',
        description: 'An updated test project',
        locale: 'en',
        modules: ['core'],
        plugins: []
    };

    it('should update a project successfully', async () => {
        (validateProject as any).mockReturnValue({ valid: true });
        (updateProject as any).mockReturnValue({ ...validData, updatedAt: Date.now() });

        const res = await request(app).patch('/projects/demo').send(validData);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject(validData);
        expect(validateProject).toHaveBeenCalledWith(validData);
        expect(updateProject).toHaveBeenCalledWith(
            { id: 'admin1', role: 'admin' },
            'demo',
            validData
        );
    });

    it('should return 400 if projectId is missing in path', async () => {
        const res = await request(app).patch('/projects/').send(validData);
        expect(res.status).toBe(404); // Express will handle missing param with 404
    });

    it('should return 400 if validation fails', async () => {
        (validateProject as any).mockReturnValue({
            valid: false,
            issues: [{ path: 'label', message: 'Label is required' }]
        });

        const res = await request(app)
            .patch('/projects/demo')
            .send({ ...validData, label: '' });

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
            error: 'Validation failed',
            validation: [{ path: 'label', message: 'Label is required' }]
        });
    });

    it('should return 400 if updateProject throws', async () => {
        (validateProject as any).mockReturnValue({ valid: true });
        (updateProject as any).mockImplementation(() => {
            throw new Error('Unexpected failure');
        });

        const res = await request(app).patch('/projects/demo').send(validData);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Unexpected failure' });
    });
});
