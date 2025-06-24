import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import openapiRouter from '../src/openapi';
import { baseSpec } from '../src/openapi';

// Mock mergePluginSpecs to return a modified version of baseSpec
vi.mock('../src/utils/mergePluginSpecs', () => ({
    mergePluginSpecs: vi.fn()
}));

const { mergePluginSpecs } = await import('../src/utils/mergePluginSpecs');

describe('GET /openapi.json', () => {
    const app = express();
    app.use(openapiRouter);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return merged OpenAPI spec', async () => {
        const fakeSpec = {
            ...baseSpec,
            info: { ...baseSpec.info, title: 'Mocked Moteur API' },
            paths: { '/test': { get: { summary: 'Test route' } } }
        };

        (mergePluginSpecs as any).mockResolvedValue(fakeSpec);

        const res = await request(app).get('/openapi.json');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('openapi', '3.0.0');
        expect(res.body.info.title).toBe('Mocked Moteur API');
        expect(res.body.paths).toHaveProperty('/test');
        expect(mergePluginSpecs).toHaveBeenCalledWith(baseSpec);
    });
});
