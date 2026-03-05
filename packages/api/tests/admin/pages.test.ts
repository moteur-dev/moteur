import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/middlewares/auth.js', () => ({
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'user1', roles: ['editor'] };
        next();
    }
}));

vi.mock('@moteur/core/pages.js', () => ({
    listPages: vi.fn(),
    getPageWithAuth: vi.fn(),
    getPageBySlug: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
    validatePageById: vi.fn(),
    validateAllPages: vi.fn()
}));

vi.mock('@moteur/core/reviews.js', () => ({
    submitForPageReview: vi.fn()
}));

import adminPagesRouter from '../../src/admin/pages/index.js';
import {
    listPages,
    getPageWithAuth,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    validatePageById,
    validateAllPages
} from '@moteur/core/pages.js';
import { submitForPageReview } from '@moteur/core/reviews.js';

const app = express();
app.use(express.json());
app.use('/admin/projects/:projectId/pages', adminPagesRouter);

const base = '/admin/projects/demo/pages';

const mockPage = {
    id: 'page1',
    projectId: 'demo',
    templateId: 't1',
    label: 'Home',
    status: 'published' as const,
    fields: {},
    createdAt: '',
    updatedAt: ''
};

describe('Admin pages', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET / should return list of pages', async () => {
        (listPages as any).mockResolvedValue([mockPage]);

        const res = await request(app).get(base);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([mockPage]);
        expect(listPages).toHaveBeenCalledWith('demo', {
            templateId: undefined,
            parentId: undefined,
            status: undefined
        });
    });

    it('GET /by-slug/:slug should return page', async () => {
        (getPageBySlug as any).mockResolvedValue(mockPage);

        const res = await request(app).get(`${base}/by-slug/home`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPage);
        expect(getPageBySlug).toHaveBeenCalledWith('demo', 'home');
    });

    it('GET /:id should return page', async () => {
        (getPageWithAuth as any).mockResolvedValue(mockPage);

        const res = await request(app).get(`${base}/page1`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockPage);
        expect(getPageWithAuth).toHaveBeenCalledWith(expect.any(Object), 'demo', 'page1');
    });

    it('POST / should create page and return 201', async () => {
        const body = {
            templateId: 't1',
            label: 'New',
            projectId: 'demo',
            fields: {},
            status: 'draft'
        };
        (createPage as any).mockResolvedValue({ ...mockPage, ...body, id: 'new-id' });

        const res = await request(app).post(base).send(body);

        expect(res.status).toBe(201);
        expect(createPage).toHaveBeenCalledWith(
            'demo',
            expect.any(Object),
            expect.objectContaining({ templateId: 't1', label: 'New' })
        );
    });

    it('PATCH /:id should update page', async () => {
        (updatePage as any).mockResolvedValue({ ...mockPage, label: 'Updated' });

        const res = await request(app).patch(`${base}/page1`).send({ label: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.label).toBe('Updated');
        expect(updatePage).toHaveBeenCalledWith('demo', expect.any(Object), 'page1', {
            label: 'Updated'
        });
    });

    it('DELETE /:id should return 204', async () => {
        (deletePage as any).mockResolvedValue(undefined);

        const res = await request(app).delete(`${base}/page1`);

        expect(res.status).toBe(204);
        expect(deletePage).toHaveBeenCalledWith('demo', expect.any(Object), 'page1');
    });

    it('PATCH /:id/status should update status', async () => {
        (updatePage as any).mockResolvedValue({ ...mockPage, status: 'published' });

        const res = await request(app).patch(`${base}/page1/status`).send({ status: 'published' });

        expect(res.status).toBe(200);
        expect(updatePage).toHaveBeenCalledWith('demo', expect.any(Object), 'page1', {
            status: 'published'
        });
    });

    it('POST /:id/submit-review should return 201', async () => {
        (submitForPageReview as any).mockResolvedValue({ id: 'review-1', status: 'pending' });

        const res = await request(app).post(`${base}/page1/submit-review`).send({});

        expect(res.status).toBe(201);
        expect(submitForPageReview).toHaveBeenCalledWith(
            'demo',
            expect.any(Object),
            'page1',
            undefined
        );
    });

    it('POST /:id/validate should return validation result', async () => {
        (validatePageById as any).mockResolvedValue({ valid: true, issues: [] });

        const res = await request(app).post(`${base}/page1/validate`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ valid: true, issues: [] });
        expect(validatePageById).toHaveBeenCalledWith('demo', 'page1');
    });

    it('POST /validate-all should return validation results', async () => {
        (validateAllPages as any).mockResolvedValue([{ valid: true, issues: [] }]);

        const res = await request(app).post(`${base}/validate-all`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([{ valid: true, issues: [] }]);
        expect(validateAllPages).toHaveBeenCalledWith('demo');
    });
});
