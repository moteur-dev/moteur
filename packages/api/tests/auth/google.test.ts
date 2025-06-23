import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@moteur/core/users', () => ({
    getUserByEmail: vi.fn(),
    createUser: vi.fn()
}));

vi.mock('jsonwebtoken', () => {
    return {
        sign: vi.fn().mockReturnValue('mock-jwt-token'),
        default: {
            sign: vi.fn().mockReturnValue('mock-jwt-token')
        }
    };
});

vi.mock('axios', async () => {
    const actual = await vi.importActual<typeof import('axios')>('axios');
    const mocked = {
        ...actual,
        post: vi.fn(),
        get: vi.fn()
    };

    // Simulate a CommonJS-style default export (used by "import axios from 'axios'")
    return {
        ...mocked,
        default: mocked
    };
});

import { getUserByEmail, createUser } from '@moteur/core/users';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import googleRoute from '../../src/auth/google';

const app = express();
app.use('/auth', googleRoute);

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    process.env.AUTH_GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.AUTH_GOOGLE_CLIENT_SECRET = 'test-secret';
    process.env.AUTH_GOOGLE_REDIRECT_URI = 'http://localhost/auth/google/callback';
    process.env.JWT_SECRET = 'super-secret';
    process.env.AUTH_REDIRECT_AFTER_LOGIN = '/redirect-success';

    vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('GET /auth/google', () => {
    it('should redirect to Google OAuth login screen', async () => {
        const res = await request(app).get('/auth/google');
        expect(res.status).toBe(302);
        expect(res.headers.location).toMatch(
            /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/
        );
    });
});

describe('GET /auth/google/callback', () => {
    it('should return 400 if code is missing', async () => {
        const res = await request(app).get('/auth/google/callback');
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Missing code' });
    });

    it('should create user and redirect with token if user does not exist', async () => {
        (axios.post as any).mockResolvedValueOnce({
            data: { access_token: 'fake-google-token' }
        });
        (axios.get as any).mockResolvedValueOnce({
            data: {
                sub: 'google-sub-id',
                email: 'newuser@example.com',
                name: 'New User',
                picture: 'https://example.com/avatar.jpg'
            }
        });
        (getUserByEmail as any).mockResolvedValueOnce(null);
        (createUser as any).mockResolvedValueOnce(undefined);

        const res = await request(app).get('/auth/google/callback').query({ code: 'valid-code' });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/redirect-success?token=mock-jwt-token');

        expect(createUser).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalledWith(
            expect.objectContaining({
                sub: expect.stringMatching(/^user:/),
                email: 'newuser@example.com'
            }),
            'super-secret',
            expect.objectContaining({ expiresIn: '1d' })
        );
    });

    it('should use existing user and redirect with token', async () => {
        (axios.post as any).mockResolvedValueOnce({
            data: { access_token: 'token-abc' }
        });
        (axios.get as any).mockResolvedValueOnce({
            data: {
                sub: 'existing-sub',
                email: 'existing@example.com',
                name: 'Existing User'
            }
        });
        (getUserByEmail as any).mockResolvedValueOnce({
            id: 'user:existing',
            email: 'existing@example.com'
        });

        const res = await request(app).get('/auth/google/callback').query({ code: 'valid-code' });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/redirect-success?token=mock-jwt-token');
        expect(createUser).not.toHaveBeenCalled();
    });

    it('should return 500 if axios throws', async () => {
        (axios.post as any).mockRejectedValueOnce(new Error('axios fail'));

        const res = await request(app).get('/auth/google/callback').query({ code: 'bad-code' });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Google login failed' });
    });
});
