import express, { Router } from 'express';
import { generateJWT } from '@moteur/core/auth';
import { requireAuth } from '../middlewares/auth';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = express.Router();

router.post('/refresh', requireAuth, async (req: any, res: any) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.json({ token: generateJWT(user) });
    } catch (err: any) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/refresh': {
        post: {
            summary: 'Refresh the JWT',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'New JWT token',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    token: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized or invalid user',
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

export default router;
