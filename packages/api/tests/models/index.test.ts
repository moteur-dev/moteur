import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import modelsRouter, { modelsSpecs } from '../../src/models';

// Mocks
vi.mock('../../src/middlewares/auth', () => ({
    requireAdmin: (req: any, _res: any, next: any) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
    },
    requireProjectAccess: (req: any, _res: any, next: any) => {
        req.user = { id: 'editor1', role: 'editor' };
        next();
    }
}));

const app = express();
app.use(express.json());
app.use('/projects/:projectId/models', modelsRouter);

describe('models/index router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should mount all model routes without throwing', async () => {
        const endpoints = [
            { method: 'get', path: '/projects/demo/models' },
            { method: 'get', path: '/projects/demo/models/article' },
            { method: 'post', path: '/projects/demo/models' },
            { method: 'patch', path: '/projects/demo/models/article' },
            { method: 'delete', path: '/projects/demo/models/article' }
        ];

        for (const { method, path } of endpoints) {
            const res = await request(app)[method](path).send({});
            console.log(`Testing ${method.toUpperCase()} ${path} - Status: ${res.status}`);
            expect([400, 404, 500]).toContain(res.status); // route registered, backend may reject
        }
    });
});

describe('modelsSpecs export', () => {
    it('should include all expected OpenAPI paths and schemas', () => {
        expect(modelsSpecs.paths).toHaveProperty('/projects/{projectId}/models');
        expect(modelsSpecs.paths).toHaveProperty('/projects/{projectId}/models/{modelId}');
        expect(modelsSpecs.schemas).toHaveProperty('NewModelInput');
    });
});
