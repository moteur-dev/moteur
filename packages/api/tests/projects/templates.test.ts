import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@moteur/core/templates.js', () => ({
    listTemplates: vi.fn(),
    getTemplate: vi.fn()
}));

import publicTemplatesRouter from '../../src/projects/templates/public.js';
import { listTemplates, getTemplate } from '@moteur/core/templates.js';

const app = express();
app.use(express.json());
app.use('/projects/:projectId/templates', publicTemplatesRouter);

describe('GET /projects/:projectId/templates (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return list of templates', async () => {
        const mockTemplates = [
            {
                id: 'landing',
                label: 'Landing Page',
                projectId: 'demo',
                fields: {},
                createdAt: '',
                updatedAt: ''
            },
            {
                id: 'blog',
                label: 'Blog Post',
                projectId: 'demo',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ];
        (listTemplates as any).mockResolvedValue(mockTemplates);

        const res = await request(app).get('/projects/demo/templates');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTemplates);
        expect(listTemplates).toHaveBeenCalledWith('demo');
    });

    it('should return 500 if listTemplates throws', async () => {
        (listTemplates as any).mockRejectedValue(new Error('Boom'));

        const res = await request(app).get('/projects/demo/templates');

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});

describe('GET /projects/:projectId/templates/:id (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return template by id', async () => {
        const mockTemplate = {
            id: 'landing',
            label: 'Landing',
            projectId: 'demo',
            fields: {},
            createdAt: '',
            updatedAt: ''
        };
        (getTemplate as any).mockResolvedValue(mockTemplate);

        const res = await request(app).get('/projects/demo/templates/landing');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTemplate);
        expect(getTemplate).toHaveBeenCalledWith('demo', 'landing');
    });

    it('should return 404 if template not found', async () => {
        (getTemplate as any).mockRejectedValue(new Error('Template "x" not found'));

        const res = await request(app).get('/projects/demo/templates/x');

        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });
});
