import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { requestClassifier } from '../../src/middlewares/requestClassifier.js';

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
    requestClassifier(req, _res, next);
});
app.use((req, res) => {
    res.json({
        type: (req as any).apiRequestType,
        projectId: (req as any).apiRequestProjectId
    });
});

describe('requestClassifier', () => {
    it('sets admin for path containing /admin/', async () => {
        const res = await request(app).get('/api/admin/projects');
        expect(res.body.type).toBe('admin');
        expect(res.body.projectId).toBeUndefined();
    });

    it('sets public and projectId for /projects/:id/collections', async () => {
        const res = await request(app).get('/api/projects/my-blog/collections');
        expect(res.body.type).toBe('public');
        expect(res.body.projectId).toBe('my-blog');
    });

    it('sets public and projectId for /projects/:id/collections/:cid/entries', async () => {
        const res = await request(app).get('/api/projects/demo/collections/c1/blog/entries');
        expect(res.body.type).toBe('public');
        expect(res.body.projectId).toBe('demo');
    });

    it('sets public and projectId for /projects/:id/pages', async () => {
        const res = await request(app).get('/projects/foo/pages');
        expect(res.body.type).toBe('public');
        expect(res.body.projectId).toBe('foo');
    });

    it('sets public and projectId for /projects/:id/templates', async () => {
        const res = await request(app).get('/projects/bar/templates');
        expect(res.body.type).toBe('public');
        expect(res.body.projectId).toBe('bar');
    });

    it('sets null type for non-admin non-public path', async () => {
        const res = await request(app).get('/api/auth/login');
        expect(res.body.type).toBeNull();
        expect(res.body.projectId).toBeUndefined();
    });

    it('strips query string before matching', async () => {
        const res = await request(app).get('/api/projects/p1/collections?apiKey=xxx');
        expect(res.body.type).toBe('public');
        expect(res.body.projectId).toBe('p1');
    });
});
