import { Router } from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import { isGitHubEnabled, isGoogleEnabled } from '../utils/authProviders.js';

const providersRoute: Router = Router();

providersRoute.get('/providers', (req, res) => {
    const providers = [];

    if (isGitHubEnabled()) {
        providers.push({ id: 'github', label: 'GitHub' });
    }

    if (isGoogleEnabled()) {
        providers.push({ id: 'google', label: 'Google' });
    }

    res.json({ providers });
});

// --- OpenAPI Spec ---
export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/auth/providers': {
        get: {
            summary: 'List enabled auth providers',
            description:
                'Returns a list of OAuth providers (e.g., GitHub, Google) that are currently enabled based on environment config.',
            tags: ['Auth'],
            responses: {
                '200': {
                    description: 'Enabled providers',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    providers: {
                                        type: 'array',
                                        items: {
                                            $ref: '#/components/schemas/AuthProvider'
                                        }
                                    }
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
    AuthProvider: {
        type: 'object',
        required: ['id', 'label'],
        properties: {
            id: {
                type: 'string',
                description: 'Unique ID of the provider (e.g., github, google)'
            },
            label: {
                type: 'string',
                description: 'Human-readable label (e.g., GitHub)'
            }
        }
    }
};

export default providersRoute;
