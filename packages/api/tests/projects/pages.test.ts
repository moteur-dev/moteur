import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@moteur/core/pages.js', () => ({
    listPages: vi.fn(),
    getPage: vi.fn(),
    getPageBySlug: vi.fn()
}));

import publicPagesRouter from '../../src/projects/pages/public.js';
import { listPages, getPage, getPageBySlug } from '@moteur/core/pages.js';

const app = express();
app.use(express.json());
app.use('/projects/:projectId/pages', publicPagesRouter);

describe('GET /projects/:projectId/pages (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return only published pages', async () => {
        const mockPages = [
            {
                id: 'p1',
                projectId: 'demo',
                templateId: 't1',
                label: 'Home',
                status: 'published',
                fields: {},
                createdAt: '',
                updatedAt: ''
            }
        ];
        (listPages as any).mockResolvedValue(mockPages);

        const res = await request(app).get('/projects/demo/pages');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPages);
        expect(listPages).toHaveBeenCalledWith('demo', {
            templateId: undefined,
            parentId: undefined,
            status: 'published'
        });
    });

    it('should return 500 if listPages throws', async () => {
        (listPages as any).mockRejectedValue(new Error('Boom'));

        const res = await request(app).get('/projects/demo/pages');

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });
});

describe('GET /projects/:projectId/pages/:id (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 if page is not published', async () => {
        (getPage as any).mockResolvedValue({
            id: 'p1',
            projectId: 'demo',
            templateId: 't1',
            label: 'Draft',
            status: 'draft',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        const res = await request(app).get('/projects/demo/pages/p1');

        expect(res.status).toBe(404);
        expect(res.body.error).toContain('not found');
    });

    it('should return page when published', async () => {
        const mockPage = {
            id: 'p1',
            projectId: 'demo',
            templateId: 't1',
            label: 'Home',
            status: 'published',
            fields: {},
            createdAt: '',
            updatedAt: ''
        };
        (getPage as any).mockResolvedValue(mockPage);

        const res = await request(app).get('/projects/demo/pages/p1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPage);
    });
});

describe('GET /projects/:projectId/pages/by-slug/:slug (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 404 when page not found by slug', async () => {
        (getPageBySlug as any).mockResolvedValue(null);

        const res = await request(app).get('/projects/demo/pages/by-slug/missing');

        expect(res.status).toBe(404);
    });

    it('should return 404 when page exists but not published', async () => {
        (getPageBySlug as any).mockResolvedValue({
            id: 'p1',
            slug: 'about',
            status: 'draft',
            projectId: 'demo',
            templateId: 't1',
            label: 'About',
            fields: {},
            createdAt: '',
            updatedAt: ''
        });

        const res = await request(app).get('/projects/demo/pages/by-slug/about');

        expect(res.status).toBe(404);
    });

    it('should return page when found and published', async () => {
        const mockPage = {
            id: 'p1',
            slug: 'about',
            status: 'published',
            projectId: 'demo',
            templateId: 't1',
            label: 'About',
            fields: {},
            createdAt: '',
            updatedAt: ''
        };
        (getPageBySlug as any).mockResolvedValue(mockPage);

        const res = await request(app).get('/projects/demo/pages/by-slug/about');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPage);
    });
});
