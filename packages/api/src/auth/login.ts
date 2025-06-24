import express, { Router } from 'express';
import { loginUser } from '@moteur/core/auth';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = express.Router();

router.post('/login', async (req: any, res: any) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing username or password' });
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
