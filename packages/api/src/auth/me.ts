import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import type { OpenAPIV3 } from 'openapi-types';

const router: Router = Router();

router.get('/me', requireAuth, (req: any, res: any) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Strip out any sensitive fields just in case
    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/me': {
        get: {
            summary: 'Get current authenticated user',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
            responses: {
                '200': {
                    description: 'Current user',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    user: { $ref: '#/components/schemas/User' }
                                }
                            }
                        }
                    }
                },
                '401': {
                    description: 'Unauthorized',
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
