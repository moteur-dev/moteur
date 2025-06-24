import request from 'supertest';
import express from 'express';
import providersRoute from '../../src/auth/providers';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 🧪 Mock authProviders utils
vi.mock('../../src/utils/authProviders', () => ({
    isGitHubEnabled: vi.fn(),
    isGoogleEnabled: vi.fn()
}));

import { isGitHubEnabled, isGoogleEnabled } from '../../src/utils/authProviders';

const app = express();
app.use('/auth', providersRoute);

describe('GET /auth/providers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return both GitHub and Google if both are enabled', async () => {
        (isGitHubEnabled as any).mockReturnValue(true);
        (isGoogleEnabled as any).mockReturnValue(true);

        const res = await request(app).get('/auth/providers');
        expect(res.status).toBe(200);
        expect(res.body.providers).toEqual([
            { id: 'github', label: 'GitHub' },
            { id: 'google', label: 'Google' }
        ]);
    });

    it('should return only GitHub if Google is disabled', async () => {
        (isGitHubEnabled as any).mockReturnValue(true);
        (isGoogleEnabled as any).mockReturnValue(false);

        const res = await request(app).get('/auth/providers');
        expect(res.status).toBe(200);
        expect(res.body.providers).toEqual([{ id: 'github', label: 'GitHub' }]);
    });

    it('should return an empty array if none are enabled', async () => {
        (isGitHubEnabled as any).mockReturnValue(false);
        (isGoogleEnabled as any).mockReturnValue(false);

        const res = await request(app).get('/auth/providers');
        expect(res.status).toBe(200);
        expect(res.body.providers).toEqual([]);
    });
});
