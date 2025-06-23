import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import projectsRouter, { projectsSpecs } from '../../src/projects';

// fake middleware override to inject user
vi.mock('../../src/middlewares/auth', () => ({
    requireAdmin: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    },
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    },
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/projects', projectsRouter);

describe('projects/index route wiring', () => {
    it('should register core routes like /projects and /projects/:projectId', async () => {
        // All of these are smoke-tested: expect either 200, 400 or 404 (but not 500)
        const endpoints = [
            { method: 'get', path: '/projects' },
            { method: 'get', path: '/projects/foo' },
            { method: 'post', path: '/projects' },
            { method: 'patch', path: '/projects/foo' },
            { method: 'delete', path: '/projects/foo' }
        ];

        for (const { method, path } of endpoints) {
            const res = await request(app)[method](path).send({});
            console.log(`Testing ${method.toUpperCase()} ${path} - Status: ${res.status}`);
            expect([200, 400, 404]).toContain(res.status);
        }
    });
});

describe('projectsSpecs export', () => {
    it('should include all expected OpenAPI paths and schemas', () => {
        expect(projectsSpecs.paths).toHaveProperty('/projects');
        expect(projectsSpecs.paths).toHaveProperty('/projects/{projectId}');
        expect(projectsSpecs.schemas).toHaveProperty('NewProjectInput');
    });
});
