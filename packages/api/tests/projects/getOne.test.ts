import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../src/middlewares/auth', () => ({
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    }
}));

vi.mock('@moteur/core/projects', () => ({
    getProject: vi.fn()
}));

import getOneRoute from '../../src/projects/getOne';
import { getProject } from '@moteur/core/projects';

const app = express();
app.use(express.json());
app.use('/projects', getOneRoute);

describe('GET /projects/:projectId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return a project if found', async () => {
        const mockProject = {
            id: 'site1',
            label: 'My Site',
            description: 'Cool project'
        };

        (getProject as any).mockReturnValue(mockProject);

        const res = await request(app).get('/projects/site1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ project: mockProject });
        expect(getProject).toHaveBeenCalledWith({ id: 'admin1', role: 'admin' }, 'site1');
    });

    it('should return 404 if project is not found', async () => {
        (getProject as any).mockReturnValue(null);

        const res = await request(app).get('/projects/unknown');
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Project not found' });
    });
});
