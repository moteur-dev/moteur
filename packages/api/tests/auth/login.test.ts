import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/auth/login';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock loginUser from core
vi.mock('@moteur/core/auth', () => ({
    loginUser: vi.fn()
}));

import { loginUser } from '@moteur/core/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('POST /auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if username or password is missing', async () => {
        const res = await request(app).post('/auth/login').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 200 and token/user if credentials are valid', async () => {
        // Mock success
        (loginUser as any).mockResolvedValue({
            token: 'fake-jwt-token',
            user: { id: 'user123', username: 'tester' }
        });

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'tester', password: 'password' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            token: 'fake-jwt-token',
            user: { id: 'user123', username: 'tester' }
        });
    });

    it('should return 401 if credentials are invalid', async () => {
        (loginUser as any).mockRejectedValue(new Error('Invalid credentials'));

        const res = await request(app)
            .post('/auth/login')
            .send({ username: 'tester', password: 'wrongpass' });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid credentials' });
    });
});
