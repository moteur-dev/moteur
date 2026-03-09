import express, { Router } from 'express';
import { loginUser } from '@moteur/core/auth.js';
import { loginRateLimiter } from '../middlewares/rateLimit.js';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = express.Router();

const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MAX_LENGTH = 4096;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeEmail(value: unknown): string {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length > EMAIL_MAX_LENGTH) return '';
    if (!EMAIL_REGEX.test(trimmed)) return '';
    return trimmed;
}

router.post('/login', loginRateLimiter, async (req: any, res: any) => {
    try {
        const username = sanitizeEmail(req.body?.username);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
        }
        if (password.length > PASSWORD_MAX_LENGTH) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const { token, user } = await loginUser(username, password);
        return res.json({ token, user });
    } catch (err: any) {
        return res.status(401).json({ error: err.message || 'Invalid credentials' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/login': {
        post: {
            summary: 'Login and receive JWT token',
            tags: ['Auth'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginInput' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Successful login',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' },
                                    user: { $ref: '#/components/schemas/User' }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Missing fields or invalid format',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Invalid credentials',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export const schemas: OpenAPIV3.ComponentsObject['schemas'] = {
    LoginInput: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' }
        }
    }
};

export default router;
