import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import authRouter, { authSpecs } from '../../src/auth';
import * as authProviders from '../../src/utils/authProviders';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('auth/index route wiring', () => {
    it('should expose core routes like /auth/login and /auth/me', async () => {
        const loginRes = await request(app)
            .post('/auth/login')
            .send({ username: 'test@example.com', password: 'x' });
        const meRes = await request(app).get('/auth/me');

        expect([400, 401]).toContain(loginRes.status);
        expect([401, 403]).toContain(meRes.status);
    });

    it('should expose /auth/github and /auth/google and return 503 when OAuth not configured', async () => {
        // Mock both as disabled
        vi.spyOn(authProviders, 'isGitHubEnabled').mockReturnValue(false);
        vi.spyOn(authProviders, 'isGoogleEnabled').mockReturnValue(false);

        const appWithoutSocial = express();
        appWithoutSocial.use('/auth', (await import('../../src/auth')).default);

        const githubRes = await request(appWithoutSocial).get('/auth/github');
        const googleRes = await request(appWithoutSocial).get('/auth/google');

        expect(githubRes.status).toBe(503);
        expect(googleRes.status).toBe(503);
    });
});

describe('authSpecs export', () => {
    it('should contain merged OpenAPI paths and schemas', () => {
        expect(authSpecs).toHaveProperty('paths');
        expect(authSpecs.paths).toHaveProperty('/auth/login');
        expect(authSpecs.paths).toHaveProperty('/auth/providers');
        expect(authSpecs).toHaveProperty('schemas');
        expect(authSpecs.schemas).toHaveProperty('LoginInput');
    });
});
